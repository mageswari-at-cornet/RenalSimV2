
import { db } from '../db';
import { labResults, patients } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

async function main() {
    console.log('Syncing 6 months of lab history for all patients...');

    const allPatients = await db.query.patients.findMany();

    // Lab marker configurations with ranges and targets
    const markers = [
        { name: 'Hemoglobin', unit: 'g/dL', base: 10.5, variation: 0.8 },
        { name: 'Potassium', unit: 'mEq/L', base: 4.8, variation: 1.2 },
        { name: 'Sodium', unit: 'mEq/L', base: 138, variation: 4 },
        { name: 'Albumin', unit: 'g/dL', base: 3.6, variation: 0.5 },
        { name: 'Calcium', unit: 'mg/dL', base: 9.0, variation: 0.8 },
        { name: 'Phosphorus', unit: 'mg/dL', base: 5.2, variation: 1.5 },
        { name: 'Urea', unit: 'mg/dL', base: 110, variation: 30 },
        { name: 'Creatinine', unit: 'mg/dL', base: 8.5, variation: 2 },
        { name: 'Bicarbonate', unit: 'mEq/L', base: 22, variation: 4 },
        { name: 'Ferritin', unit: 'ng/mL', base: 450, variation: 150 },
    ];

    const months = ['2025-09-01', '2025-10-01', '2025-11-01', '2025-12-01', '2026-01-01', '2026-02-01'];

    for (const patient of allPatients) {
        console.log(`Processing ${patient.firstName} ${patient.lastName}...`);

        // Delete existing labs to prevent duplicates
        await db.delete(labResults).where(eq(labResults.patientId, patient.id));

        for (const date of months) {
            // Apply unique phenotype-based modifiers
            let potassiumMod = 0;
            let albuminMod = 0;

            if (patient.firstName === 'James' || patient.firstName === 'Michael') {
                potassiumMod = 0.5; // High potassium risk
                albuminMod = -0.4;  // Malnutrition risk
            }

            const getVal = (base: number, varRange: number, mod: number = 0) => {
                const random = Math.random() * varRange - (varRange / 2);
                return (base + mod + random).toFixed(2);
            };

            await db.insert(labResults).values({
                patientId: patient.id,
                testDate: date,
                hemoglobin: getVal(10.5, 0.8),
                potassium: getVal(4.8, 1.2, potassiumMod),
                sodium: getVal(138, 4),
                albumin: getVal(3.6, 0.5, albuminMod),
                calcium: getVal(9.0, 0.8),
                phosphorus: getVal(5.2, 1.5),
                urea: getVal(110, 30),
                creatinine: getVal(8.5, 2),
                bicarbonate: getVal(22, 4),
                ferritin: getVal(450, 150),
            });
        }
    }

    console.log('Successfully synced 6 months of lab history for 6 patients.');
    process.exit(0);
}

main();
