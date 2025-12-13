import { Elysia, t } from 'elysia'
import { EmployeeService } from './service'
import { EmployeeModel } from './model'

export const employees = new Elysia({ prefix: '/employees' })
  .get('/', async () => {
    return await EmployeeService.list()
  }, {
    response: {
      200: t.Array(EmployeeModel.response)
    }
  })

  .get('/:id', async ({ params }) => {
    const id = Number(params.id)
    const employee = await EmployeeService.getById(id)

    if (!employee) return { status: 404, body: { error: 'Not found' } }

    return employee
  }, {
    response: {
      200: EmployeeModel.response
    }
  })

  .post('/', async ({ body }) => {
    const created = await EmployeeService.create(body as any)
    return created
  }, {
    body: EmployeeModel.createBody,
    response: { 200: EmployeeModel.response }
  })

  .put('/:id', async ({ params, body }) => {
    const id = Number(params.id)
    const updated = await EmployeeService.update(id, body as any)
    return updated
  }, {
    body: EmployeeModel.updateBody,
    response: { 200: EmployeeModel.response }
  })

  .delete('/:id', async ({ params }) => {
    const id = Number(params.id)
    return await EmployeeService.remove(id)
  })

export default employees
