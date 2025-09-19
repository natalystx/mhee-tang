ALTER TABLE "category" DROP CONSTRAINT "category_user_id_user_uid_fk";
--> statement-breakpoint
ALTER TABLE "recurring_transaction" DROP CONSTRAINT "recurring_transaction_user_id_user_uid_fk";
--> statement-breakpoint
ALTER TABLE "tag" DROP CONSTRAINT "tag_user_id_user_uid_fk";
--> statement-breakpoint
ALTER TABLE "transaction" DROP CONSTRAINT "transaction_user_id_user_uid_fk";
--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "uid" SET DEFAULT 'ses_0199557c-be2d-75ac-b717-7e576695dc2a';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "uid" SET DEFAULT 'usr_0199557c-be2c-759c-97d0-402f72894f92';--> statement-breakpoint
ALTER TABLE "category" ALTER COLUMN "uid" SET DEFAULT 'cat_0199557c-be30-72a7-9771-5dd3319f96dc';--> statement-breakpoint
ALTER TABLE "recurring_transaction" ALTER COLUMN "uid" SET DEFAULT 'rtn_0199557c-be30-72a7-9771-657ad6f9915d';--> statement-breakpoint
ALTER TABLE "tag" ALTER COLUMN "uid" SET DEFAULT 'tag_0199557c-be30-72a7-9771-5b6454625ab3';--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "uid" SET DEFAULT 'txn_0199557c-be30-72a7-9771-62477b107a9d';--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transaction" ADD CONSTRAINT "recurring_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction" ADD CONSTRAINT "transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;