import { relations } from 'drizzle-orm';
import { patients } from './patients';
import { dialysisSessions } from './dialysisSessions';
import { sessionVitals } from './sessionVitals';
import { labResults } from './labResults';
import { medications } from './medications';
import { vascularAccess } from './vascularAccess';
import { accessMetrics } from './accessMetrics';

export const patientsRelations = relations(patients, ({ many }) => ({
    dialysisSessions: many(dialysisSessions),
    labResults: many(labResults),
    medications: many(medications),
    vascularAccess: many(vascularAccess),
}));

export const dialysisSessionsRelations = relations(dialysisSessions, ({ one, many }) => ({
    patient: one(patients, {
        fields: [dialysisSessions.patientId],
        references: [patients.id],
    }),
    sessionVitals: many(sessionVitals),
}));

export const sessionVitalsRelations = relations(sessionVitals, ({ one }) => ({
    session: one(dialysisSessions, {
        fields: [sessionVitals.sessionId],
        references: [dialysisSessions.id],
    }),
}));

export const labResultsRelations = relations(labResults, ({ one }) => ({
    patient: one(patients, {
        fields: [labResults.patientId],
        references: [patients.id],
    }),
}));

export const medicationsRelations = relations(medications, ({ one }) => ({
    patient: one(patients, {
        fields: [medications.patientId],
        references: [patients.id],
    }),
}));

export const vascularAccessRelations = relations(vascularAccess, ({ one, many }) => ({
    patient: one(patients, {
        fields: [vascularAccess.patientId],
        references: [patients.id],
    }),
    accessMetrics: many(accessMetrics),
}));

export const accessMetricsRelations = relations(accessMetrics, ({ one }) => ({
    access: one(vascularAccess, {
        fields: [accessMetrics.accessId],
        references: [vascularAccess.id],
    }),
}));
