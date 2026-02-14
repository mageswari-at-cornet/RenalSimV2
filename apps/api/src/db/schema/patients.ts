import { pgTable, serial, varchar, date, boolean, timestamp, integer, json } from 'drizzle-orm/pg-core';

export const patients = pgTable('patients', {
    id: serial('patient_id').primaryKey(),
    mrn: varchar('mrn', { length: 50 }).unique().notNull(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    sex: varchar('sex', { length: 10 }),

    dob: date('date_of_birth'),
    phone: varchar('phone', { length: 20 }),
    riskLevel: varchar('risk_level', { length: 20 }).$type<'Low' | 'Medium' | 'High'>(),

    // New fields
    primaryDiagnosis: varchar('primary_diagnosis', { length: 255 }),
    dialysisVintage: integer('dialysis_vintage'), // Months on HD
    scheduleDaysPerWeek: integer('schedule_days_per_week').default(3),
    scheduleDurationMinutes: integer('schedule_duration_minutes').default(240),
    archetype: varchar('archetype', { length: 255 }),
    center: varchar('center', { length: 50 }),

    active: boolean('active').default(true),
    createdAt: timestamp('created_at').defaultNow(),

    // Risk Assessment Fields (JSON)
    mortalityRisk: json('mortality_risk').$type<{
        '30d': number;
        '90d': number;
        '1yr': number;
    }>(),
    hospitalizationRisk: json('hospitalization_risk').$type<{
        '30d': number;
    }>(),
    mortalityDelta: json('mortality_delta').$type<{
        '30d': number;
        '90d': number;
        '1yr': number;
    }>(),
});

