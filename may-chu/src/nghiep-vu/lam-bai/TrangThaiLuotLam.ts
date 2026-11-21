import { LoiDaNopBai, LoiHetGio } from '../loi/LoiNghiepVu';

export type TenTrangThai = 'DANG_LAM' | 'DA_NOP' | 'HET_GIO';

// Mẫu Trạng thái (State): hành vi phụ thuộc trạng thái nằm trong lớp trạng thái
export interface ITrangThaiLuotLam {
  readonly ten: TenTrangThai;
  kiemTraDuocTraLoi(): void; // không được thì ném lỗi
  daKetThuc(): boolean;
}

export class DangLam implements ITrangThaiLuotLam {
  readonly ten = 'DANG_LAM' as const;
  kiemTraDuocTraLoi(): void { /* đang làm: được phép */ }
  daKetThuc(): boolean { return false; }
}

export class DaNop implements ITrangThaiLuotLam {
  readonly ten = 'DA_NOP' as const;
  kiemTraDuocTraLoi(): void { throw new LoiDaNopBai('Bài đã nộp, không sửa được câu trả lời'); }
  daKetThuc(): boolean { return true; }
}

export class HetGio implements ITrangThaiLuotLam {
  readonly ten = 'HET_GIO' as const;
  kiemTraDuocTraLoi(): void { throw new LoiHetGio('Đã hết giờ làm bài'); }
  daKetThuc(): boolean { return true; }
}
