ALTER TABLE "category" ALTER COLUMN "uid" SET DEFAULT 'cat_01994741-4ddc-751d-8652-0d10e7c71afd';--> statement-breakpoint
ALTER TABLE "recurring_transaction" ALTER COLUMN "uid" SET DEFAULT 'rtn_01994741-4ddc-751d-8652-1636b440d468';--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "uid" SET DEFAULT 'tag_01994741-4ddc-751d-8652-0a4b13b16d9f';--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "uid" SET DEFAULT 'txn_01994741-4ddc-751d-8652-12962dc5f5a6';--> statement-breakpoint
ALTER TABLE "transaction" ADD COLUMN "on_device_image_uri" text;