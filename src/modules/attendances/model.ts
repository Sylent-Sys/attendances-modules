import { t } from 'elysia'

export const AttendanceModel = {
  createBody: t.Object({
    employee_id: t.Numeric(),
    date: t.String(),
    check_in_time: t.Optional(t.String()),
    check_out_time: t.Optional(t.String()),
    status: t.Optional(t.String()),
    description: t.Optional(t.String()),
  }),

  updateBody: t.Object({
    date: t.Optional(t.String()),
    check_in_time: t.Optional(t.String()),
    check_out_time: t.Optional(t.String()),
    status: t.Optional(t.String()),
    description: t.Optional(t.String()),
  }),

  response: t.Object({
    id: t.Numeric(),
    employee_id: t.Numeric(),
    date: t.String(),
    check_in_time: t.Optional(t.String()),
    check_out_time: t.Optional(t.String()),
    status: t.Optional(t.String()),
    description: t.Optional(t.String()),
    created_at: t.String(),
    updated_at: t.String(),
  }),

  // Body for clock-in / clock-out actions
  clockBody: t.Object({
    employee_id: t.Numeric(),
    // optional ISO string or empty -> server uses now
    time: t.Optional(t.String()),
  }),
}

export type CreateAttendanceBody = typeof AttendanceModel.createBody.static
export type UpdateAttendanceBody = typeof AttendanceModel.updateBody.static
