
import { db } from '../db';
import { patients, labResults, vascularAccess } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

async function main() {
    console.log('🔍 Inspecting Patient Data...');

    const allPatients = await db.query.patients.findMany({
        with: {
            vascularAccess: true,
            labResults: {
                orderBy: [desc(labResults.testDate)],
                limit: 1
            }
        }
    });

    console.log(`Found ${allPatients.length} patients.`);

    // Replicate PatientService logic locally to verify
    const calculateRisk = (age: number, accessType: string, albumin: number = 4.0) => {
        let risk = 2.0; // Base
        if (age > 50) risk += (age - 50) * 0.15;
        if (age > 75) risk += (age - 75) * 0.2;
        if (albumin < 3.5) risk += (3.5 - albumin) * 8;
        if (albumin < 3.0) risk += 5;
        if (accessType === 'CVC') risk += 5.0;
        if (accessType === 'AVG') risk += 2.5;
        return Math.min(99, Math.max(1, risk));
    };

    for (const p of allPatients) {
        const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : 0;
        const access = p.vascularAccess[0];
        const accessType = access?.accessType || 'Unknown';
        const labs = p.labResults[0];
        const albumin = labs ? Number(labs.albumin) : 4.0;

        const risk30d = calculateRisk(age, accessType, albumin);

        console.log(`\nPatient: ${p.firstName} ${p.lastName} (${p.mrn})`);
        console.log(`  - Age: ${age}`);
        console.log(`  - Access: ${accessType}`);
        console.log(`  - Albumin: ${albumin}`);
        console.log(`  - Calculated Fallback Risk (30d): ${risk30d.toFixed(1)}%`);
        console.log(`  - Stored Risk Level: ${p.riskLevel}`);
    }

    process.exit(0);
}

main();
