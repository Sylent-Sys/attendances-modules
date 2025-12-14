import { sql } from '../../lib/db'
import type { CreateEmployeeBody, UpdateEmployeeBody } from './model'

function toISOStringIfDate(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  if (value === null || value === undefined) return undefined
  return String(value)
}

function normalizeEmployeeRow(row: any) {
  if (!row) return row

  return {
    ...row,
    resident_id: row.resident_id ?? undefined,
    region_id: row.region_id ?? undefined,
    is_active: row.is_active ?? undefined,
    created_at: toISOStringIfDate(row.created_at),
    updated_at: toISOStringIfDate(row.updated_at),
  }
}

export abstract class EmployeeService {
  static async list() {
    const rows = await sql`SELECT id, resident_id, employee_number, name, position, region_id, is_active, created_at, updated_at FROM employees ORDER BY id`
    return rows.map(normalizeEmployeeRow)
  }

  static async getById(id: number) {
    const res = await sql`SELECT id, resident_id, employee_number, name, position, region_id, is_active, created_at, updated_at FROM employees WHERE id = ${id} LIMIT 1`
    return normalizeEmployeeRow(res[0])
  }

  static async getByUserId(user_id: number) {
    const res = await sql`SELECT id, user_id, resident_id, employee_number, name, position, region_id, is_active, created_at, updated_at FROM employees WHERE user_id = ${user_id} LIMIT 1`
    return normalizeEmployeeRow(res[0])
  }

  static async create(payload: CreateEmployeeBody) {
    const { employee_number, name, position, resident_id, region_id, is_active } = payload

      await sql`
        INSERT INTO employees (employee_number, name, position, resident_id, region_id, is_active)
        VALUES (
          ${employee_number},
          ${name},
          ${position ?? null},
          ${resident_id ?? null},
          ${region_id ?? null},
          ${is_active ?? true}
        )
      `

      const res = await sql`SELECT id, resident_id, employee_number, name, position, region_id, is_active, created_at, updated_at FROM employees WHERE id = LAST_INSERT_ID() LIMIT 1`

    return normalizeEmployeeRow(res[0])
  }

  static async update(id: number, payload: UpdateEmployeeBody) {
    // Build simple partial update
    const fields: string[] = []
    const values: unknown[] = []

    if (payload.employee_number !== undefined) {
      fields.push('employee_number')
      values.push(payload.employee_number)
    }
    if (payload.name !== undefined) {
      fields.push('name')
      values.push(payload.name)
    }
    if (payload.position !== undefined) {
      fields.push('position')
      values.push(payload.position)
    }
    if (payload.resident_id !== undefined) {
      fields.push('resident_id')
      values.push(payload.resident_id)
    }
    if (payload.region_id !== undefined) {
      fields.push('region_id')
      values.push(payload.region_id)
    }
    if (payload.is_active !== undefined) {
      fields.push('is_active')
      values.push(payload.is_active)
    }

    if (fields.length === 0) return await EmployeeService.getById(id)

    // Construct naive SQL for update using interpolation for values
    // Note: using Bun's tagged template with dynamic SQL parts is limited; this keeps it simple.
    // Perform updates individually (one-field updates) to keep queries simple
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i]
      const value = values[i]

      // Handle known fields explicitly to avoid interpolating identifiers dynamically
      if (field === 'employee_number') {
        await sql`UPDATE employees SET employee_number = ${value} WHERE id = ${id}`
      } else if (field === 'name') {
        await sql`UPDATE employees SET name = ${value} WHERE id = ${id}`
      } else if (field === 'position') {
        await sql`UPDATE employees SET position = ${value} WHERE id = ${id}`
      } else if (field === 'resident_id') {
        await sql`UPDATE employees SET resident_id = ${value} WHERE id = ${id}`
      } else if (field === 'region_id') {
        await sql`UPDATE employees SET region_id = ${value} WHERE id = ${id}`
      } else if (field === 'is_active') {
        await sql`UPDATE employees SET is_active = ${value} WHERE id = ${id}`
      }
    }

    return await EmployeeService.getById(id)
  }

  static async remove(id: number) {
    await sql`DELETE FROM employees WHERE id = ${id}`
    return { success: true }
  }
}
