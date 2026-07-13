import "server-only";
import { getZizkaDB } from "@/zizkadb/client";

/** GDPR right-to-erasure — deletes all events where data[filterKey] === filterValue. */
export async function forgetByField(filterKey: string, filterValue: string) {
  const { db } = getZizkaDB();
  return db.forget({ filterKey, filterValue });
}
