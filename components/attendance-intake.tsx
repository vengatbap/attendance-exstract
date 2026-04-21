"use client";

import Link from "next/link";
import { startTransition, useState } from "react";
import { ParseResponse } from "@/lib/types";
import { formatHours } from "@/lib/utils/time";

type AttendanceIntakeProps = {
  onSaved?: (response: ParseResponse) => void;
  showDashboardLink?: boolean;
};

const SAMPLE_MESSAGE = `[10:13 PM, 4/18/2026] +973 3558 4584: *18-4-2026

*Hoora  BS

         *  Afternoon shift*
Duty Time: ( 2 to 10 )*

OPR:-  * Jaffar Hasan Sarhan * 
IN       : 1:48
out     : 10:00
[10:17 PM, 4/18/2026] +973 3447 2792: EWA MUSALLA BS
18/4/2026
AFTERNOON SHIFT
OPR:-ALAA ZAKAREYA 
IN TIME:-1:57pm 
OUT TIME:-10:00pm
[6:07 AM, 4/19/2026] Jawed EWA KTS: *EWA  SEEF BS 

 Date :  18/4/2026
 
 *Night SHIFT_

OPR.     -  Mahmood jawadq⅝

Duty Time:- 22:00to6:00

In time:21:58
out :6:00
[6:13 AM, 4/19/2026] Syed Ahmed KTS: 19-4-2026

EWA SEEF BS 

       *Morning Shift *

Duty Time: ( 6 to 2 )*

OPR:-  * sayed Ahmed* 

IN       : 5:55
out     :
[2:18 PM, 4/19/2026] +973 3757 7277: EWA  SALMABAD

 Date : 19/4/2026
 
 *Morning SHIFT*

OPR      -    Jassim mohammad

OPR.     -    


Duty Time:-  6:00am TO 2:00pm
In time: 6:00am
Out time: 2:00pm
[2:19 PM, 4/19/2026] +973 3447 2792: EWA MUSALLA BS
19/4/2026
MORNING SHIFT
OPR:-ALAA ZAKAREYA 
IN TIME:-6:10am 
OUT TIME:-2:00pm
[9:46 PM, 4/19/2026] Jawed EWA KTS: *EWA  SEEF BS 

 Date :  19/4/2026
 
 *Night SHIFT_

OPR.     -  Mahmood jawadq⅝

Duty Time:- 22:00to6:00

In time:21:46
out :
[5:46 AM, 4/20/2026] +973 3722 5536: 19-4-2026 (Sunday)

EWA Salmabad FS 

         Afternoon Shift

Duty Time: (2pm-10pm)

OPR:-  Murtadha Alaradi

IN       : 1.42pm
Out:   :  10.00pm
[6:18 AM, 4/20/2026] Syed Ahmed KTS: 19-4-2026

EWA SEEF BS 

       *Morning Shift *

Duty Time: ( 6 to 2 )*

OPR:-  * sayed Ahmed* 

IN       : 5:55
out     : 2:00
[6:19 AM, 4/20/2026] Syed Ahmed KTS: 20-4-2026

EWA SEEF BS 

       *Morning Shift *

Duty Time: ( 6 to 2 )*

OPR:-  * sayed Ahmed* 

IN       : 6:00
out     :
[2:45 PM, 4/20/2026] +973 3722 5536: 20-4-2026 (Monday)

EWA Salmabad FS 

         Morning Shift

Duty Time: (6am-2pm)

OPR:-  Murtadha Alaradi

IN       : 5.37am
Out:   :  1.58pm
[2:50 PM, 4/20/2026] +973 3558 4584: 20-4-2026

*Hoora  BS

         *  Morning shift*
Duty Time: ( 6 to 2 )*

OPR:-  * Jaffar Hasan Sarhan * 
IN       : 5:40
out     : 2:00
[2:51 PM, 4/20/2026] Syed Ahmed KTS: 20-4-2026

EWA SEEF BS 

       *Morning Shift *

Duty Time: ( 6 to 2 )*

OPR:-  * sayed Ahmed* 

IN       : 6:00
out     : 2:00
[9:53 PM, 4/20/2026] Jawed EWA KTS: *EWA  SEEF BS 

 Date :  20/4/2026
 
 *Night SHIFT_

OPR.     -  Mahmood jawadq⅝

Duty Time:- 22:00to6:00

In time:21:46
out :21:52
[10:44 PM, 4/20/2026] +973 3757 7277: EWA  SALMABAD

 Date : 20/4/2026
 
 *_ AFTERNOON SHIFT_*

OPR      -    Jassim mohammad

OPR.     -    


Duty Time:-  2:00pm TO 10:00pm
In time: 1:42pm
Out time: 10:00pm`

async function readJson<T>(response: Response): Promise<T> {
  const data = (await response.json().catch(() => null)) as T | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data && typeof data.error === "string"
        ? data.error
        : "Request failed.";
    throw new Error(message);
  }

  if (!data) {
    throw new Error("Empty response.");
  }

  return data;
}

export function AttendanceIntake({
  onSaved,
  showDashboardLink = false,
}: AttendanceIntakeProps) {
  const [message, setMessage] = useState(SAMPLE_MESSAGE);
  const [result, setResult] = useState<ParseResponse | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<"preview" | "save" | null>(null);

  async function submit(persist: boolean) {
    setPendingAction(persist ? "save" : "preview");
    setFeedback("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            persist,
          }),
        });

        const data = await readJson<ParseResponse>(response);
        setResult(data);
        setFeedback(
          persist
            ? `Saved ${data.summary.touchedRecords} record(s).`
            : `Previewed ${data.summary.touchedRecords} merged record(s).`
        );

        if (persist) {
          onSaved?.(data);
        }
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "Unable to process message.");
      } finally {
        setPendingAction(null);
      }
    });
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
            Attendance Intake
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">
            Convert WhatsApp attendance messages into structured attendance logs
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Paste the raw message, preview the merged rows, then save it into the attendance
            register.
          </p>
        </div>
        {showDashboardLink ? (
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Open Dashboard
          </Link>
        ) : null}
      </div>

      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={14}
        className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none ring-0 transition focus:border-teal-500"
        placeholder="Paste WhatsApp attendance message here"
      />

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => submit(false)}
          disabled={pendingAction !== null}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
        >
          {pendingAction === "preview" ? "Previewing..." : "Preview Parse"}
        </button>
        <button
          type="button"
          onClick={() => submit(true)}
          disabled={pendingAction !== null}
          className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 disabled:opacity-60"
        >
          {pendingAction === "save" ? "Saving..." : "Parse & Save"}
        </button>
      </div>

      {feedback ? (
        <p className="mt-3 rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{feedback}</p>
      ) : null}

      {result ? (
        <div className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Parsed Lines</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.parsedLines}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Completed</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.completed}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pending</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.pending}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Errors</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{result.summary.errors}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Station</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Shift</th>
                  <th className="px-4 py-3 font-medium">IN</th>
                  <th className="px-4 py-3 font-medium">OUT</th>
                  <th className="px-4 py-3 font-medium">Hours</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.records.map((record) => (
                  <tr key={record.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{record.name}</td>
                    <td className="px-4 py-3">{record.station}</td>
                    <td className="px-4 py-3">{record.date}</td>
                    <td className="px-4 py-3">{record.shift}</td>
                    <td className="px-4 py-3">{record.inTime ?? "-"}</td>
                    <td className="px-4 py-3">{record.outTime ?? "-"}</td>
                    <td className="px-4 py-3">{formatHours(record.workHours)}</td>
                    <td className="px-4 py-3">{record.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}
