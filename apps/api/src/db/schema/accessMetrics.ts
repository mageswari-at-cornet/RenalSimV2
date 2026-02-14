import { pgTable, serial, integer, date, timestamp } from 'drizzle-orm/pg-core';
import { vascularAccess } from './vascularAccess';

export const accessMetrics = pgTable('access_metrics', {
    id: serial('metric_id').primaryKey(),
    accessId: integer('access_id').notNull().references(() => vascularAccess.id, { onDelete: 'cascade' }),

    arterialPressure: integer('arterial_pressure'),
    venousPressure: integer('venous_pressure'),
    flowRate: integer('flow_rate'),

    recordedDate: date('recorded_date'),

    createdAt: timestamp('created_at').defaultNow(),
});
