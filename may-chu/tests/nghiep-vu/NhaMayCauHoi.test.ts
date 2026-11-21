import { ChamChiaDeu } from '../../src/nghiep-vu/cau-hoi/CachChamDungSai';
import { CauDungSai } from '../../src/nghiep-vu/cau-hoi/CauDungSai';
import { CauTracNghiem } from '../../src/nghiep-vu/cau-hoi/CauTracNghiem';
import { LoNhapCauHoi } from '../../src/nghiep-vu/cau-hoi/LoNhapCauHoi';
import { CauHoiJson, NhaMayCauHoi } from '../../src/nghiep-vu/cau-hoi/NhaMayCauHoi';
import { LoiCauHoiSai } from '../../src/nghiep-vu/loi/LoiNghiepVu';

// Một câu JSON hợp lệ, giống file mẫu quản trị viên tải lên
const cauJsonTracNghiem = (): CauHoiJson => ({
  loai: 'TRAC_NGHIEM',
  mucDo: 'BIET',
  de: 'Tập nghiệm của phương trình $x^2 - 4 = 0$ là',
  loiGiai: '$x^2 = 4 \\Leftrightarrow x = \\pm 2$',
  luaChon: [
    { kyHieu: 'A', noiDung: '$\\{2\\}$', dung: false },
    { kyHieu: 'B', noiDung: '$\\{-2; 2\\}$', dung: true },
    { kyHieu: 'C', noiDung: '$\\{4\\}$', dung: false },
    { kyHieu: 'D', noiDung: '$\\varnothing$', dung: false },
  ],
});

const cauJsonDungSai = (): CauHoiJson => ({
  loai: 'DUNG_SAI',
  mucDo: 'HIEU',
  de: 'Cho hàm số $y = 2x + 1$.',
  luaChon: [
    { kyHieu: 'a', noiDung: 'Đồng biến', dung: true },
    { kyHieu: 'b', noiDung: 'Đi qua O', dung: false },
    { kyHieu: 'c', noiDung: 'Cắt Oy tại (0;1)', dung: true },
    { kyHieu: 'd', noiDung: 'Hệ số góc 1', dung: false },
  ],
});

describe('NhaMayCauHoi', () => {
  const nhaMay = new NhaMayCauHoi();

  test('loai TRAC_NGHIEM tạo ra đối tượng CauTracNghiem', () => {
    const cau = nhaMay.tao(cauJsonTracNghiem());
    expect(cau).toBeInstanceOf(CauTracNghiem);
    expect(cau.cham({ loai: 'TRAC_NGHIEM', chon: 'B' })).toBe(1);
  });

  test('loai DUNG_SAI tạo ra đối tượng CauDungSai', () => {
    expect(nhaMay.tao(cauJsonDungSai())).toBeInstanceOf(CauDungSai);
  });

  test('mức độ lạ thì ném LoiCauHoiSai', () => {
    expect(() => nhaMay.tao({ ...cauJsonTracNghiem(), mucDo: 'KHO' })).toThrow(LoiCauHoiSai);
  });

  test('loại câu lạ thì ném LoiCauHoiSai', () => {
    expect(() => nhaMay.tao({ ...cauJsonTracNghiem(), loai: 'TU_LUAN' })).toThrow('Loại câu không hỗ trợ');
  });

  test('nhà máy truyền đúng cách chấm được tiêm vào cho câu đúng/sai', () => {
    const cau = new NhaMayCauHoi(new ChamChiaDeu()).tao(cauJsonDungSai());
    // 3 ý đúng: chia đều = 0,75 (nếu kiểu thi tốt nghiệp sẽ là 0,5)
    expect(cau.cham({ loai: 'DUNG_SAI', cacY: { a: true, b: false, c: true, d: true } })).toBe(0.75);
  });
});

describe('LoNhapCauHoi', () => {
  test('câu đúng thì nhận, câu sai thì ghi lỗi kèm vị trí, không dừng cả lô', () => {
    const lo = LoNhapCauHoi.tuDanhSach(new NhaMayCauHoi(), [
      cauJsonTracNghiem(),
      { ...cauJsonTracNghiem(), mucDo: 'KHO' }, // câu 2 lỗi
      cauJsonDungSai(),
      { ...cauJsonTracNghiem(), de: '' },        // câu 4 lỗi
    ]);
    expect(lo.tongSoCau).toBe(4);
    expect(lo.soThanhCong).toBe(2);
    expect(lo.danhSachLoi.map((l) => l.viTri)).toEqual([2, 4]);
  });

  test('lỗi lập trình (không phải LoiNghiepVu) thì không bị nuốt', () => {
    // luaChon có phần tử null: chương trình hỏng thật sự (TypeError), phải báo ra ngoài
    const hong = { ...cauJsonTracNghiem(), luaChon: [null] } as unknown as CauHoiJson;
    expect(() => LoNhapCauHoi.tuDanhSach(new NhaMayCauHoi(), [hong])).toThrow(TypeError);
  });
});
