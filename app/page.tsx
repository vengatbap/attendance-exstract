
"use client"

import { useState } from "react"


export default function Home() {
  const [text, setText] = useState("")
  const [data, setData] = useState<any[]>([])

  const handleParse = async () => {

    const res = await fetch("/api/parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    })

    const json = await res.json()
    setData(json)
  }

  const handleDownload = async () => {
    const res = await fetch("/api/download", {
      method: "POST",
      body: JSON.stringify(data),
    })

    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "shifts.xlsx"
    a.click()
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Shift Parser</h1>

      <textarea
        className="w-full h-40 border p-2"
        placeholder="Paste WhatsApp logs..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex gap-2">
        <button onClick={handleParse} className="bg-blue-500 text-white px-4 py-2">
          Parse
        </button>

        <button onClick={handleDownload} className="bg-green-500 text-white px-4 py-2">
          Download Excel
        </button>
      </div>

      <table className="w-full border mt-4">
        <thead>
          <tr>
            <th>Name</th>
            <th>Station</th>
            <th>Date</th>
            <th>IN</th>
            <th>OUT</th>
            <th>Remarks</th>
          </tr>
        </thead>

        <tbody>
          
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              <td>{row.name}</td>
              <td>{row.station}</td>
              <td>{row.date}</td>
              <td>{row.inTime}</td>
              <td>{row.outTime || "-"}</td>
<td className={
  row.remarks.includes("Missing") ? "text-red-500" :
  row.remarks.includes("Long") ? "text-yellow-500" :
  "text-green-500"
}>
  {row.remarks}
</td>    
            </tr>
          ))}
        </tbody>
      </table>
      
    </div>
  )
}

