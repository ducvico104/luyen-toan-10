import { eq } from 'drizzle-orm';
import { CSDL } from '../../ha-tang/csdl/ket-noi';
import { nguoiDung } from '../../ha-tang/csdl/schema';
import { HocSinh, NguoiDung, QuanTriVien, TrangThaiTaiKhoan } from '../../nghiep-vu/tai-khoan/NguoiDung';
import { IKhoNguoiDung } from '../IKho';
import { sangSo } from './chuyen-doi';
 
type DongNguoiDung = typeof nguoiDung.$inferSelect; // kiểu một dòng, Drizzle tự suy ra
 
export class KhoNguoiDungPostgres implements IKhoNguoiDung {
  constructor(private readonly db: CSDL) {}
 
  async them(nd: NguoiDung): Promise<NguoiDung> {
    const [dong] = await this.db.insert(nguoiDung).values({
      email: nd.email, matKhauBam: nd.matKhauBam, hoTen: nd.hoTen,
      vaiTro: nd.vaiTro, trangThai: nd.trangThai,
    }).returning();                       // RETURNING *: lấy lại dòng vừa thêm, có id
    return this.dungDoiTuong(dong);
  }
 
  async timTheoId(id: string): Promise<NguoiDung | null> {
    const so = sangSo(id);
    if (so === null) return null;
    const [dong] = await this.db.select().from(nguoiDung).where(eq(nguoiDung.id, so));
    return dong ? this.dungDoiTuong(dong) : null;
  }
 
  async timTheoEmail(email: string): Promise<NguoiDung | null> {
    const [dong] = await this.db.select().from(nguoiDung).where(eq(nguoiDung.email, email));
    return dong ? this.dungDoiTuong(dong) : null;
  }
 
  async luu(nd: NguoiDung): Promise<NguoiDung> {
    await this.db.update(nguoiDung)
      .set({ hoTen: nd.hoTen, matKhauBam: nd.matKhauBam, trangThai: nd.trangThai })
      .where(eq(nguoiDung.id, Number(nd.id)));
    return nd;
  }
 
  // Dòng → đối tượng: cột vai_tro quyết định new lớp con nào
  private dungDoiTuong(d: DongNguoiDung): NguoiDung {
    const tt = d.trangThai as TrangThaiTaiKhoan;
    switch (d.vaiTro) {
      case 'HOC_SINH': return new HocSinh(String(d.id), d.email, d.matKhauBam, d.hoTen, tt);
      case 'QUAN_TRI': return new QuanTriVien(String(d.id), d.email, d.matKhauBam, d.hoTen, tt);
      default: throw new Error(`Vai trò lạ trong CSDL: ${d.vaiTro}`); // lỗi dữ liệu, không phải lỗi nghiệp vụ
    }
  }
}
