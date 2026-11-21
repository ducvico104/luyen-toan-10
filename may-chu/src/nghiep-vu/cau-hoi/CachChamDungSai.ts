// Mẫu Chiến lược (Strategy): "cách chấm" là một đối tượng có thể thay thế.
export interface ICachChamDungSai {
  tinhDiem(soYDung: number): number; // soYDung: 0..4
}

// Kiểu đề thi tốt nghiệp THPT: đúng 1/2/3/4 ý được 0,1 / 0,25 / 0,5 / 1 điểm
export class ChamKieuThiTotNghiep implements ICachChamDungSai {
  private static readonly BANG_DIEM = [0, 0.1, 0.25, 0.5, 1];

  tinhDiem(soYDung: number): number {
    return ChamKieuThiTotNghiep.BANG_DIEM.at(soYDung) ?? 0;
  }
}

// Mỗi ý đúng được 0,25 điểm
export class ChamChiaDeu implements ICachChamDungSai {
  tinhDiem(soYDung: number): number {
    return soYDung * 0.25;
  }
}
