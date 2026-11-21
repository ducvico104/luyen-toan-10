import { NoiDungCauHoi } from "../cau-hoi/NoiDungCauHoi";
import { TraLoi } from "../cau-hoi/TraLoi";

// Một câu đã giao trong lượt làm: nội dung câu + câu trả lời + điểm
export class CauDaLam {
  constructor(
    readonly thuTu: number,
    readonly phienBanId: string,
    readonly noiDung: NoiDungCauHoi,
    // Hai tham số có giá trị mặc định: tạo mới thì bỏ qua, đọc từ CSDL thì truyền vào
    private _traLoi: TraLoi | null = null,
    private _diem: number | null = null,
  ) {}

  get traLoi(): TraLoi | null {
    return this._traLoi;
  }
  get diem(): number | null {
    return this._diem;
  }

  ghiTraLoi(traLoi: TraLoi): void {
    this._traLoi = traLoi;
  }

  chamDiem(): number {
    this._diem = this.noiDung.cham(this._traLoi); // đa hình: không cần biết loại câu
    return this._diem;
  }
}
