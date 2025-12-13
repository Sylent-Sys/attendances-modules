import { Elysia, t } from 'elysia'
import { AttendanceService } from './service'
import { AttendanceModel } from './model'

export const attendances = new Elysia({ prefix: '/attendances' })
  .get('/', async () => await AttendanceService.list(), {
    response: { 200: t.Array(AttendanceModel.response) }
  })

  .get('/employee/:employee_id', async ({ params }) => {
    const id = Number(params.employee_id)
    return await AttendanceService.listByEmployee(id)
  }, {
    response: { 200: t.Array(AttendanceModel.response) }
  })

  .get('/:id', async ({ params }) => {
    const id = Number(params.id)
    return await AttendanceService.getById(id)
  }, {
    response: { 200: AttendanceModel.response }
  })

  .post('/', async ({ body }) => {
    return await AttendanceService.create(body as any)
  }, {
    body: AttendanceModel.createBody,
    response: { 200: AttendanceModel.response }
  })

  .post('/clock-in', async ({ body }) => {
    const { employee_id, time } = body as any
    return await AttendanceService.clockIn(Number(employee_id), time)
  }, {
    body: AttendanceModel.clockBody,
    response: { 200: AttendanceModel.response }
  })

  .post('/clock-out', async ({ body }) => {
    const { employee_id, time } = body as any
    return await AttendanceService.clockOut(Number(employee_id), time)
  }, {
    body: AttendanceModel.clockBody,
    response: { 200: AttendanceModel.response }
  })

  .put('/:id', async ({ params, body }) => {
    const id = Number(params.id)
    return await AttendanceService.update(id, body as any)
  }, {
    body: AttendanceModel.updateBody,
    response: { 200: AttendanceModel.response }
  })

  .delete('/:id', async ({ params }) => {
    const id = Number(params.id)
    return await AttendanceService.remove(id)
  })

export default attendances
