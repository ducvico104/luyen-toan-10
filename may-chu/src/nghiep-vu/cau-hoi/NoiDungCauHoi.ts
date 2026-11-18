import { LoiCauHoiSai } from "../loi/LoiNghiepVu";
import { LuaChon } from "./LuaChon";
import { TraLoi } from "./TraLoi";

export type MucDo = "BIET" | "HIEU" | "VAN_DUNG";
export type LoaiCau = "TRAC_NGHIEM" | "DUNG_SAI";
// Bản gửi cho học sinh khi đang làm bài: KHÔNG có đáp án, KHÔNG có lời giải
export interface CauHoiChoHocSinh {
  loai: LoaiCau;
  de: string;
  luaChon: { kyHieu: string; noiDung: string }[];
}

// Lớp trừu tượng: phần chung của mọi loại câu.
export abstract class NoiDungCauHoi {
  protected readonly luaChon: readonly LuaChon[];

  constructor(
    readonly de: string,
    readonly mucDo: MucDo,
    readonly loiGiai: string,
    luaChon: LuaChon[],
  ) {
    this.luaChon = Object.freeze([...luaChon]); // sao chép + đóng băng: bên ngoài không sửa được
  }

  abstract readonly loai: LoaiCau;

  // Mỗi loại câu chấm theo cách riêng => đa hình
  abstract cham(traLoi: TraLoi | null): number;

  // Kiểm tra phần chung; lớp con ghi đè, gọi super.kiemTra() rồi kiểm tra thêm phần riêng
  kiemTra(): void {
    if (this.de.trim() === "")
      throw new LoiCauHoiSai("Đề bài không được để trống");
    if (this.luaChon.some((l) => l.noiDung.trim() === "")) {
      throw new LoiCauHoiSai("Nội dung lựa chọn không được để trống");
    }
  }

  banChoHocSinh(): CauHoiChoHocSinh {
    return {
      loai: this.loai,
      de: this.de,
      luaChon: this.luaChon.map((l) => ({
        kyHieu: l.kyHieu,
        noiDung: l.noiDung,
      })),
    };
  }

  // Danh sách lựa chọn kèm đáp án, chỉ dùng sau khi nộp bài
  layLuaChon(): readonly LuaChon[] {
    return this.luaChon;
  }
}
