import { pgTable, serial, integer, timestamp, decimal, index } from 'drizzle-orm/pg-core';
import { dialysisSessions } from './dialysisSessions';

export const sessionVitals = pgTable('session_vitals', {
    id: serial('vital_id').primaryKey(),
    sessionId: integer('session_id').notNull().references(() => dialysisSessions.id, { onDelete: 'cascade' }),
    recordedTime: timestamp('recorded_time'),

    systolicBp: integer('systolic_bp'),
    diastolicBp: integer('diastolic_bp'),
    heartRate: integer('heart_rate'),
    bodyTemperature: decimal('body_temperature', { precision: 4, scale: 2 }),

    arterialLinePressure: integer('arterial_line_pressure'),
    venousLinePressure: integer('venous_line_pressure'),
    transmembranePressure: integer('transmembrane_pressure'),

    createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
    return {
        idxVitalsSession: index("idx_vitals_session").on(table.sessionId),
    };
});
