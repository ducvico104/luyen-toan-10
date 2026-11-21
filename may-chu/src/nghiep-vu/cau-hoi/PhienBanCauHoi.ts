import { LoiDuLieuKhongHopLe, LoiKhongCoQuyen } from '../loi/LoiNghiepVu';
import { NguoiDung } from '../tai-khoan/NguoiDung';
import { NoiDungCauHoi } from './NoiDungCauHoi';
 
export type TrangThaiPhienBan = 'NHAP' | 'DA_DUYET' | 'DA_THAY_THE';
 
// Một phiên bản nội dung của câu hỏi. Nội dung (đề, lựa chọn) không bao giờ đổi;
// chỉ trạng thái duyệt thay đổi, và chỉ qua phương thức có kiểm tra.
export class PhienBanCauHoi {
  constructor(
    readonly id: string,
    readonly cauHoiId: string,
    readonly soPhienBan: number,
    readonly noiDung: NoiDungCauHoi,
    readonly nguoiTaoId: string,
    private _trangThai: TrangThaiPhienBan = 'NHAP',
    private _nguoiDuyetId: string | null = null,
    private _duyetLuc: Date | null = null,
  ) {}
 
  get trangThai(): TrangThaiPhienBan { return this._trangThai; }
  get nguoiDuyetId(): string | null { return this._nguoiDuyetId; }
  get duyetLuc(): Date | null { return this._duyetLuc; }
 
  duyet(nguoiDuyet: NguoiDung, luc: Date): void {
    if (!nguoiDuyet.coQuyenQuanLy()) throw new LoiKhongCoQuyen('Chỉ quản trị viên được duyệt câu hỏi');
    if (this._trangThai !== 'NHAP') throw new LoiDuLieuKhongHopLe('Chỉ duyệt được phiên bản đang nháp');
    this._trangThai = 'DA_DUYET';
    this._nguoiDuyetId = nguoiDuyet.id;
    this._duyetLuc = luc;
  }
 
  // Gọi khi có phiên bản mới được duyệt thay cho phiên bản này
  biThayThe(): void {
    if (this._trangThai !== 'DA_DUYET') throw new LoiDuLieuKhongHopLe('Chỉ phiên bản đã duyệt mới bị thay thế');
    this._trangThai = 'DA_THAY_THE';
  }
}
