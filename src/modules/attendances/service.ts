import { sql } from '../../lib/db'
import { status } from 'elysia'
import type { CreateAttendanceBody, UpdateAttendanceBody } from './model'

function toISOStringIfDate(value: unknown) {
  if (value instanceof Date) return value.toISOString()
  if (value === null || value === undefined) return undefined
  return String(value)
}

function timeOnly(value: unknown) {
  // Return HH:MM:SS or undefined
  if (value instanceof Date) return value.toTimeString().slice(0, 8)
  if (value === null || value === undefined) return undefined
  const s = String(value)
  // If ISO datetime given, convert to time part
  if (s.includes('T')) {
    const d = new Date(s)
    if (!isNaN(d.getTime())) return d.toTimeString().slice(0, 8)
  }
  // If already HH:MM:SS or HH:MM, normalize
  const m = s.match(/^(\d{2}:\d{2}:\d{2})/)
  if (m) return m[1]
  return undefined
}
function normalizeAttendanceRow(row: any) {
  if (!row) return row

  return {
    ...row,
    date: toISOStringIfDate(row.date),
    // normalize TIME columns to HH:MM:SS
    check_in_time: timeOnly(row.check_in_time),
    check_out_time: timeOnly(row.check_out_time),
    created_at: toISOStringIfDate(row.created_at),
    updated_at: toISOStringIfDate(row.updated_at),
    description: row.description ?? undefined,
  }
}

export abstract class AttendanceService {
  static async list() {
    const rows = await sql`SELECT id, employee_id, date, check_in_time, check_out_time, status, description, created_at, updated_at FROM attendances ORDER BY id`
    return rows.map(normalizeAttendanceRow)
  }

  static async getById(id: number) {
    const res = await sql`SELECT id, employee_id, date, check_in_time, check_out_time, status, description, created_at, updated_at FROM attendances WHERE id = ${id} LIMIT 1`
    return normalizeAttendanceRow(res[0])
  }

  static async listByEmployee(employee_id: number) {
    const rows = await sql`SELECT id, employee_id, date, check_in_time, check_out_time, status, description, created_at, updated_at FROM attendances WHERE employee_id = ${employee_id} ORDER BY date`
    return rows.map(normalizeAttendanceRow)
  }

  static async create(payload: CreateAttendanceBody) {
    const { employee_id, date, check_in_time, check_out_time, status, description } = payload

    const ci = timeOnly(check_in_time) ?? null
    const co = timeOnly(check_out_time) ?? null

    await sql`
      INSERT INTO attendances (employee_id, date, check_in_time, check_out_time, status, description)
      VALUES (
        ${employee_id},
        ${date},
        ${ci},
        ${co},
        ${status ?? null},
        ${description ?? null}
      )
    `

    const res = await sql`SELECT id, employee_id, date, check_in_time, check_out_time, status, description, created_at, updated_at FROM attendances WHERE id = LAST_INSERT_ID() LIMIT 1`

    return normalizeAttendanceRow(res[0])
  }

  static async clockIn(employee_id: number, timeParam?: string) {
    const now = timeParam ? new Date(timeParam) : new Date()
    const dateOnly = now.toISOString().slice(0, 10) // YYYY-MM-DD

    // find existing attendance for this employee and date (include check_in_time)
    const existing = await sql`SELECT id, check_in_time FROM attendances WHERE employee_id = ${employee_id} AND date = ${dateOnly} LIMIT 1`

    if (existing.length) {
      const id = existing[0].id
      // if already has check_in_time -> error
      if (existing[0].check_in_time) throw status(400, 'Already clocked in')
      const timeStr = now.toTimeString().slice(0, 8)
      await sql`UPDATE attendances SET check_in_time = ${timeStr}, status = ${'hadir'} WHERE id = ${id}`
      const res = await sql`SELECT id, employee_id, date, check_in_time, check_out_time, status, description, created_at, updated_at FROM attendances WHERE id = ${id} LIMIT 1`
      return normalizeAttendanceRow(res[0])
    }

    const timeStr = now.toTimeString().slice(0, 8)
    await sql`
      INSERT INTO attendances (employee_id, date, check_in_time, status)
      VALUES (${employee_id}, ${dateOnly}, ${timeStr}, ${'hadir'})
    `
    const res = await sql`SELECT id, employee_id, date, check_in_time, check_out_time, status, description, created_at, updated_at FROM attendances WHERE id = LAST_INSERT_ID() LIMIT 1`
    return normalizeAttendanceRow(res[0])
  }

static async clockOut(employee_id: number, timeParam?: string) {
    const now = timeParam ? new Date(timeParam) : new Date();
    
    // PERBAIKAN 1: Konsistensi Waktu (Gunakan Local Time untuk Date & Time)
    // Fungsi helper sederhana untuk format YYYY-MM-DD lokal
    const getLocalDate = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000;
        const local = new Date(d.getTime() - offset); 
        return local.toISOString().slice(0, 10);
    };

    const dateOnly = getLocalDate(now); 
    const timeStr = now.toTimeString().slice(0, 8); // Format HH:mm:ss

    // Cek record hari ini
    const existing = await sql`SELECT id, check_out_time FROM attendances WHERE employee_id = ${employee_id} AND date = ${dateOnly} LIMIT 1`;

    // PERBAIKAN 2: Logic Check
    if (!existing.length) {
        // Jangan buat data baru saat clock out. Harusnya error.
        throw status(400, 'Anda belum melakukan Clock In hari ini.');
    }

    const row = existing[0];

    // Cek double clock-out
    if (row.check_out_time) {
        throw status(400, 'Anda sudah melakukan Clock Out sebelumnya.');
    }

    // Lakukan Update
    await sql`UPDATE attendances SET check_out_time = ${timeStr}, status = 'pulang' WHERE id = ${row.id}`;

    // Ambil data terbaru
    const res = await sql`SELECT * FROM attendances WHERE id = ${row.id} LIMIT 1`;
    
    return normalizeAttendanceRow(res[0]);
  }

  static async update(id: number, payload: UpdateAttendanceBody) {
    if (payload.date !== undefined) {
      await sql`UPDATE attendances SET date = ${payload.date} WHERE id = ${id}`
    }
    if (payload.check_in_time !== undefined) {
      await sql`UPDATE attendances SET check_in_time = ${payload.check_in_time} WHERE id = ${id}`
    }
    if (payload.check_out_time !== undefined) {
      await sql`UPDATE attendances SET check_out_time = ${payload.check_out_time} WHERE id = ${id}`
    }
    if (payload.status !== undefined) {
      await sql`UPDATE attendances SET status = ${payload.status} WHERE id = ${id}`
    }
    if (payload.description !== undefined) {
      await sql`UPDATE attendances SET description = ${payload.description} WHERE id = ${id}`
    }

    return await AttendanceService.getById(id)
  }

  static async remove(id: number) {
    await sql`DELETE FROM attendances WHERE id = ${id}`
    return { success: true }
  }
}
