ALTER TABLE "access_metrics" DROP CONSTRAINT "access_metrics_access_id_vascular_access_access_id_fk";
--> statement-breakpoint
ALTER TABLE "dialysis_sessions" DROP CONSTRAINT "dialysis_sessions_patient_id_patients_patient_id_fk";
--> statement-breakpoint
ALTER TABLE "lab_results" DROP CONSTRAINT "lab_results_patient_id_patients_patient_id_fk";
--> statement-breakpoint
ALTER TABLE "medications" DROP CONSTRAINT "medications_patient_id_patients_patient_id_fk";
--> statement-breakpoint
ALTER TABLE "session_vitals" DROP CONSTRAINT "session_vitals_session_id_dialysis_sessions_session_id_fk";
--> statement-breakpoint
ALTER TABLE "vascular_access" DROP CONSTRAINT "vascular_access_patient_id_patients_patient_id_fk";
--> statement-breakpoint
ALTER TABLE "access_metrics" ALTER COLUMN "access_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "dialysis_sessions" ALTER COLUMN "patient_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "lab_results" ALTER COLUMN "patient_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "medications" ALTER COLUMN "patient_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session_vitals" ALTER COLUMN "session_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vascular_access" ALTER COLUMN "patient_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "access_metrics" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "dialysis_sessions" ADD COLUMN "start_time" timestamp;--> statement-breakpoint
ALTER TABLE "dialysis_sessions" ADD COLUMN "end_time" timestamp;--> statement-breakpoint
ALTER TABLE "medications" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "session_vitals" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "vascular_access" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "access_metrics" ADD CONSTRAINT "access_metrics_access_id_vascular_access_access_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."vascular_access"("access_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialysis_sessions" ADD CONSTRAINT "dialysis_sessions_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_vitals" ADD CONSTRAINT "session_vitals_session_id_dialysis_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."dialysis_sessions"("session_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vascular_access" ADD CONSTRAINT "vascular_access_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_session_patient" ON "dialysis_sessions" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "idx_lab_patient" ON "lab_results" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "idx_vitals_session" ON "session_vitals" USING btree ("session_id");