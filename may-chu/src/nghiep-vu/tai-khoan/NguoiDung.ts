import {LoiDuLieuKhongHopLe, LoiKhongCoQuyen} from '../loi/LoiNghiepVu';
export type VaiTro = 'HOC_SINH' | 'QUAN_TRI';
export type TrangThaiTaiKhoan = 'HOAT_DONG' | 'BI_KHOA';

//Lớp trừu tượng: Không tạo được "một người dùng chung", chỉ tạo HocSinh hoặc QuanTriVien.
export abstract class NguoiDung {
    private _trangThai : TrangThaiTaiKhoan;

    constructor(
        readonly id : string,
        readonly emai : string,
        private _matKhauBam : string, //Chỉ lưu mật khẩu ĐÃ BĂM, việc băm do tầng dịch vụ làm
        private _hoTen :string,
        trangThai : TrangThaiTaiKhoan = 'HOAT_DONG',
    ){
        this._trangThai = trangThai;
    }

    abstract readonly vaiTro : VaiTro;
    abstract coQuyenQuanLy() : boolean; //Đa hình: mỗi lớp con sẽ trả lời khác nhau

    get hoTen() : string {
        return this._hoTen;
    }

    get matKhauBam() : string {
        return this._matKhauBam;
    }

    get trangThai() : TrangThaiTaiKhoan {
        return this._trangThai;
    }

    coTheDangNhap() : boolean {
        return this._trangThai === 'HOAT_DONG';
    }

    doiThongTin(hoTenMoi : string) : void {
        const ten = hoTenMoi.trim();
        if(ten.length < 2) throw new LoiDuLieuKhongHopLe('Họ tên phải có ít nhất 2 ký tự');
        this._hoTen = ten;
    }

    doiMatKhau(matKhauBamMoi : string) : void {
        this._matKhauBam = matKhauBamMoi;
    }

    //protected: chỉ lớp con được gọi, bên ngoài không tự khóa/mở khóa được
    protected datTrangThai(trangThai : TrangThaiTaiKhoan) : void {
        this._trangThai = trangThai;
    }
    //Cho phép QuanTriVien goi datTrangThai trên MỘT người dùng khác
    protected static datTrangThaiCho(nguoiDung : NguoiDung, trangThai : TrangThaiTaiKhoan) : void {
        nguoiDung.datTrangThai(trangThai);
    }
}

export class HocSinh extends NguoiDung {
    override readonly vaiTro = 'HOC_SINH' as const;
    override coQuyenQuanLy(): boolean {
        return false;
    }
}

export class QuanTriVien extends NguoiDung {
    override readonly vaiTro = 'QUAN_TRI' as const;
    override coQuyenQuanLy(): boolean {
        return true;
    }

    khoaTaiKhoan(nguoiDung : NguoiDung) : void {
        if(nguoiDung.id === this.id) throw new LoiKhongCoQuyen('Không được tự khóa tài khoản của mình');
        NguoiDung.datTrangThaiCho(nguoiDung, 'BI_KHOA');
    }

    moKhoaTaiKhoan(nguoiDung : NguoiDung) : void {
        NguoiDung.datTrangThaiCho(nguoiDung, 'HOAT_DONG');
    }  
}