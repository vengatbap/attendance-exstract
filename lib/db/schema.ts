import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"

export const shifts = pgTable("shifts", {
  id: serial("id").primaryKey(),

  name: text("name"),
  station: text("station"),
  date: text("date"),

  inTime: text("in_time"),
  outTime: text("out_time"),

  remarks: text("remarks"),

  createdAt: timestamp("created_at").defaultNow(),
})