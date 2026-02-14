import { pgTable, serial, integer, varchar, date, boolean, timestamp } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const medications = pgTable('medications', {
    id: serial('medication_id').primaryKey(),
    patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),

    drugName: varchar('drug_name', { length: 100 }),
    category: varchar('category', { length: 50 }),
    dose: varchar('dose', { length: 50 }),
    frequency: varchar('frequency', { length: 50 }),
    route: varchar('route', { length: 50 }),

    startDate: date('start_date'),
    endDate: date('end_date'),
    active: boolean('active').default(true),

    createdAt: timestamp('created_at').defaultNow(),
});
