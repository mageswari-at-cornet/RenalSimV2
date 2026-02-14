CREATE TABLE "access_metrics" (
	"metric_id" serial PRIMARY KEY NOT NULL,
	"access_id" integer,
	"arterial_pressure" integer,
	"venous_pressure" integer,
	"flow_rate" integer,
	"recorded_date" date
);
--> statement-breakpoint
CREATE TABLE "dialysis_sessions" (
	"session_id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"session_date" date NOT NULL,
	"dialysis_technique" varchar(50),
	"dialyzer_type" varchar(100),
	"dialysate_bath_type" varchar(100),
	"dry_weight" numeric(5, 2),
	"pre_dialysis_weight" numeric(5, 2),
	"post_dialysis_weight" numeric(5, 2),
	"interdialytic_weight_gain" numeric(5, 2),
	"dialysate_temperature" numeric(4, 2),
	"replacement_volume" numeric(6, 2),
	"dialysis_dose_kt" numeric(5, 2),
	"blood_flow_rate" integer,
	"dialysate_flow_rate" integer,
	"dialysate_conductivity" numeric(4, 2),
	"bicarbonate_conductivity" numeric(4, 2),
	"ultrafiltration_rate" numeric(5, 2),
	"intradialytic_hypotension" boolean,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lab_results" (
	"lab_id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"test_date" date NOT NULL,
	"hemoglobin" numeric(4, 2),
	"albumin" numeric(4, 2),
	"potassium" numeric(4, 2),
	"sodium" numeric(4, 2),
	"calcium" numeric(4, 2),
	"phosphorus" numeric(4, 2),
	"urea" numeric(6, 2),
	"creatinine" numeric(6, 2),
	"bicarbonate" numeric(4, 2),
	"ferritin" numeric(6, 2),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medications" (
	"medication_id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"drug_name" varchar(100),
	"dose" varchar(50),
	"frequency" varchar(50),
	"route" varchar(50),
	"start_date" date,
	"end_date" date,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"patient_id" serial PRIMARY KEY NOT NULL,
	"mrn" varchar(50) NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"sex" varchar(10),
	"date_of_birth" date,
	"phone" varchar(20),
	"risk_level" varchar(20),
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "patients_mrn_unique" UNIQUE("mrn")
);
--> statement-breakpoint
CREATE TABLE "session_vitals" (
	"vital_id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"recorded_time" timestamp,
	"systolic_bp" integer,
	"diastolic_bp" integer,
	"heart_rate" integer,
	"body_temperature" numeric(4, 2),
	"arterial_line_pressure" integer,
	"venous_line_pressure" integer,
	"transmembrane_pressure" integer
);
--> statement-breakpoint
CREATE TABLE "vascular_access" (
	"access_id" serial PRIMARY KEY NOT NULL,
	"patient_id" integer,
	"access_type" varchar(20),
	"location" varchar(100),
	"created_date" date,
	"status" varchar(50)
);
--> statement-breakpoint
ALTER TABLE "access_metrics" ADD CONSTRAINT "access_metrics_access_id_vascular_access_access_id_fk" FOREIGN KEY ("access_id") REFERENCES "public"."vascular_access"("access_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dialysis_sessions" ADD CONSTRAINT "dialysis_sessions_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_results" ADD CONSTRAINT "lab_results_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medications" ADD CONSTRAINT "medications_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_vitals" ADD CONSTRAINT "session_vitals_session_id_dialysis_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."dialysis_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vascular_access" ADD CONSTRAINT "vascular_access_patient_id_patients_patient_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("patient_id") ON DELETE no action ON UPDATE no action;