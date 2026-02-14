import { db } from './db';
import { patients } from './db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('Querying patient HD0101...');
    const patient = await db.query.patients.findFirst({
        where: eq(patients.mrn, 'HD0101'),
        with: {
            vascularAccess: {
                with: {
                    accessMetrics: true
                }
            }
        }
    });

    if (!patient) {
        console.log('Patient not found!');
        return;
    }

    console.log('Patient found:', patient.firstName, patient.lastName);
    console.log('Vascular Access:', JSON.stringify(patient.vascularAccess, null, 2));
}

main().catch(console.error).then(() => process.exit(0));
