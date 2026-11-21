import { ChamChiaDeu } from '../../src/nghiep-vu/cau-hoi/CachChamDungSai';
import { CauDungSai } from '../../src/nghiep-vu/cau-hoi/CauDungSai';
import { CauTracNghiem } from '../../src/nghiep-vu/cau-hoi/CauTracNghiem';
import { LuaChon } from '../../src/nghiep-vu/cau-hoi/LuaChon';
import { LoiCauHoiSai } from '../../src/nghiep-vu/loi/LoiNghiepVu';
import { taoCauDungSai, taoCauTracNghiem } from './tro-giup';

describe('CauTracNghiem', () => {
  test('chọn đúng được 1 điểm, chọn sai hoặc bỏ trống được 0', () => {
    const cau = taoCauTracNghiem('B');
    expect(cau.cham({ loai: 'TRAC_NGHIEM', chon: 'B' })).toBe(1);
    expect(cau.cham({ loai: 'TRAC_NGHIEM', chon: 'A' })).toBe(0);
    expect(cau.cham(null)).toBe(0);
  });

  test('không cho tạo câu có 2 đáp án đúng', () => {
    const luaChon = ['A', 'B', 'C', 'D'].map((k) => new LuaChon(k, `Ý ${k}`, k === 'A' || k === 'B'));
    expect(() => new CauTracNghiem('Đề', 'BIET', '', luaChon)).toThrow(LoiCauHoiSai);
  });

  test('không cho tạo câu có đề rỗng', () => {
    const luaChon = ['A', 'B', 'C', 'D'].map((k) => new LuaChon(k, `Ý ${k}`, k === 'A'));
    expect(() => new CauTracNghiem('   ', 'BIET', '', luaChon)).toThrow('Đề bài không được để trống');
  });

  test('bản gửi học sinh không lộ đáp án', () => {
    const ban = taoCauTracNghiem().banChoHocSinh();
    expect(ban.luaChon[0]).toEqual({ kyHieu: 'A', noiDung: 'Lựa chọn A' });
    expect(JSON.stringify(ban)).not.toContain('laDapAnDung');
  });
});

describe('CauDungSai', () => {
  // Đáp án mẫu: a Đúng, b Sai, c Đúng, d Sai
  test('chấm kiểu thi tốt nghiệp: 4 ý đúng = 1 điểm, 3 ý = 0,5, 2 ý = 0,25, 1 ý = 0,1', () => {
    const cau = taoCauDungSai();
    expect(cau.cham({ loai: 'DUNG_SAI', cacY: { a: true, b: false, c: true, d: false } })).toBe(1);
    expect(cau.cham({ loai: 'DUNG_SAI', cacY: { a: true, b: false, c: true, d: true } })).toBe(0.5);
    expect(cau.cham({ loai: 'DUNG_SAI', cacY: { a: true, b: false } })).toBe(0.25);
    expect(cau.cham({ loai: 'DUNG_SAI', cacY: { a: true } })).toBe(0.1);
  });

  test('thay cách chấm (mẫu Chiến lược) mà không sửa lớp CauDungSai', () => {
    const cau = new CauDungSai('Đề', 'HIEU', '', taoCauDungSai().layLuaChon().slice(), new ChamChiaDeu());
    expect(cau.cham({ loai: 'DUNG_SAI', cacY: { a: true, b: false, c: true, d: true } })).toBe(0.75);
  });

  test('trả lời sai loại (gửi kiểu trắc nghiệm) được 0 điểm', () => {
    expect(taoCauDungSai().cham({ loai: 'TRAC_NGHIEM', chon: 'A' })).toBe(0);
  });
});
