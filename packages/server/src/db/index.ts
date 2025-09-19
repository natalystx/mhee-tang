import { env } from "@/env";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as authSchema from "./schema/auth";
import * as transactionSchema from "./schema/transaction";

const pool = new Pool({
  connectionString: env.DATABASE_URL || "",
});

export const db = drizzle(pool, {
  schema: {
    ...authSchema,
    ...transactionSchema,
  },
});
