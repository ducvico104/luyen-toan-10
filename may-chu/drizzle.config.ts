import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
 
export default defineConfig({
  schema: './src/ha-tang/csdl/schema.ts', // nơi khai báo bảng
  out: './drizzle',                        // nơi sinh file migration .sql
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
