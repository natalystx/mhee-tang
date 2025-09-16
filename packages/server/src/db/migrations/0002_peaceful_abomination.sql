ALTER TABLE "category" ALTER COLUMN "uid" SET DEFAULT 'cat_01995001-4945-7766-9e6b-c236152ea121';--> statement-breakpoint
ALTER TABLE "recurring_transaction" ALTER COLUMN "uid" SET DEFAULT 'rtn_01995001-4945-7766-9e6b-cb85bec70d31';--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "uid" SET DEFAULT 'tag_01995001-4945-7766-9e6b-be47890c7ba4';--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "uid" SET DEFAULT 'txn_01995001-4945-7766-9e6b-c794f8e5c7e7';--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "source" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "bank_name" text;--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "receiver" text;