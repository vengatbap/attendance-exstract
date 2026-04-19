import { StationReportRow } from "@/lib/types";
import { formatHours } from "@/lib/utils/time";

type StationReportTableProps = {
  data: StationReportRow[];
};

export default function StationReportTable({ data }: StationReportTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-4 py-3 font-medium">Operator</th>
            <th className="px-4 py-3 font-medium">Station</th>
            <th className="px-4 py-3 font-medium">Total Days</th>
            <th className="px-4 py-3 font-medium">Completed</th>
            <th className="px-4 py-3 font-medium">Missing</th>
            <th className="px-4 py-3 font-medium">Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={`${row.station}-${row.name}`} className="border-b border-slate-100">
              <td className="px-4 py-3">{row.name}</td>
              <td className="px-4 py-3">{row.station}</td>
              <td className="px-4 py-3">{row.totalDays}</td>
              <td className="px-4 py-3">{row.completedDays}</td>
              <td className="px-4 py-3">{row.missingDays}</td>
              <td className="px-4 py-3">{formatHours(row.totalHours)}</td>
            </tr>
          ))}
          {!data.length ? (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                No station report rows match the selected filters.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
