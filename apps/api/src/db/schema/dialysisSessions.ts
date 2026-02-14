import { pgTable, serial, integer, date, timestamp, varchar, decimal, boolean, index } from 'drizzle-orm/pg-core';
import { patients } from './patients';

export const dialysisSessions = pgTable('dialysis_sessions', {
    id: serial('session_id').primaryKey(),
    patientId: integer('patient_id').notNull().references(() => patients.id, { onDelete: 'cascade' }),
    sessionDate: date('session_date').notNull(),
    startTime: timestamp('start_time'),
    endTime: timestamp('end_time'),

    dialysisTechnique: varchar('dialysis_technique', { length: 50 }),
    dialyzerType: varchar('dialyzer_type', { length: 100 }),
    dialysateBathType: varchar('dialysate_bath_type', { length: 100 }),

    dryWeight: decimal('dry_weight', { precision: 5, scale: 2 }),
    preDialysisWeight: decimal('pre_dialysis_weight', { precision: 5, scale: 2 }),
    postDialysisWeight: decimal('post_dialysis_weight', { precision: 5, scale: 2 }),
    interdialyticWeightGain: decimal('interdialytic_weight_gain', { precision: 5, scale: 2 }),

    dialysateTemperature: decimal('dialysate_temperature', { precision: 4, scale: 2 }),
    replacementVolume: decimal('replacement_volume', { precision: 6, scale: 2 }),

    dialysisDoseKt: decimal('dialysis_dose_kt', { precision: 5, scale: 2 }),

    bloodFlowRate: integer('blood_flow_rate'),
    dialysateFlowRate: integer('dialysate_flow_rate'),
    dialysateConductivity: decimal('dialysate_conductivity', { precision: 4, scale: 2 }),
    bicarbonateConductivity: decimal('bicarbonate_conductivity', { precision: 4, scale: 2 }),

    ultrafiltrationRate: decimal('ultrafiltration_rate', { precision: 5, scale: 2 }),

    intradialyticHypotension: boolean('intradialytic_hypotension'),

    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        idxSessionPatient: index("idx_session_patient").on(table.patientId),
    };
});
