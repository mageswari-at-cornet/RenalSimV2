import { db } from './index';
import {
    patients,
    dialysisSessions,
    labResults,
    medications,
    vascularAccess,
    accessMetrics,
    sessionVitals
} from './schema';

function kt(v: number) {
    return (v / 50).toFixed(2); // convert dataset KT → clinical KT
}

async function main() {
    console.log('🌱 Seeding 6 dialysis patients...');

    try {
        await db.delete(patients);

        // ---------- PATIENT DATA ----------
        const seedPatients = [
            { mrn: 'HD-1074', firstName: 'James', lastName: 'Thompson', sex: 'Male', dob: '1957-01-01', diagnosis: 'Diabetic Nephropathy', vintage: 52, archetype: 'The Crasher (IDH/HF)', sessionKey: 'HD0101', schedule: { days: 3, mins: 240 } },
            { mrn: 'HD-1077', firstName: 'Mary', lastName: 'Johnson', sex: 'Female', dob: '1971-01-01', diagnosis: 'Diabetic Nephropathy', vintage: 18, archetype: 'The Non-Adherent', sessionKey: 'HD0102', schedule: { days: 3, mins: 210 } },
            { mrn: 'HD-1011', firstName: 'Robert', lastName: 'Smith', sex: 'Male', dob: '1964-01-01', diagnosis: 'Hypertensive Nephropathy', vintage: 28, archetype: 'Inflamed CVC', sessionKey: 'HD0103', schedule: { days: 3, mins: 240 } },
            { mrn: 'HD-1024', firstName: 'Michael', lastName: 'Davis', sex: 'Male', dob: '1953-01-01', diagnosis: 'Diabetic Nephropathy', vintage: 44, archetype: 'The Clotter', sessionKey: 'HD0104', schedule: { days: 3, mins: 240 } },
            { mrn: 'HD-1058', firstName: 'Sarah', lastName: 'Wilson', sex: 'Female', dob: '1967-01-01', diagnosis: 'Glomerulonephritis', vintage: 36, archetype: 'Malnourished/Inflamed', sessionKey: 'HD0105', schedule: { days: 3, mins: 240 } },
            { mrn: 'HD-1003', firstName: 'Jennifer', lastName: 'Brown', sex: 'Female', dob: '1973-01-01', diagnosis: 'Polycystic Kidney Disease', vintage: 24, archetype: 'Stable', sessionKey: 'HD0106', schedule: { days: 3, mins: 240 } },
        ];

        // ---------- SESSION RAW DATA ----------
        const sessionData: any = {
            HD0101: [
                [false, 73, 75.4, 74, 1.4, 35.5, 24.05, 75.3, 450, 798, 14.8, -185, 170, 135, 93, 40, 70, 0.18, 35.9],
                [false, 73, 75.4, 73.8, 1.4, 35.5, 26.53, 74.5, 450, 800, 13.9, -200, 190, 155, 92, 42, 71, 0.17, 36.7],
                [false, 73, 76.6, 74.6, 2.8, 35.5, 25.51, 73.6, 450, 806, 14.1, -200, 185, 190, 80, 35, 83, 0.15, 36.7],
            ],
            HD0102: [
                [false, 46.5, 48, 46.4, 1.5, 36, 29.28, 67.3, 400, 803, 14.6, -170, 130, 155, 128, 60, 84, 0.12, 36.7],
                [false, 46.5, 48, 46.4, 1.6, 36, 28.51, 51, 370, 438, 14.1, -150, 105, 205, 97, 51, 86, 0.12, 36.9],
                [false, 46.5, 49.2, 46.4, 2.8, 36, 26.88, 44, 400, 784, 14, -180, 115, 205, 99, 48, 77, 0.18, 36.5],
            ],
            HD0103: [
                [false, 67, 71.6, 71.4, 4.6, 35.5, 18.29, 34.4, 350, 791, 13.8, -140, 100, 155, 168, 30, 67, 0.23, 36.5],
                [true, 67, 67.6, 67.2, 0.6, 35.5, 32.91, 53.8, 350, 792, 13.6, -160, 90, 200, 178, 38, 68, 0.06, 36.3],
                [false, 67, 69.2, 67.4, 2, 35.5, 31.34, 60.7, 350, 487, 13.5, -135, 110, 90, 156, 50, 76, 0.13, 36.5],
            ],
            HD0104: [
                [false, 95.5, 97.4, 95.6, 1.9, 35.5, 18.48, 46.6, 400, 474, 13.9, -245, 155, 85, 139, 88, 65, 0.07, 36.6],
                [false, 95.5, 97.2, 95.6, 1.6, 35.5, 22.82, 55.7, 380, 462, 13.8, -190, 135, 120, 125, 77, 66, 0.12, 36.3],
                [false, 95.5, 95, 95, -2.6, 35.5, 20.43, 50.5, 350, 418, 13.9, -240, 120, 110, 143, 84, 90, 0.04, 37.2],
            ],
            HD0105: [
                [false, 59, 58.8, 59, -0.4, 35.5, 32.07, 65.2, 350, 791, 13.7, -145, 140, 160, 158, 103, 72, 0.01, 36.4],
                [false, 58, 61.2, 58, 2.2, 35.5, 27.45, 65.1, 350, 797, 13.7, -190, 145, 155, 145, 90, 88, 0.22, 36.7],
                [false, 57, 60.6, 58.4, 3.4, 35.5, 24.9, 57.2, 350, 806, 14, -155, 165, 170, 149, 94, 86, 0.17, 36.7],
            ],
            HD0106: [
                [false, 59, 61.6, 61.4, 2.9, 35.5, 24.56, 49.1, 400, 629, 13.9, -180, 145, 45, 113, 65, 86, 0.04, 36.3],
                [false, 59, 64.4, 62.2, 3, 35.5, 23.53, 52, 350, 796, 13.8, -175, 145, 115, 102, 49, 77, 0.26, 36.4],
                [true, 61.5, 64, 61.6, 1.8, 35.5, 27.11, 61.3, 400, 476, 14, -205, 190, 135, 112, 57, 71, 0.18, 36.3],
            ],
        };

        const accessTypes = ['CVC', 'AVF', 'AVG'];

        // ---------- LOOP ----------
        for (const [index, p] of seedPatients.entries()) {


            const [patient] = await db.insert(patients).values({
                mrn: p.mrn,
                firstName: p.firstName,
                lastName: p.lastName,
                sex: p.sex,
                dob: p.dob,
                phone: '9999999999',
                riskLevel: 'Medium',
                active: true,
                primaryDiagnosis: p.diagnosis,
                dialysisVintage: p.vintage,
                scheduleDaysPerWeek: 3,
                scheduleDurationMinutes: p.schedule.mins,
                archetype: p.archetype
            }).returning();

            const [access] = await db.insert(vascularAccess).values({
                patientId: patient.id,
                accessType: accessTypes[index % 3], // Could customize this too if needed, but keeping for now
                location: 'Left Arm',
                createdDate: '2024-01-01',
                status: 'Active'
            }).returning();

            let day = 1;

            if (sessionData[p.sessionKey]) {
                for (const s of sessionData[p.sessionKey]) {

                    const [hypo, dry, pre, post, gain, tempBath, rep, ktRaw, bfr, dfr, cond, ap, vp, ptm, tas, tad, pulse, uf, temp] = s;

                    const [session] = await db.insert(dialysisSessions).values({
                        patientId: patient.id,
                        sessionDate: `2026-02-${day++}`,
                        dialysisTechnique: 'HD',
                        dialyzerType: 'Type',
                        dialysateBathType: 'Standard',
                        dryWeight: dry.toString(),
                        preDialysisWeight: pre.toString(),
                        postDialysisWeight: post.toString(),
                        interdialyticWeightGain: gain.toString(),
                        dialysateTemperature: tempBath.toString(),
                        replacementVolume: rep.toString(),
                        dialysisDoseKt: kt(ktRaw),
                        bloodFlowRate: bfr,
                        dialysateFlowRate: dfr,
                        dialysateConductivity: cond.toString(),
                        bicarbonateConductivity: '0',
                        ultrafiltrationRate: uf.toString(),
                        intradialyticHypotension: hypo
                    }).returning();

                    await db.insert(sessionVitals).values({
                        sessionId: session.id,
                        systolicBp: tas,
                        diastolicBp: tad,
                        heartRate: pulse,
                        bodyTemperature: temp.toString(),
                        arterialLinePressure: ap,
                        venousLinePressure: vp,
                        transmembranePressure: ptm
                    });

                    await db.insert(accessMetrics).values({
                        accessId: access.id,
                        arterialPressure: ap,
                        venousPressure: vp,
                        flowRate: bfr,
                        recordedDate: `2026-02-0${day}`
                    });
                }
            }

            // Labs - Vary based on archetype
            const isMalnourished = p.archetype.includes('Malnourished') || p.archetype.includes('Crasher');
            const isInflamed = p.archetype.includes('Inflamed');

            await db.insert(labResults).values({
                patientId: patient.id,
                testDate: '2026-02-01',
                hemoglobin: isInflamed ? '9.2' : '10.5',
                albumin: isMalnourished ? '3.2' : '3.8',
                potassium: p.archetype.includes('Non-Adherent') ? '6.1' : '4.5',
                sodium: '138',
                calcium: '8.9',
                phosphorus: p.archetype.includes('Non-Adherent') ? '7.2' : '5.2',
                urea: '120',
                creatinine: '9.5',
                bicarbonate: '22',
                ferritin: isInflamed ? '800' : '300'
            });

            // Meds
            await db.insert(medications).values([
                { patientId: patient.id, drugName: 'Sevelamer', category: 'Phosphate Binders', dose: '800mg', frequency: 'TID', route: 'PO' },
                { patientId: patient.id, drugName: 'Iron Sucrose', category: 'Iron Supplements', dose: '100mg', frequency: 'Weekly', route: 'IV' },
                { patientId: patient.id, drugName: 'Vitamin D3', category: 'Vitamin D / MBD', dose: '0.25mcg', frequency: 'Daily', route: 'PO' },
                { patientId: patient.id, drugName: 'Epoetin Alfa', category: 'ESA', dose: '4000 units', frequency: 'TIW', route: 'IV' },
                { patientId: patient.id, drugName: 'Lisinopril', category: 'BP Medications', dose: '10mg', frequency: 'Daily', route: 'PO' }
            ]);
        }

        console.log('✅ Done!');
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

main();
