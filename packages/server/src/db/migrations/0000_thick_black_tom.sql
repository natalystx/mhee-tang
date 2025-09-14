CREATE TYPE "public"."recurring_type" AS ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense', 'transfer');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"uid" text NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_uid_unique" UNIQUE("uid"),
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"name" text,
	"english_name" text,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_uid_unique" UNIQUE("uid"),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "category" (
	"uid" text DEFAULT 'cat_019946f4-ae03-7179-abf7-62675d28f2e0' NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "category_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "recurring_transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text DEFAULT 'rtn_019946f4-ae04-73af-9ff0-f2bd70b1a749' NOT NULL,
	"user_id" text NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"name" text NOT NULL,
	"type" "transaction_type" NOT NULL,
	"category_id" text NOT NULL,
	"notes" text,
	"custom_interval" integer,
	"recur_type" "recurring_type" NOT NULL,
	"day_of_week" text,
	"day_of_month" text,
	"start_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"end_date" timestamp,
	CONSTRAINT "recurring_transaction_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"uid" text DEFAULT 'tag_019946f4-ae03-7179-abf7-5ed1c160dd94' NOT NULL,
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "tag_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "transaction" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text DEFAULT 'txn_019946f4-ae03-7179-abf7-67b2a6253001' NOT NULL,
	"amount" numeric(19, 4) NOT NULL,
	"name" text NOT NULL,
	"currency" text DEFAULT 'THB' NOT NULL,
	"type" "transaction_type" NOT NULL,
	"notes" text,
	"transaction_date" timestamp NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text,
	CONSTRAINT "transaction_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "transaction_tag" (
	"transaction_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "transaction_tag_transaction_id_tag_id_pk" PRIMARY KEY("transaction_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_user_id_user_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transaction" ADD CONSTRAINT "recurring_transaction_user_id_user_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transaction" ADD CONSTRAINT "recurring_transaction_category_id_category_uid_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_user_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_uid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_category_id_category_uid_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tag" ADD CONSTRAINT "transaction_tag_transaction_id_transaction_uid_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transaction"("uid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_tag" ADD CONSTRAINT "transaction_tag_tag_id_tag_uid_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("uid") ON DELETE no action ON UPDATE no action;