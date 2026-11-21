import { sql } from 'drizzle-orm';
import {
  AnyPgColumn, boolean, char, check, foreignKey, integer, jsonb, numeric, pgTable,
  serial, smallint, text, timestamp, unique, uniqueIndex, uuid, varchar,
} from 'drizzle-orm/pg-core';
import type { TraLoi } from '../../nghiep-vu/cau-hoi/TraLoi';
 
// Quy ước: tên thuộc tính TypeScript viết kiểu lạc đà (hoTen),
// tên cột trong CSDL viết kiểu gạch dưới (ho_ten) – đúng lược đồ Bài tập 2.
 
// 1. nguoi_dung
export const nguoiDung = pgTable('nguoi_dung', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  matKhauBam: varchar('mat_khau_bam', { length: 255 }).notNull(),
  hoTen: varchar('ho_ten', { length: 100 }).notNull(),
  vaiTro: varchar('vai_tro', { length: 20 }).notNull(),
  trangThai: varchar('trang_thai', { length: 20 }).notNull().default('HOAT_DONG'),
  ngayTao: timestamp('ngay_tao', { withTimezone: true }).notNull().defaultNow(),
}, () => [
  check('ck_nguoi_dung_vai_tro', sql`vai_tro IN ('HOC_SINH', 'QUAN_TRI')`),
  check('ck_nguoi_dung_trang_thai', sql`trang_thai IN ('HOAT_DONG', 'BI_KHOA')`),
]);
 
// 2. nut_kien_thuc – cây 5 cấp trong một bảng, nut_cha_id trỏ về chính bảng này
export const nutKienThuc = pgTable('nut_kien_thuc', {
  id: serial('id').primaryKey(),
  nutChaId: integer('nut_cha_id').references((): AnyPgColumn => nutKienThuc.id),
  cap: varchar('cap', { length: 10 }).notNull(),
  ma: varchar('ma', { length: 30 }).notNull().unique(),
  ten: varchar('ten', { length: 255 }).notNull(),
  thuTu: integer('thu_tu').notNull().default(1),
}, (t) => [
  check('ck_nut_cap', sql`cap IN ('MON', 'LOP', 'CHUONG', 'BAI', 'DANG')`),
  unique('uq_nut_id_cap').on(t.id, t.cap), // để cau_hoi tham chiếu ghép (nut_id, nut_cap)
]);
 
// 3. lo_nhap_cau_hoi
export const loNhapCauHoi = pgTable('lo_nhap_cau_hoi', {
  id: serial('id').primaryKey(),
  tenFile: varchar('ten_file', { length: 255 }).notNull(),
  nguoiNhapId: integer('nguoi_nhap_id').notNull().references(() => nguoiDung.id),
  tongSo: integer('tong_so').notNull(),
  soThanhCong: integer('so_thanh_cong').notNull(),
  baoCaoLoi: jsonb('bao_cao_loi').notNull().default([]),
});
 
// 4. cau_hoi
export const cauHoi = pgTable('cau_hoi', {
  id: serial('id').primaryKey(),
  ma: varchar('ma', { length: 20 }).notNull().unique(),            // Q000123
  nutId: integer('nut_id').notNull(),
  nutCap: varchar('nut_cap', { length: 10 }).notNull().default('DANG'),
  phienBanHienTaiId: integer('phien_ban_hien_tai_id')
    .references((): AnyPgColumn => phienBanCauHoi.id),               // trỏ vòng: dùng hàm mũi tên
  biAn: boolean('bi_an').notNull().default(false),
  nguoiTaoId: integer('nguoi_tao_id').notNull().references(() => nguoiDung.id),
}, (t) => [
  check('ck_cau_hoi_nut_cap', sql`nut_cap = 'DANG'`),
  // Khóa ngoại ghép: nút được gắn PHẢI là nút cấp Dạng
  foreignKey({
    name: 'fk_cau_hoi_nut_dang',
    columns: [t.nutId, t.nutCap],
    foreignColumns: [nutKienThuc.id, nutKienThuc.cap],
  }),
]);
 
// 5. phien_ban_cau_hoi
export const phienBanCauHoi = pgTable('phien_ban_cau_hoi', {
  id: serial('id').primaryKey(),
  cauHoiId: integer('cau_hoi_id').notNull().references(() => cauHoi.id, { onDelete: 'restrict' }),
  soPhienBan: integer('so_phien_ban').notNull(),
  loaiCau: varchar('loai_cau', { length: 20 }).notNull(),
  mucDo: varchar('muc_do', { length: 20 }).notNull(),
  deBai: text('de_bai').notNull(),
  loiGiai: text('loi_giai').notNull().default(''),
  trangThai: varchar('trang_thai', { length: 20 }).notNull().default('NHAP'),
  nguon: varchar('nguon', { length: 20 }).notNull().default('THU_CONG'),
  loNhapId: integer('lo_nhap_id').references(() => loNhapCauHoi.id),
  nguoiTaoId: integer('nguoi_tao_id').notNull().references(() => nguoiDung.id),
  nguoiDuyetId: integer('nguoi_duyet_id').references(() => nguoiDung.id),
  duyetLuc: timestamp('duyet_luc', { withTimezone: true }),
}, (t) => [
  unique('uq_phien_ban').on(t.cauHoiId, t.soPhienBan),
  check('ck_pb_loai', sql`loai_cau IN ('TRAC_NGHIEM', 'DUNG_SAI')`),
  check('ck_pb_muc_do', sql`muc_do IN ('BIET', 'HIEU', 'VAN_DUNG')`),
  check('ck_pb_trang_thai', sql`trang_thai IN ('NHAP', 'DA_DUYET', 'DA_THAY_THE')`),
  check('ck_pb_nguon', sql`nguon IN ('THU_CONG', 'NHAP_FILE')`),
]);
 
// 6. lua_chon – 4 dòng cho mỗi phiên bản
export const luaChon = pgTable('lua_chon', {
  id: serial('id').primaryKey(),
  phienBanId: integer('phien_ban_id').notNull()
    .references(() => phienBanCauHoi.id, { onDelete: 'cascade' }),
  kyHieu: char('ky_hieu', { length: 1 }).notNull(),
  noiDung: text('noi_dung').notNull(),
  laDapAnDung: boolean('la_dap_an_dung').notNull(),
}, (t) => [
  unique('uq_lua_chon').on(t.phienBanId, t.kyHieu),
  check('ck_ky_hieu', sql`ky_hieu IN ('A', 'B', 'C', 'D', 'a', 'b', 'c', 'd')`),
]);
 
// 7. bo_luyen_tap
export const boLuyenTap = pgTable('bo_luyen_tap', {
  id: serial('id').primaryKey(),
  tieuDe: varchar('tieu_de', { length: 255 }).notNull(),
  nutPhamViId: integer('nut_pham_vi_id').notNull().references(() => nutKienThuc.id),
  thoiGianPhut: integer('thoi_gian_phut').notNull(),
  trangThai: varchar('trang_thai', { length: 20 }).notNull().default('CONG_BO'),
  daKhoa: boolean('da_khoa').notNull().default(false),
  nhanBanTuId: integer('nhan_ban_tu_id').references((): AnyPgColumn => boLuyenTap.id),
  nguoiTaoId: integer('nguoi_tao_id').notNull().references(() => nguoiDung.id),
}, () => [
  check('ck_bo_thoi_gian', sql`thoi_gian_phut > 0`),
  check('ck_bo_trang_thai', sql`trang_thai IN ('NHAP', 'CONG_BO', 'AN')`),
]);
 
// 8. cau_trong_bo – bảng trung gian bộ ↔ phiên bản câu
export const cauTrongBo = pgTable('cau_trong_bo', {
  id: serial('id').primaryKey(),
  boId: integer('bo_id').notNull().references(() => boLuyenTap.id, { onDelete: 'cascade' }),
  phienBanId: integer('phien_ban_id').notNull()
    .references(() => phienBanCauHoi.id, { onDelete: 'restrict' }),
  thuTu: smallint('thu_tu').notNull(),
}, (t) => [unique('uq_cau_trong_bo').on(t.boId, t.thuTu)]);
 
// 9. luot_lam_bai
export const luotLamBai = pgTable('luot_lam_bai', {
  id: serial('id').primaryKey(),
  hocSinhId: integer('hoc_sinh_id').notNull()
    .references(() => nguoiDung.id, { onDelete: 'cascade' }),
  boId: integer('bo_id').notNull().references(() => boLuyenTap.id, { onDelete: 'restrict' }),
  lanThu: integer('lan_thu').notNull(),
  trangThai: varchar('trang_thai', { length: 20 }).notNull().default('DANG_LAM'),
  batDauLuc: timestamp('bat_dau_luc', { withTimezone: true }).notNull(),
  hanNop: timestamp('han_nop', { withTimezone: true }).notNull(),
  nopLuc: timestamp('nop_luc', { withTimezone: true }),
  tongDiem: numeric('tong_diem', { precision: 5, scale: 2 }),
  diemThang10: numeric('diem_thang_10', { precision: 4, scale: 2 }),
  soCauDungHet: smallint('so_cau_dung_het'),
  maYeuCau: uuid('ma_yeu_cau').notNull().unique(),
}, (t) => [
  unique('uq_luot_lan_thu').on(t.hocSinhId, t.boId, t.lanThu),
  check('ck_luot_trang_thai', sql`trang_thai IN ('DANG_LAM', 'DA_NOP', 'HET_GIO')`),
  check('ck_luot_diem', sql`diem_thang_10 IS NULL OR diem_thang_10 BETWEEN 0 AND 10`),
  // Chỉ mục duy nhất CÓ ĐIỀU KIỆN: mỗi học sinh chỉ có 1 lượt đang làm với 1 bộ
  uniqueIndex('uq_luot_dang_lam').on(t.hocSinhId, t.boId).where(sql`trang_thai = 'DANG_LAM'`),
]);
 
// 10. cau_da_lam
export const cauDaLam = pgTable('cau_da_lam', {
  id: serial('id').primaryKey(),
  luotLamId: integer('luot_lam_id').notNull()
    .references(() => luotLamBai.id, { onDelete: 'cascade' }),
  thuTu: smallint('thu_tu').notNull(),
  phienBanId: integer('phien_ban_id').notNull()
    .references(() => phienBanCauHoi.id, { onDelete: 'restrict' }),
  traLoi: jsonb('tra_loi').$type<TraLoi>(),                         // null = chưa trả lời
  diem: numeric('diem', { precision: 4, scale: 2 }),
}, (t) => [unique('uq_cau_da_lam').on(t.luotLamId, t.thuTu)]);
