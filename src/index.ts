import { Elysia } from 'elysia'
import { employees } from './modules/employees'
import { attendances } from './modules/attendances'
import { dashboard } from './modules/dashboard'
import openapi from '@elysiajs/openapi'

const app = new Elysia()
  .use(openapi())
  .use(employees)
  .use(attendances)
  .use(dashboard)
  .get('/', () => 'Hello Elysia')
  .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
