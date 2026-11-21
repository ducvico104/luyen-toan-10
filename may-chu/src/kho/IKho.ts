import { NoiDungCauHoi } from '../nghiep-vu/cau-hoi/NoiDungCauHoi';
import { PhienBanCauHoi } from '../nghiep-vu/cau-hoi/PhienBanCauHoi';
import { LuotLamBai } from '../nghiep-vu/lam-bai/LuotLamBai';
import { BoLuyenTap } from '../nghiep-vu/luyen-tap/BoLuyenTap';
import { NguoiDung } from '../nghiep-vu/tai-khoan/NguoiDung';
import { IKhoDuLieu } from './IKhoDuLieu';
 
// Mỗi kho = IKhoDuLieu<T> với T cụ thể + vài phương thức riêng
 
export interface IKhoNguoiDung extends IKhoDuLieu<NguoiDung> {
  them(nguoiDung: NguoiDung): Promise<NguoiDung>; // trả về đối tượng đã có id
  timTheoEmail(email: string): Promise<NguoiDung | null>;
}
 
export interface ThongTinCauMoi {
  ma: string;            // Q000001
  nutId: string;         // nút cấp Dạng
  nguoiTaoId: string;
  loNhapId?: string | null;
}
 
export interface IKhoCauHoi extends IKhoDuLieu<PhienBanCauHoi> {
  themCauMoi(thongTin: ThongTinCauMoi, noiDung: NoiDungCauHoi): Promise<PhienBanCauHoi>;
  timNhieuTheoId(ids: string[]): Promise<PhienBanCauHoi[]>; // giữ đúng thứ tự ids
}
 
export interface ThongTinBoMoi { nguoiTaoId: string; nutPhamViId: string; }
 
export interface IKhoBoLuyenTap extends IKhoDuLieu<BoLuyenTap> {
  them(bo: BoLuyenTap, thongTin: ThongTinBoMoi): Promise<BoLuyenTap>;
}
 
export interface ThongTinLuotMoi { hocSinhId: string; boId: string; maYeuCau: string; }
 
export interface IKhoLuotLam extends IKhoDuLieu<LuotLamBai> {
  themLuotMoi(luot: LuotLamBai, thongTin: ThongTinLuotMoi): Promise<LuotLamBai>;
}
