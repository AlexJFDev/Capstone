import type { Item } from "@/testing/dummy-items";


export function computeDateRange(items: Item[]) {
  if (items.length === 0) return null

  let min = Infinity
  let max = -Infinity

  items.forEach((item) => {
    min = Math.min(item["start-date"].getTime(), min)
    max = Math.max(item["end-date"].getTime(), max)
  })

  const start = new Date(min)
  start.setDate(start.getDate() - start.getDay())
  start.setHours(0, 0, 0, 0)

  const end = new Date(max)
  const daysUntilSunday = (7 - end.getDay()) % 7
  end.setDate(end.getDate() + (daysUntilSunday || 7))
  end.setHours(0, 0, 0, 0)

  return [start, end]
}