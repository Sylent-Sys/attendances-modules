import { t } from 'elysia'

export const EmployeeModel = {
  // Fields aligned with migration: employees table
  createBody: t.Object({
    employee_number: t.String(),
    name: t.String(),
    position: t.Optional(t.String()),
    resident_id: t.Optional(t.Numeric()),
    region_id: t.Optional(t.Numeric()),
    is_active: t.Optional(t.Numeric()),
  }),

  updateBody: t.Object({
    employee_number: t.Optional(t.String()),
    name: t.Optional(t.String()),
    position: t.Optional(t.String()),
    resident_id: t.Optional(t.Numeric()),
    region_id: t.Optional(t.Numeric()),
    is_active: t.Optional(t.Numeric()),
  }),

  response: t.Object({
    id: t.Numeric(),
    resident_id: t.Optional(t.Numeric()),
    employee_number: t.String(),
    name: t.String(),
    position: t.Optional(t.String()),
    region_id: t.Optional(t.Numeric()),
    is_active: t.Numeric(),
    created_at: t.String(),
    updated_at: t.String(),
  }),
}

export type CreateEmployeeBody = typeof EmployeeModel.createBody.static
export type UpdateEmployeeBody = typeof EmployeeModel.updateBody.static
