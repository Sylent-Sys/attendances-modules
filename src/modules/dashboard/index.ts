import { Elysia, t } from 'elysia'
import { DashboardService } from './service'
import { DashboardModel } from './model'

export const dashboard = new Elysia({ prefix: '/dashboard' })
	.get('/total-employees', async () => {
		return await DashboardService.totalEmployees()
	}, {
		response: { 200: DashboardModel.totalsResponse }
	})

	.get('/attendance', async ({ query }) => {
		const date = query.date
		return await DashboardService.attendanceSummary(date)
	}, {
		response: { 200: DashboardModel.attendanceSummaryResponse },
        query: t.Object({
            date: t.Optional(t.String())
        })
	})

export default dashboard
