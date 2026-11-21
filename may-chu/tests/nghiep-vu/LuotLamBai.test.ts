import { BoChamDiem } from '../../src/nghiep-vu/lam-bai/BoChamDiem';
import { CauDaLam } from '../../src/nghiep-vu/lam-bai/CauDaLam';
import { LuotLamBai } from '../../src/nghiep-vu/lam-bai/LuotLamBai';
import { LoiDaNopBai, LoiHetGio } from '../../src/nghiep-vu/loi/LoiNghiepVu';
import { DongHoGia, taoCauDungSai, taoCauTracNghiem } from './tro-giup';

// Lượt làm 2 câu, 30 phút, bắt đầu lúc 8:00 theo đồng hồ giả
const taoLuot = (dongHo: DongHoGia) =>
  LuotLamBai.batDau(
    'luot-1',
    [new CauDaLam(1, 'pb-1', taoCauTracNghiem('B')), new CauDaLam(2, 'pb-2', taoCauDungSai())],
    30,
    dongHo,
    new BoChamDiem(),
  );

describe('LuotLamBai', () => {
  let dongHo: DongHoGia;
  beforeEach(() => {
    dongHo = new DongHoGia(new Date('2026-11-21T08:00:00'));
  });

  test('hạn nộp = giờ bắt đầu + thời gian làm', () => {
    expect(taoLuot(dongHo).hanNop).toEqual(new Date('2026-11-21T08:30:00'));
  });

  test('đề gửi học sinh không có đáp án', () => {
    const de = taoLuot(dongHo).deChoHocSinh();
    expect(de).toHaveLength(2);
    expect(JSON.stringify(de)).not.toContain('laDapAnDung');
  });

  test('nộp đúng giờ: chấm điểm thang 10 = tổng điểm ÷ số câu × 10', () => {
    const luot = taoLuot(dongHo);
    luot.traLoi(1, { loai: 'TRAC_NGHIEM', chon: 'B' });                                 // 1 điểm
    luot.traLoi(2, { loai: 'DUNG_SAI', cacY: { a: true, b: false, c: true, d: true } }); // 3 ý đúng: 0,5
    dongHo.troiQua(10);
    const kq = luot.nopBai();
    expect(kq.tongDiem).toBe(1.5);
    expect(kq.diemThang10).toBe(7.5);
    expect(luot.tenTrangThai).toBe('DA_NOP');
  });

  test('đã nộp thì không sửa được câu trả lời', () => {
    const luot = taoLuot(dongHo);
    luot.nopBai();
    expect(() => luot.traLoi(1, { loai: 'TRAC_NGHIEM', chon: 'A' })).toThrow(LoiDaNopBai);
  });

  test('quá hạn: tự nộp với các câu đã làm, trả lời tiếp thì báo hết giờ', () => {
    const luot = taoLuot(dongHo);
    luot.traLoi(1, { loai: 'TRAC_NGHIEM', chon: 'B' });
    dongHo.troiQua(31); // "vặn kim" vượt hạn, không phải chờ 31 phút thật
    expect(() => luot.traLoi(2, { loai: 'DUNG_SAI', cacY: { a: true } })).toThrow(LoiHetGio);
    expect(luot.tenTrangThai).toBe('HET_GIO');
    expect(luot.ketQua?.diemThang10).toBe(5); // 1 điểm / 2 câu × 10
  });
});
