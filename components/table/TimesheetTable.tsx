export default function TimesheetTable({ data }) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>IN</th>
          <th>OUT</th>
          <th>Hours</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {data.map((e, i) => (
          <tr key={i}>
            <td>{e.date}</td>
            <td>{e.name}</td>
            <td>{e.inTime}</td>
            <td>{e.outTime || "-"}</td>
            <td>{e.workHours || "-"}</td>
            <td>{e.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}