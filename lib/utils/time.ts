export function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export function calculateHours(inTime: string, outTime: string) {
  let start = toMinutes(inTime)
  let end = toMinutes(outTime)

  if (end < start) end += 24 * 60

  return (end - start) / 60
}