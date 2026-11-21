// Tách "lấy giờ hiện tại" ra một interface để khi kiểm thử thay bằng đồng hồ giả
export interface IDongHo {
  bayGio(): Date;
}

export class DongHoHeThong implements IDongHo {
  bayGio(): Date {
    return new Date();
  }
}