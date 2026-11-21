import { LoiNghiepVu } from '../loi/LoiNghiepVu';
import { CauHoiJson, NhaMayCauHoi } from './NhaMayCauHoi';
import { NoiDungCauHoi } from './NoiDungCauHoi';

export interface LoiCauNhap {
  viTri: number;      // câu thứ mấy trong file (đếm từ 1)
  thongBao: string;
}

// Một lần nhập câu hỏi từ file: câu nào đúng thì nhận, câu nào sai thì ghi lỗi, không dừng cả lô
export class LoNhapCauHoi {
  private constructor(
    readonly tongSoCau: number,
    readonly cauHopLe: readonly NoiDungCauHoi[],
    readonly danhSachLoi: readonly LoiCauNhap[],
  ) {}

  get soThanhCong(): number { return this.cauHopLe.length; }

  static tuDanhSach(nhaMay: NhaMayCauHoi, danhSach: CauHoiJson[]): LoNhapCauHoi {
    const hopLe: NoiDungCauHoi[] = [];
    const loi: LoiCauNhap[] = [];
    danhSach.forEach((du, i) => {
      try {
        hopLe.push(nhaMay.tao(du));
      } catch (e) {
        if (!(e instanceof LoiNghiepVu)) throw e; // lỗi lập trình thì không nuốt
        loi.push({ viTri: i + 1, thongBao: e.message });
      }
    });
    return new LoNhapCauHoi(danhSach.length, hopLe, loi);
  }
}
