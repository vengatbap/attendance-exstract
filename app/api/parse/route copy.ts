import { NextRequest, NextResponse } from "next/server"
import { parseMessages } from "@/lib/parser"
// import { praserStrictMessages } from "@/lib/parser/praserStrict"
import { validate } from "@/lib/validator"
import { db } from "@/lib/db"
import { shifts } from "@/lib/db/schema"

export async function POST(req: Request) {
  const { text } = await req.json()

  const parsed = parseMessages(text)
  const validated = validate(parsed)  

  
  for (const row of validated) {
    await db.insert(shifts).values({
      name: row.name,
      station: row.station,
      date: row.date,
      inTime: row.inTime,
      outTime: row.outTime,
      remarks: row.remarks,
    })
  }

  return NextResponse.json(validated)
  

}


