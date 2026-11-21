import { randomUUID } from 'crypto';
import { sql } from 'drizzle-orm';
import { KhoBoLuyenTapPostgres } from '../../src/kho/postgres/KhoBoLuyenTapPostgres';
import { KhoCauHoiPostgres } from '../../src/kho/postgres/KhoCauHoiPostgres';
import { KhoLuotLamPostgres } from '../../src/kho/postgres/KhoLuotLamPostgres';
import { KhoNguoiDungPostgres } from '../../src/kho/postgres/KhoNguoiDungPostgres';
import { CauTracNghiem } from '../../src/nghiep-vu/cau-hoi/CauTracNghiem';
import { NhaMayCauHoi } from '../../src/nghiep-vu/cau-hoi/NhaMayCauHoi';
import { BoChamDiem } from '../../src/nghiep-vu/lam-bai/BoChamDiem';
import { CauDaLam } from '../../src/nghiep-vu/lam-bai/CauDaLam';
import { LuotLamBai } from '../../src/nghiep-vu/lam-bai/LuotLamBai';
import { LoiDaNopBai } from '../../src/nghiep-vu/loi/LoiNghiepVu';
import { BoLuyenTap } from '../../src/nghiep-vu/luyen-tap/BoLuyenTap';
import { HocSinh, QuanTriVien } from '../../src/nghiep-vu/tai-khoan/NguoiDung';
import { DongHoGia } from '../nghiep-vu/tro-giup';
import { chuanBiCSDL, db, jsonTracNghiem, pool, taoNutDang, xoaSachDuLieu } from './chuan-bi';
 
jest.setTimeout(20_000); // truy vấn CSDL chậm hơn kiểm thử thuần
 
const nhaMay = new NhaMayCauHoi();
const khoNguoiDung = new KhoNguoiDungPostgres(db);
const khoCauHoi = new KhoCauHoiPostgres(db, nhaMay);
const khoBo = new KhoBoLuyenTapPostgres(db);
const dongHo = new DongHoGia(new Date('2026-11-21T08:00:00Z'));
const khoLuot = new KhoLuotLamPostgres(db, khoCauHoi, dongHo, new BoChamDiem());
 
const demDong = async (bang: string) =>
  (await db.execute(sql.raw(`SELECT count(*)::int AS n FROM ${bang}`))).rows[0].n as number;
 
beforeAll(chuanBiCSDL);
beforeEach(xoaSachDuLieu);
afterAll(() => pool.end());
 
// Tạo sẵn: 1 quản trị viên, 1 nút Dạng, n câu trắc nghiệm => trả về id các phiên bản
async function taoNganHang(n: number) {
  const qt = await khoNguoiDung.them(new QuanTriVien('', 'qt@test.vn', 'bam', 'Quản trị'));
  const nutId = await taoNutDang();
  const ids: string[] = [];
  for (let i = 1; i <= n; i++) {
    const pb = await khoCauHoi.themCauMoi(
      { ma: `Q${String(i).padStart(6, '0')}`, nutId, nguoiTaoId: qt.id },
      nhaMay.tao(jsonTracNghiem(`Câu số ${i}`)),
    );
    ids.push(pb.id);
  }
  return { qt, nutId, ids };
}
 
describe('KhoNguoiDungPostgres', () => {
  test('thêm rồi đọc lại đúng lớp con và trạng thái', async () => {
    const hs = await khoNguoiDung.them(new HocSinh('', 'hs@test.vn', 'bam', 'Học sinh A'));
    expect(hs.id).not.toBe('');
    const docLai = await khoNguoiDung.timTheoId(hs.id);
    expect(docLai).toBeInstanceOf(HocSinh);
    expect(docLai!.email).toBe('hs@test.vn');
  });
 
  test('khóa tài khoản, lưu, đọc lại thấy BI_KHOA', async () => {
    const qt = await khoNguoiDung.them(new QuanTriVien('', 'qt@test.vn', 'bam', 'Quản trị'));
    const hs = await khoNguoiDung.them(new HocSinh('', 'hs@test.vn', 'bam', 'Học sinh A'));
    (qt as QuanTriVien).khoaTaiKhoan(hs);
    await khoNguoiDung.luu(hs);
    expect((await khoNguoiDung.timTheoEmail('hs@test.vn'))!.trangThai).toBe('BI_KHOA');
  });
 
  test('email trùng bị CSDL từ chối', async () => {
    await khoNguoiDung.them(new HocSinh('', 'trung@test.vn', 'bam', 'Học sinh A'));
    await expect(khoNguoiDung.them(new HocSinh('', 'trung@test.vn', 'bam', 'Học sinh B'))).rejects.toThrow();
  });
});
 
describe('KhoCauHoiPostgres', () => {
  test('1 câu trắc nghiệm = 1 cau_hoi + 1 phien_ban + 4 lua_chon; đọc lại chấm đúng', async () => {
    const { ids } = await taoNganHang(1);
    expect(await demDong('cau_hoi')).toBe(1);
    expect(await demDong('phien_ban_cau_hoi')).toBe(1);
    expect(await demDong('lua_chon')).toBe(4);
 
    const pb = await khoCauHoi.timTheoId(ids[0]);
    expect(pb!.noiDung).toBeInstanceOf(CauTracNghiem);
    expect(pb!.noiDung.cham({ loai: 'TRAC_NGHIEM', chon: 'B' })).toBe(1);
  });
 
  test('giao dịch: lỗi giữa chừng thì KHÔNG còn dòng nào được ghi', async () => {
    const qt = await khoNguoiDung.them(new QuanTriVien('', 'qt@test.vn', 'bam', 'Quản trị'));
    const nutId = await taoNutDang();
    // lo_nhap_id = 999 không tồn tại => lỗi khóa ngoại ở bước 2 (sau khi đã thêm cau_hoi)
    await expect(khoCauHoi.themCauMoi(
      { ma: 'Q000001', nutId, nguoiTaoId: qt.id, loNhapId: '999' },
      nhaMay.tao(jsonTracNghiem()),
    )).rejects.toThrow();
    expect(await demDong('cau_hoi')).toBe(0); // dòng cau_hoi ở bước 1 đã bị hoàn tác
  });
 
  test('duyệt phiên bản rồi lưu, đọc lại thấy DA_DUYET', async () => {
    const { qt, ids } = await taoNganHang(1);
    const pb = (await khoCauHoi.timTheoId(ids[0]))!;
    pb.duyet(qt, new Date());
    await khoCauHoi.luu(pb);
    expect((await khoCauHoi.timTheoId(ids[0]))!.trangThai).toBe('DA_DUYET');
  });
});
 
describe('KhoBoLuyenTapPostgres', () => {
  test('thêm bộ 5 câu, đọc lại đúng thứ tự; khóa rồi lưu', async () => {
    const { qt, nutId, ids } = await taoNganHang(5);
    const bo = await khoBo.them(new BoLuyenTap('', 'Bộ 1', 15, ids), { nguoiTaoId: qt.id, nutPhamViId: nutId });
    expect(bo.cacCau.map((c) => c.phienBanId)).toEqual(ids);
 
    bo.khoa();
    await khoBo.luu(bo);
    expect((await khoBo.timTheoId(bo.id))!.daKhoa).toBe(true);
  });
});
 
describe('KhoLuotLamPostgres', () => {
  async function batDauLuot() {
    const { qt, nutId, ids } = await taoNganHang(5);
    const bo = await khoBo.them(new BoLuyenTap('', 'Bộ 1', 15, ids), { nguoiTaoId: qt.id, nutPhamViId: nutId });
    const hs = await khoNguoiDung.them(new HocSinh('', 'hs@test.vn', 'bam', 'Học sinh A'));
    const cacPB = await khoCauHoi.timNhieuTheoId(ids);
    const cacCau = cacPB.map((pb, i) => new CauDaLam(i + 1, pb.id, pb.noiDung));
    const luot = LuotLamBai.batDau('', cacCau, bo.thoiGianPhut, dongHo, new BoChamDiem());
    return { hs, bo, luot };
  }
 
  test('làm bài – nộp – lưu – đọc lại: giữ nguyên trạng thái, điểm, câu trả lời', async () => {
    const { hs, bo, luot } = await batDauLuot();
    const daLuu = await khoLuot.themLuotMoi(luot, { hocSinhId: hs.id, boId: bo.id, maYeuCau: randomUUID() });
 
    daLuu.traLoi(1, { loai: 'TRAC_NGHIEM', chon: 'B' }); // đúng
    daLuu.traLoi(2, { loai: 'TRAC_NGHIEM', chon: 'A' }); // sai
    const kq = daLuu.nopBai();
    await khoLuot.luu(daLuu);
 
    const docLai = (await khoLuot.timTheoId(daLuu.id))!;
    expect(docLai.tenTrangThai).toBe('DA_NOP');
    expect(docLai.ketQua!.diemThang10).toBe(kq.diemThang10); // 1/5*10 = 2
    expect(docLai.cacCauDaLam[0].traLoi).toEqual({ loai: 'TRAC_NGHIEM', chon: 'B' });
    // Trạng thái được dựng lại đúng: đã nộp thì không trả lời tiếp được
    expect(() => docLai.traLoi(3, { loai: 'TRAC_NGHIEM', chon: 'B' })).toThrow(LoiDaNopBai);
  });
 
  test('một học sinh không thể có 2 lượt ĐANG LÀM cùng một bộ', async () => {
    const { hs, bo, luot } = await batDauLuot();
    await khoLuot.themLuotMoi(luot, { hocSinhId: hs.id, boId: bo.id, maYeuCau: randomUUID() });
    await expect(
      khoLuot.themLuotMoi(luot, { hocSinhId: hs.id, boId: bo.id, maYeuCau: randomUUID() }),
    ).rejects.toThrow();
  });
});
