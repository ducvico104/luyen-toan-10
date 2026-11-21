import { readFileSync } from 'fs';
import path from 'path';
import { sql } from 'drizzle-orm';
import { CSDL, taoKetNoi } from './ket-noi';
import { nutKienThuc } from './schema';
import { KhoBoLuyenTapPostgres } from '../../kho/postgres/KhoBoLuyenTapPostgres';
import { KhoCauHoiPostgres } from '../../kho/postgres/KhoCauHoiPostgres';
import { KhoNguoiDungPostgres } from '../../kho/postgres/KhoNguoiDungPostgres';
import { LoNhapCauHoi } from '../../nghiep-vu/cau-hoi/LoNhapCauHoi';
import { CauHoiJson, NhaMayCauHoi } from '../../nghiep-vu/cau-hoi/NhaMayCauHoi';
import { BoLuyenTap } from '../../nghiep-vu/luyen-tap/BoLuyenTap';
import { QuanTriVien } from '../../nghiep-vu/tai-khoan/NguoiDung';

// ===== 1. KHAI BÁO CÂY KIẾN THỨC =====
// Muốn thêm dạng mới: thêm 1 dòng vào "dang" và tạo file du-lieu/<mã dạng>.json
interface Dang { ma: string; ten: string }
interface Bai { ma: string; ten: string; dang: Dang[] }

const CAY = {
  mon: { ma: 'T', ten: 'Toán' },
  lop: { ma: 'T10', ten: 'Lớp 10' },
  chuong: { ma: 'T10.C1', ten: 'Chương 1. Mệnh đề và tập hợp' },
  bai: [
    {
      ma: 'T10.C1.B1', ten: 'Bài 1. Mệnh đề',
      dang: [{ ma: 'T10.C1.B1.D1', ten: 'Dạng 1. Nhận diện, xét tính đúng sai của mệnh đề, mệnh đề chứa biến' }],
    },
  ] as Bai[],
};

const THOI_GIAN_PHUT = { TRAC_NGHIEM: 20, DUNG_SAI: 20 };

// ===== 2. HÀM TRỢ GIÚP =====
async function themNut(db: CSDL, cap: string, ma: string, ten: string, chaId: number | null, thuTu = 1) {
  const [n] = await db.insert(nutKienThuc).values({ nutChaId: chaId, cap, ma, ten, thuTu })
    .returning({ id: nutKienThuc.id });
  return n.id;
}

// Đọc file JSON của một dạng và kiểm tra bằng LoNhapCauHoi (giống chức năng nhập lô ở Giai đoạn 3).
// Có câu sai cấu trúc thì dừng hẳn, không nạp nửa vời.
function docCauHoi(nhaMay: NhaMayCauHoi, maDang: string) {
  const duongDan = path.join(__dirname, 'du-lieu', `${maDang}.json`);
  const danhSach = JSON.parse(readFileSync(duongDan, 'utf8')) as CauHoiJson[];
  const lo = LoNhapCauHoi.tuDanhSach(nhaMay, danhSach);
  if (lo.danhSachLoi.length > 0) {
    lo.danhSachLoi.forEach((l) => console.error(`  ${maDang} – câu ${l.viTri}: ${l.thongBao}`));
    throw new Error(`File ${maDang}.json có ${lo.danhSachLoi.length} câu lỗi, chưa nạp gì`);
  }
  return lo.cauHopLe;
}

// ===== 3. CHƯƠNG TRÌNH CHÍNH =====
async function main() {
  const { pool, db } = taoKetNoi(process.env.DATABASE_URL!);
  const nhaMay = new NhaMayCauHoi();
  const khoNguoiDung = new KhoNguoiDungPostgres(db);
  const khoCauHoi = new KhoCauHoiPostgres(db, nhaMay);
  const khoBo = new KhoBoLuyenTapPostgres(db);

  // Đọc và kiểm tra TẤT CẢ file trước khi đụng vào CSDL
  const cauTheoDang = new Map(
    CAY.bai.flatMap((b) => b.dang).map((d) => [d.ma, docCauHoi(nhaMay, d.ma)] as const),
  );

  // Xóa sạch dữ liệu cũ để chạy lại bao nhiêu lần cũng được (CHỈ dùng cho CSDL làm việc, không phải dữ liệu thật)
  await db.execute(sql`
    TRUNCATE nguoi_dung, nut_kien_thuc, lo_nhap_cau_hoi, cau_hoi, phien_ban_cau_hoi,
             lua_chon, bo_luyen_tap, cau_trong_bo, luot_lam_bai, cau_da_lam
    RESTART IDENTITY CASCADE`);

  // Mật khẩu sẽ được băm thật bằng bcrypt ở Giai đoạn 3
  const qt = await khoNguoiDung.them(new QuanTriVien('', 'admin@luyentoan10.vn', 'CHUA_BAM', 'Quản trị viên'));

  const monId = await themNut(db, 'MON', CAY.mon.ma, CAY.mon.ten, null);
  const lopId = await themNut(db, 'LOP', CAY.lop.ma, CAY.lop.ten, monId);
  const chuongId = await themNut(db, 'CHUONG', CAY.chuong.ma, CAY.chuong.ten, lopId);

  let soCau = 0;
  let soBo = 0;
  for (const [i, bai] of CAY.bai.entries()) {
    const baiId = await themNut(db, 'BAI', bai.ma, bai.ten, chuongId, i + 1);

    for (const [j, dang] of bai.dang.entries()) {
      const dangId = await themNut(db, 'DANG', dang.ma, dang.ten, baiId, j + 1);
      const idsTheoLoai = { TRAC_NGHIEM: [] as string[], DUNG_SAI: [] as string[] };

      for (const noiDung of cauTheoDang.get(dang.ma)!) {
        soCau++;
        const pb = await khoCauHoi.themCauMoi(
          { ma: `Q${String(soCau).padStart(6, '0')}`, nutId: String(dangId), nguoiTaoId: qt.id }, noiDung);
        pb.duyet(qt, new Date()); // dữ liệu mẫu đã kiểm tra => duyệt luôn để học sinh làm được
        await khoCauHoi.luu(pb);
        idsTheoLoai[noiDung.loai].push(pb.id);
      }

      // Mỗi loại câu đủ 5–30 câu thì tạo một bộ luyện tập
      for (const loai of ['TRAC_NGHIEM', 'DUNG_SAI'] as const) {
        const ids = idsTheoLoai[loai];
        if (ids.length < BoLuyenTap.SO_CAU_TOI_THIEU) continue;
        const ten = `${dang.ten} – ${loai === 'TRAC_NGHIEM' ? 'Trắc nghiệm' : 'Đúng/Sai'}`;
        const bo = await khoBo.them(
          new BoLuyenTap('', ten, THOI_GIAN_PHUT[loai], ids.slice(0, BoLuyenTap.SO_CAU_TOI_DA)),
          { nguoiTaoId: qt.id, nutPhamViId: String(dangId) },
        );
        soBo++;
        console.log(`  Bộ "${bo.ten}": ${bo.cacCau.length} câu, ${bo.thoiGianPhut} phút`);
      }
    }
  }

  console.log(`Đã tạo: 1 quản trị viên, ${soCau} câu hỏi (đã duyệt), ${soBo} bộ luyện tập`);
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
