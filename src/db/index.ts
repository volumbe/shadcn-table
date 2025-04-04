import { env } from "@/env.js";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import * as relations from "./relations";

const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema: { ...schema, ...relations } });
