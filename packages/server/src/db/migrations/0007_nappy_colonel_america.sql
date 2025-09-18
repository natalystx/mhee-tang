ALTER TABLE "session" ALTER COLUMN "uid" SET DEFAULT 'ses_01995a72-cef1-75fc-ac96-4dcff70622ac';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "uid" SET DEFAULT 'usr_01995a72-cef0-7370-a2d1-d6abd9aa940c';--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "uid" SET DEFAULT 'cat_01995a72-cef4-76f6-ad89-a1aa585c5f9b';--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "recurring_transaction" ALTER COLUMN "uid" SET DEFAULT 'rtn_01995a72-cef4-76f6-ad89-a84fab2f7cf0';--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "uid" SET DEFAULT 'tag_01995a72-cef4-76f6-ad89-9dfc061b7f11';--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "uid" SET DEFAULT 'txn_01995a72-cef4-76f6-ad89-a7a4857e60f3';--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "slug" text NOT NULL;