import { TimesheetRow } from "@/lib/types";
import { formatHours } from "@/lib/utils/time";

type TimesheetTableProps = {
  data: TimesheetRow[];
};

export default function TimesheetTable({ data }: TimesheetTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Operator</th>
            <th className="px-4 py-3 font-medium">Station</th>
            <th className="px-4 py-3 font-medium">Shift</th>
            <th className="px-4 py-3 font-medium">IN</th>
            <th className="px-4 py-3 font-medium">OUT</th>
            <th className="px-4 py-3 font-medium">Hours</th>
            <th className="px-4 py-3 font-medium">OT</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.date}-${row.station}-${row.name}`} className="border-b border-slate-100">
              <td className="px-4 py-3">{row.date}</td>
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3">{row.station}</td>
              <td className="px-4 py-3">{row.shift}</td>
              <td className="px-4 py-3">{row.inTime ?? "-"}</td>
              <td className="px-4 py-3">{row.outTime ?? "-"}</td>
              <td className="px-4 py-3">{formatHours(row.hours)}</td>
              <td className="px-4 py-3">{formatHours(row.overtime)}</td>
              <td className="px-4 py-3">{row.status}</td>
            </tr>
          ))}
          {!data.length ? (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                No timesheet rows match the selected filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
