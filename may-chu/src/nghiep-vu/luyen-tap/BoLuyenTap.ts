import { LoiBoDaKhoa, LoiDuLieuKhongHopLe } from '../loi/LoiNghiepVu';

// Một câu trong bộ: thứ tự + phiên bản câu hỏi (không trỏ tới "câu hỏi" chung)
export class CauTrongBo {
  constructor(readonly thuTu: number, readonly phienBanId: string) {}
}

export class BoLuyenTap {
  static readonly SO_CAU_TOI_THIEU = 5;
  static readonly SO_CAU_TOI_DA = 30;

  private _cacCau: CauTrongBo[] = [];
  private _daKhoa: boolean;

  constructor(
    readonly id: string,
    readonly ten: string,
    readonly thoiGianPhut: number,
    phienBanIds: string[],
    daKhoa = false,
    readonly boGocId: string | null = null,
  ) {
    if (thoiGianPhut <= 0) throw new LoiDuLieuKhongHopLe('Thời gian làm bài phải lớn hơn 0');
    this._daKhoa = false;
    this.datCauHoi(phienBanIds);
    this._daKhoa = daKhoa;
  }

  get daKhoa(): boolean { return this._daKhoa; }
  get cacCau(): readonly CauTrongBo[] { return this._cacCau; }

  datCauHoi(phienBanIds: string[]): void {
    if (this._daKhoa) throw new LoiBoDaKhoa('Bộ đã có người làm, muốn sửa hãy nhân bản');
    const n = phienBanIds.length;
    if (n < BoLuyenTap.SO_CAU_TOI_THIEU || n > BoLuyenTap.SO_CAU_TOI_DA) {
      throw new LoiDuLieuKhongHopLe(`Bộ luyện tập phải có 5–30 câu, đang có ${n}`);
    }
    if (new Set(phienBanIds).size !== n) throw new LoiDuLieuKhongHopLe('Một câu bị lặp trong bộ');
    this._cacCau = phienBanIds.map((id, i) => new CauTrongBo(i + 1, id));
  }

  // Gọi khi học sinh đầu tiên bắt đầu làm bộ này
  khoa(): void {
    this._daKhoa = true;
  }

  nhanBan(idMoi: string, tenMoi = `${this.ten} (bản sao)`): BoLuyenTap {
    const ids = this._cacCau.map((c) => c.phienBanId);
    return new BoLuyenTap(idMoi, tenMoi, this.thoiGianPhut, ids, false, this.id);
  }
}
