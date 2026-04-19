import { AttendanceRecord } from "@/lib/types";
import { formatHours } from "@/lib/utils/time";

type DailyTableProps = {
  data: AttendanceRecord[];
};

export default function DailyTable({ data }: DailyTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Station</th>
            <th className="px-4 py-3 font-medium">Shift</th>
            <th className="px-4 py-3 font-medium">IN</th>
            <th className="px-4 py-3 font-medium">OUT</th>
            <th className="px-4 py-3 font-medium">Hours</th>
            <th className="px-4 py-3 font-medium">OT</th>
            <th className="px-4 py-3 font-medium">Late</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record) => (
            <tr key={record.id} className="border-b border-slate-100">
              <td className="px-4 py-3">{record.name}</td>
              <td className="px-4 py-3">{record.station}</td>
              <td className="px-4 py-3">{record.shift}</td>
              <td className="px-4 py-3">{record.inTime ?? "-"}</td>
              <td className="px-4 py-3">{record.outTime ?? "-"}</td>
              <td className="px-4 py-3">{formatHours(record.workHours)}</td>
              <td className="px-4 py-3">{formatHours(record.overtime)}</td>
              <td className="px-4 py-3">{record.late ? "Yes" : "No"}</td>
              <td className="px-4 py-3">{record.status}</td>
            </tr>
          ))}
          {!data.length ? (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                No records for the selected date.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
