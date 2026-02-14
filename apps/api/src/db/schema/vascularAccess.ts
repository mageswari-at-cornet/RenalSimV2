import { pgTable, serial, integer, varchar, date, timestamp } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const vascularAccess = pgTable('vascular_access', {
    id: serial('access_id').primaryKey(),
    patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),

    accessType: varchar('access_type', { length: 20 }), // CVC / AVF / AVG
    location: varchar('location', { length: 100 }),
    createdDate: date('created_date'),
    status: varchar('status', { length: 50 }),

    createdAt: timestamp('created_at').defaultNow(),
});
