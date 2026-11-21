import { CauHoiChoHocSinh } from '../cau-hoi/NoiDungCauHoi';
import { TraLoi } from '../cau-hoi/TraLoi';
import { LoiDuLieuKhongHopLe } from '../loi/LoiNghiepVu';
import { BoChamDiem, KetQua } from './BoChamDiem';
import { CauDaLam } from './CauDaLam';
import { IDongHo } from './DongHo';
import { DaNop, DangLam, HetGio, ITrangThaiLuotLam } from './TrangThaiLuotLam';

export class LuotLamBai {
  private trangThai: ITrangThaiLuotLam = new DangLam();
  private _ketQua: KetQua | null = null;
  private _nopLuc: Date | null = null;
  readonly batDauLuc: Date;
  readonly hanNop: Date;

  // private: bên ngoài phải dùng LuotLamBai.batDau(...)
  private constructor(
    readonly id: string,
    private readonly cacCau: readonly CauDaLam[],
    thoiGianPhut: number,
    private readonly dongHo: IDongHo,
    private readonly boCham: BoChamDiem,
  ) {
    if (cacCau.length === 0) throw new LoiDuLieuKhongHopLe('Lượt làm bài phải có ít nhất 1 câu');
    this.batDauLuc = dongHo.bayGio(); // giờ do MÁY CHỦ quyết định
    this.hanNop = new Date(this.batDauLuc.getTime() + thoiGianPhut * 60_000);
  }

  static batDau(
    id: string, cacCau: CauDaLam[], thoiGianPhut: number, dongHo: IDongHo, boCham: BoChamDiem,
  ): LuotLamBai {
    return new LuotLamBai(id, cacCau, thoiGianPhut, dongHo, boCham);
  }

  get tenTrangThai() { return this.trangThai.ten; }
  get ketQua(): KetQua | null { return this._ketQua; }
  get nopLuc(): Date | null { return this._nopLuc; }

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
