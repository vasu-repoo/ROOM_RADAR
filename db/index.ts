import { AsyncLocalStorage } from "node:async_hooks";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type DatabaseBinding = Parameters<typeof drizzle>[0];
const databaseContext = new AsyncLocalStorage<DatabaseBinding>();

export function withDatabase<T>(database: DatabaseBinding, callback: () => Promise<T>): Promise<T> {
  return databaseContext.run(database, callback);
}

export function getDb() {
  const database = databaseContext.getStore();
  if (!database) {
    throw new Error(
      "The RoomRadar database is unavailable for this request."
    );
  }

  return drizzle(database, { schema });
}
