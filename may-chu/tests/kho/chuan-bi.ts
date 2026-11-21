import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { CSDL, taoKetNoi } from '../../src/ha-tang/csdl/ket-noi';
import { nutKienThuc } from '../../src/ha-tang/csdl/schema';
import { CauHoiJson } from '../../src/nghiep-vu/cau-hoi/NhaMayCauHoi';
 
// Kết nối tới CSDL KIỂM THỬ (khác CSDL làm việc), đọc từ .env
export const { pool, db } = taoKetNoi(process.env.DATABASE_URL_TEST!);
 
// Chạy các migration còn thiếu => CSDL kiểm thử luôn có đủ 10 bảng mới nhất
export const chuanBiCSDL = () => migrate(db, { migrationsFolder: 'drizzle' });
 
// Xóa sạch dữ liệu trước mỗi ca kiểm thử để các ca không ảnh hưởng nhau
export const xoaSachDuLieu = () => db.execute(sql`
  TRUNCATE nguoi_dung, nut_kien_thuc, lo_nhap_cau_hoi, cau_hoi, phien_ban_cau_hoi,
           lua_chon, bo_luyen_tap, cau_trong_bo, luot_lam_bai, cau_da_lam
  RESTART IDENTITY CASCADE`);
 
// Tạo nhánh cây Toán › Lớp 10 › Chương › Bài › Dạng, trả về id nút Dạng (dạng chuỗi)
export async function taoNutDang(csdl: CSDL = db): Promise<string> {
  let chaId: number | null = null;
  const cap = ['MON', 'LOP', 'CHUONG', 'BAI', 'DANG'];
  for (const [i, c] of cap.entries()) {
    const [n]: { id: number }[] = await csdl.insert(nutKienThuc)
      .values({ nutChaId: chaId, cap: c, ma: `KT${i}`, ten: `Nút ${c}` })
      .returning({ id: nutKienThuc.id });
    chaId = n.id;
  }
  return String(chaId);
}
 
export const jsonTracNghiem = (de = 'Tập nghiệm của $x^2 - 4 = 0$ là'): CauHoiJson => ({
  loai: 'TRAC_NGHIEM', mucDo: 'BIET', de, loiGiai: '$x = \\pm 2$',
  luaChon: [
    { kyHieu: 'A', noiDung: '$\\{2\\}$', dung: false },
    { kyHieu: 'B', noiDung: '$\\{-2; 2\\}$', dung: true },
    { kyHieu: 'C', noiDung: '$\\{4\\}$', dung: false },
    { kyHieu: 'D', noiDung: '$\\varnothing$', dung: false },
  ],
});
