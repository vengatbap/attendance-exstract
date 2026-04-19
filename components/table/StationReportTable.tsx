export default function StationReportTable({ data }) {
  const map = {}

  data.forEach((e) => {
    if (!map[e.name]) {
      map[e.name] = {
        name: e.name,
        days: 0,
        hours: 0,
        missing: 0,
      }
    }

    map[e.name].days++

    if (e.status === "Completed") {
      map[e.name].hours += Number(e.workHours || 0)
    }

    if (e.status === "Pending") {
      map[e.name].missing++
    }
  })

  const rows = Object.values(map)

  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Name</th>
          <th>Days</th>
          <th>Total Hours</th>
          <th>Missing</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.name}</td>
            <td>{r.days}</td>
            <td>{r.hours}</td>
            <td>{r.missing}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}