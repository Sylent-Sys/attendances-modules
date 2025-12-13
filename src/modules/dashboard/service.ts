import { sql } from '../../lib/db'
import type { DashboardAttendanceSummary, DashboardTotals } from './model'

function toISOStringDateOnly(d: Date) {
  // return YYYY-MM-DD
  return d.toISOString().slice(0, 10)
}

export abstract class DashboardService {
  static async totalEmployees(): Promise<DashboardTotals> {
    const res = await sql`SELECT COUNT(*) AS total FROM employees`
    const total = Number(res?.[0]?.total ?? 0)
    return { totalEmployees: total }
  }

  /**
   * Return attendance summary for a given date (YYYY-MM-DD). Default: today (UTC local date string)
   */
  static async attendanceSummary(date?: string): Promise<DashboardAttendanceSummary> {
    const dateOnly = date ?? toISOStringDateOnly(new Date())

    // counts grouped by status
    const rows = await sql`SELECT IFNULL(status, 'unknown') AS status, COUNT(*) AS cnt FROM attendances WHERE date = ${dateOnly} GROUP BY status`

    const totalRes = await sql`SELECT COUNT(*) AS total FROM attendances WHERE date = ${dateOnly}`
    const total = Number(totalRes?.[0]?.total ?? 0)

    const by_status: Record<string, number> = {}
    for (const r of rows) {
      const key = String(r.status ?? 'unknown')
      by_status[key] = Number(r.cnt ?? 0)
    }

    return {
      date: dateOnly,
      total,
      by_status,
    }
  }
}
