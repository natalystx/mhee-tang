ALTER TABLE "user" ALTER COLUMN "uid" SET DEFAULT 'usr_01995007-29ec-7097-9368-e4389f85ee39';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "uid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "uid" SET DEFAULT 'cat_01995007-29ef-7439-a7cd-9a52822d4c66';--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "uid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transaction" ALTER COLUMN "uid" SET DEFAULT 'rtn_01995007-29f0-7790-a574-dd8b09b968ff';--> statement-breakpoint
ALTER TABLE "recurring_transaction" ALTER COLUMN "uid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "uid" SET DEFAULT 'tag_01995007-29ef-7439-a7cd-941bc9919686';--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "uid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "uid" SET DEFAULT 'txn_01995007-29ef-7439-a7cd-9fd4364b25aa';--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "uid" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "is_deleted" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "updated_at" DROP NOT NULL;