"use client"

import { useState } from "react"
import DailyTable from "@/components/table/DailyTable"
import StationReportTable from "@/components/table/StationReportTable"
import TimesheetTable from "@/components/table/TimesheetTable"

export default function Dashboard() {
  const [tab, setTab] = useState("daily")
  const [data, setData] = useState([])

  return (
    <div className="p-6">
      <div className="flex gap-4 mb-4">
        <button onClick={() => setTab("daily")}>Daily</button>
        <button onClick={() => setTab("station")}>Station Report</button>
        <button onClick={() => setTab("timesheet")}>Timesheet</button>
      </div>

      {tab === "daily" && <DailyTable data={data} />}
      {tab === "station" && <StationReportTable data={data} />}
      {tab === "timesheet" && <TimesheetTable data={data} />}
    </div>
  )
}