import { pgTable, serial, integer, date, timestamp, decimal, index } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const labResults = pgTable('lab_results', {
    id: serial('lab_id').primaryKey(),
    patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
    testDate: date('test_date').notNull(),

    hemoglobin: decimal('hemoglobin', { precision: 4, scale: 2 }),
    albumin: decimal('albumin', { precision: 4, scale: 2 }),
    potassium: decimal('potassium', { precision: 4, scale: 2 }),
    sodium: decimal('sodium', { precision: 5, scale: 2 }),
    calcium: decimal('calcium', { precision: 4, scale: 2 }),
    phosphorus: decimal('phosphorus', { precision: 4, scale: 2 }),
    urea: decimal('urea', { precision: 6, scale: 2 }),
    creatinine: decimal('creatinine', { precision: 6, scale: 2 }),
    bicarbonate: decimal('bicarbonate', { precision: 4, scale: 2 }),
    ferritin: decimal('ferritin', { precision: 6, scale: 2 }),

    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        idxLabPatient: index("idx_lab_patient").on(table.patientId),
    };
});
