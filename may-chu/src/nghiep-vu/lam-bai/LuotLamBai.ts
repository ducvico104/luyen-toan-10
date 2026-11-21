import { CauHoiChoHocSinh } from '../cau-hoi/NoiDungCauHoi';
import { TraLoi } from '../cau-hoi/TraLoi';
import { LoiDuLieuKhongHopLe } from '../loi/LoiNghiepVu';
import { BoChamDiem, KetQua } from './BoChamDiem';
import { CauDaLam } from './CauDaLam';
import { IDongHo } from './DongHo';
import { DaNop, DangLam, HetGio, ITrangThaiLuotLam, TenTrangThai, taoTrangThai } from './TrangThaiLuotLam';
 
// Dữ liệu đọc từ CSDL để dựng lại một lượt làm đang dở hoặc đã xong
export interface DuLieuKhoiPhucLuot {
  id: string;
  cacCau: CauDaLam[];
  batDauLuc: Date;
  hanNop: Date;
  tenTrangThai: TenTrangThai;
  ketQua: KetQua | null;
  nopLuc: Date | null;
}
 
export class LuotLamBai {
  // private: bên ngoài chỉ tạo qua LuotLamBai.batDau(...) hoặc LuotLamBai.khoiPhuc(...)
  private constructor(
    readonly id: string,
    private readonly cacCau: readonly CauDaLam[],
    readonly batDauLuc: Date,
    readonly hanNop: Date,
    private readonly dongHo: IDongHo,
    private readonly boCham: BoChamDiem,
    private trangThai: ITrangThaiLuotLam = new DangLam(),
    private _ketQua: KetQua | null = null,
    private _nopLuc: Date | null = null,
  ) {
    if (cacCau.length === 0) throw new LoiDuLieuKhongHopLe('Lượt làm bài phải có ít nhất 1 câu');
  }
 
  // Bắt đầu lượt MỚI: giờ bắt đầu do MÁY CHỦ quyết định
  static batDau(
    id: string, cacCau: CauDaLam[], thoiGianPhut: number, dongHo: IDongHo, boCham: BoChamDiem,
  ): LuotLamBai {
    const batDauLuc = dongHo.bayGio();
    const hanNop = new Date(batDauLuc.getTime() + thoiGianPhut * 60_000);
    return new LuotLamBai(id, cacCau, batDauLuc, hanNop, dongHo, boCham);
  }
 
  // Dựng lại lượt ĐÃ CÓ từ CSDL: giữ nguyên giờ bắt đầu, hạn nộp, trạng thái, kết quả
  static khoiPhuc(du: DuLieuKhoiPhucLuot, dongHo: IDongHo, boCham: BoChamDiem): LuotLamBai {
    return new LuotLamBai(
      du.id, du.cacCau, du.batDauLuc, du.hanNop, dongHo, boCham,
      taoTrangThai(du.tenTrangThai), du.ketQua, du.nopLuc,
    );
  }
 
  get tenTrangThai(): TenTrangThai { return this.trangThai.ten; }
  get ketQua(): KetQua | null { return this._ketQua; }
  get nopLuc(): Date | null { return this._nopLuc; }
  // Kho cần đọc từng câu để lưu câu trả lời; readonly nên bên ngoài không thêm/bớt câu được
  get cacCauDaLam(): readonly CauDaLam[] { return this.cacCau; }
 
  // Đề gửi cho học sinh: không có đáp án
  deChoHocSinh(): CauHoiChoHocSinh[] {
    return this.cacCau.map((c) => c.noiDung.banChoHocSinh());
  }
 
  traLoi(thuTu: number, traLoi: TraLoi): void {
    this.kiemTraHetGio();
    this.trangThai.kiemTraDuocTraLoi();
    const cau = this.cacCau.find((c) => c.thuTu === thuTu);
    if (!cau) throw new LoiDuLieuKhongHopLe(`Không có câu số ${thuTu}`);
    cau.ghiTraLoi(traLoi);
  }
 
  nopBai(): KetQua {
    this.kiemTraHetGio();
    if (!this.trangThai.daKetThuc()) this.ketThuc(new DaNop());
    return this._ketQua!; // nộp lại nhiều lần: trả kết quả cũ, không chấm lại
  }
 
  // Nếu đã quá hạn mà còn "đang làm" thì tự nộp với các câu đã trả lời
  kiemTraHetGio(): void {
    if (!this.trangThai.daKetThuc() && this.dongHo.bayGio() > this.hanNop) {
      this.ketThuc(new HetGio());
    }
  }
 
  private ketThuc(trangThaiMoi: ITrangThaiLuotLam): void {
    this._ketQua = this.boCham.cham(this.cacCau);
    this._nopLuc = this.dongHo.bayGio();
    this.trangThai = trangThaiMoi;
  }
}
