import { CauDungSai } from '../../src/nghiep-vu/cau-hoi/CauDungSai';
import { CauTracNghiem } from '../../src/nghiep-vu/cau-hoi/CauTracNghiem';
import { LuaChon } from '../../src/nghiep-vu/cau-hoi/LuaChon';
import { IDongHo } from '../../src/nghiep-vu/lam-bai/DongHo';

// Câu trắc nghiệm mẫu, đáp án đúng là `dapAn`
export const taoCauTracNghiem = (dapAn = 'B') =>
  new CauTracNghiem('Tập nghiệm của $x^2 - 1 = 0$ là', 'BIET', 'Giải ra $x = \\pm 1$',
    ['A', 'B', 'C', 'D'].map((k) => new LuaChon(k, `Lựa chọn ${k}`, k === dapAn)));

// Câu đúng/sai mẫu: đáp án a Đúng, b Sai, c Đúng, d Sai
export const taoCauDungSai = () =>
  new CauDungSai('Cho hàm số $y = 2x + 1$. Xét tính đúng sai:', 'HIEU', '...', [
    new LuaChon('a', 'Hàm số đồng biến', true),
    new LuaChon('b', 'Đồ thị đi qua O', false),
    new LuaChon('c', 'Cắt trục tung tại (0;1)', true),
    new LuaChon('d', 'Hệ số góc bằng 1', false),
  ]);

// Đồng hồ giả: kiểm thử tự "vặn kim" mà không phải chờ thật
export class DongHoGia implements IDongHo {
  constructor(private hienTai: Date) {}
  bayGio(): Date { return new Date(this.hienTai); }
  troiQua(phut: number): void {
    this.hienTai = new Date(this.hienTai.getTime() + phut * 60_000);
  }
}
