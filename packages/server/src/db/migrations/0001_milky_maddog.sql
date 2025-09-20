CREATE TYPE "public"."budget_cycle" AS ENUM('daily', 'weekly', 'monthly', 'yearly', 'custom');--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "uid" SET DEFAULT 'ses_01996463-242e-734b-b64e-2a81325cb538';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "uid" SET DEFAULT 'usr_01996463-242d-7339-817f-4dfbf7c6e04e';--> statement-breakpoint
ALTER TABLE "budget" ALTER COLUMN "uid" SET DEFAULT 'bdg_01996463-2435-7121-8800-89c7f5e8249d';--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "uid" SET DEFAULT 'cat_01996463-2434-775e-b2bc-fc7cdf529076';--> statement-breakpoint
ALTER TABLE "recurring_transaction" ALTER COLUMN "uid" SET DEFAULT 'rtn_01996463-2435-7121-8800-87424dcc7123';--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "uid" SET DEFAULT 'tag_01996463-2434-775e-b2bc-f98940b1aaec';--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "uid" SET DEFAULT 'txn_01996463-2434-775e-b2bd-038cdf1efea7';