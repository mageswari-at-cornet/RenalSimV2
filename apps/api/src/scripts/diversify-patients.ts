
import { db } from '../db';
import { patients, labResults, vascularAccess } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

async function main() {
    console.log('🔄 Diversifying Patient Data...');

    const allPatients = await db.query.patients.findMany({
        with: {
            vascularAccess: true,
            labResults: { orderBy: [desc(labResults.testDate)], limit: 1 }
        }
    });

    // Patterns to assign
    const profiles = [
        { type: 'High Risk', albumin: '3.1', access: 'CVC', riskLabel: 'High' },
        { type: 'Medium Risk', albumin: '3.5', access: 'AVG', riskLabel: 'Medium' },
        { type: 'Low Risk', albumin: '4.1', access: 'AVF', riskLabel: 'Low' },
        { type: 'Crasher', albumin: '2.9', access: 'CVC', riskLabel: 'High' },
        { type: 'Stable', albumin: '3.9', access: 'AVF', riskLabel: 'Low' },
        { type: 'Non-Adherent', albumin: '3.6', access: 'AVG', riskLabel: 'Medium' },
    ];

    for (const [index, p] of allPatients.entries()) {
        const profile = profiles[index % profiles.length];
        console.log(`Updating ${p.firstName} ${p.lastName} -> ${profile.type} (Alb: ${profile.albumin}, Acc: ${profile.access})`);

        // 1. Update Albumin (Biggest driver)
        // Check if labs exist, otherwise insert
        if (p.labResults.length > 0) {
            await db.update(labResults)
                .set({ albumin: profile.albumin })
                .where(eq(labResults.id, p.labResults[0].id));
        } else {
            await db.insert(labResults).values({
                patientId: p.id,
                testDate: '2026-02-14',
                hemoglobin: '10.5',
                albumin: profile.albumin,
                potassium: '4.5',
                sodium: '138',
                calcium: '8.9',
                phosphorus: '5.2',
                urea: '120',
                creatinine: '9.5',
                bicarbonate: '22',
                ferritin: '300'
            });
        }

        // 2. Update Access Type
        if (p.vascularAccess.length > 0) {
            await db.update(vascularAccess)
                .set({ accessType: profile.access })
                .where(eq(vascularAccess.id, p.vascularAccess[0].id));
        } else {
            await db.insert(vascularAccess).values({
                patientId: p.id,
                accessType: profile.access,
                location: 'Left Arm',
                createdDate: '2024-01-01',
                status: 'Active'
            });
        }

        const calculateAge = (dobString: string | null) => {
            if (!dobString) return 60;
            const dob = new Date(dobString);
            const diffMs = Date.now() - dob.getTime();
            const ageDt = new Date(diffMs);
            return Math.abs(ageDt.getUTCFullYear() - 1970);
        };
        const age = calculateAge(p.dob);

        // 3. Recalculate Baseline Risk (Formula)
        // Base Risk: 2.0%
        // + Age > 65: 3.0%
        // + Albumin < 3.5: 8.0%
        // + CVC: 5.0%
        let baseMortality30d = 2.0;
        if (age > 65) baseMortality30d += 3.0;
        if (Number(profile.albumin) < 3.5) baseMortality30d += 8.0;
        if (profile.access === 'CVC') baseMortality30d += 5.0;

        const baseMortality90d = baseMortality30d * 2.5; // Approx scaling
        const baseMortality1yr = baseMortality30d * 4.0; // Approx scaling
        const baseHospitalization30d = baseMortality30d * 0.8; // Correlation

        // Update Patient Risk Level Label AND Baseline Numbers
        await db.update(patients)
            .set({
                riskLevel: profile.riskLabel as 'Low' | 'Medium' | 'High',
                mortalityRisk: {
                    '30d': baseMortality30d,
                    '90d': baseMortality90d,
                    '1yr': baseMortality1yr
                },
                hospitalizationRisk: {
                    '30d': baseHospitalization30d
                }
            })
            .where(eq(patients.id, p.id));
    }

    console.log('✅ Done! Patient data diversified.');
    process.exit(0);
}

main();
