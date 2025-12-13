import { t } from 'elysia'

export const DashboardModel = {
  totalsResponse: t.Object({
    totalEmployees: t.Numeric(),
  }),

  attendanceSummaryResponse: t.Object({
    date: t.String(),
    total: t.Numeric(),
    by_status: t.Record(t.String(), t.Numeric()),
  }),
}

export type DashboardAttendanceSummary = typeof DashboardModel.attendanceSummaryResponse.static
export type DashboardTotals = typeof DashboardModel.totalsResponse.static
