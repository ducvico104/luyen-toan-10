//Lớp cha trừu tượng cho mọi nghiệp vụ
//Mỗi lớp con tự biết mã HTTP của mình (Đa hình) => Tầng điều khiển không cần if/else

export abstract class LoiNghiepVu extends Error {
    constructor(thongBao : string) {
        super(thongBao);
        this.name = new.target.name; //Tên lớp con thật sự, ví dụ "LoiHetGio"
    }
    abstract maHttp() : number;
}

export class LoiDuLieuKhongHopLe extends LoiNghiepVu {
    override maHttp(): number {
        return 422;
    }
}

export class LoiCauHoiSai extends LoiNghiepVu {
    override maHttp(): number {
        return 422;
    }
}

export class LoiHetGio extends LoiNghiepVu {
    override maHttp(): number {
        return 409;
    }
}

export class LoiDaNopBai extends LoiNghiepVu {
    override maHttp(): number {
        return 409;
    }
}

export class LoiBoDaKhoa extends LoiNghiepVu {
    override maHttp(): number {
        return 409;
    }
}

export class LoiKhongCoQuyen extends LoiNghiepVu {
    override maHttp(): number {
        return 403;
    }
}