import 'dotenv/config'; // đọc file .env vào process.env
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
 
// Hàm tạo kết nối: ứng dụng dùng CSDL thật, kiểm thử dùng CSDL riêng
export function taoKetNoi(duongDan: string) {
  const pool = new Pool({ connectionString: duongDan }); // "bể" kết nối dùng lại
  const db = drizzle(pool, { schema });
  return { pool, db };
}
 
export type CSDL = ReturnType<typeof taoKetNoi>['db'];
