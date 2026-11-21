import { eq, inArray } from 'drizzle-orm';
import { CSDL } from '../../ha-tang/csdl/ket-noi';
import { cauHoi, luaChon, phienBanCauHoi } from '../../ha-tang/csdl/schema';
import { NhaMayCauHoi } from '../../nghiep-vu/cau-hoi/NhaMayCauHoi';
import { NoiDungCauHoi } from '../../nghiep-vu/cau-hoi/NoiDungCauHoi';
import { PhienBanCauHoi, TrangThaiPhienBan } from '../../nghiep-vu/cau-hoi/PhienBanCauHoi';
import { IKhoCauHoi, ThongTinCauMoi } from '../IKho';
import { sangChuoi, sangSo } from './chuyen-doi';
 
type DongPhienBan = typeof phienBanCauHoi.$inferSelect;
type DongLuaChon = typeof luaChon.$inferSelect;
 
export class KhoCauHoiPostgres implements IKhoCauHoi {
  // Nhận NhaMayCauHoi từ ngoài (tiêm phụ thuộc) để dựng lại đúng loại câu
  constructor(private readonly db: CSDL, private readonly nhaMay: NhaMayCauHoi) {}
 
  // GHI: 1 câu = 1 dòng cau_hoi + 1 dòng phien_ban_cau_hoi + 4 dòng lua_chon,
  // tất cả trong MỘT giao dịch: cùng thành công hoặc cùng thất bại.
  async themCauMoi(tt: ThongTinCauMoi, noiDung: NoiDungCauHoi): Promise<PhienBanCauHoi> {
    const phienBanId = await this.db.transaction(async (tx) => {
      const [cau] = await tx.insert(cauHoi).values({
        ma: tt.ma, nutId: Number(tt.nutId), nguoiTaoId: Number(tt.nguoiTaoId),
      }).returning({ id: cauHoi.id });
 
      const [pb] = await tx.insert(phienBanCauHoi).values({
        cauHoiId: cau.id, soPhienBan: 1,
        loaiCau: noiDung.loai, mucDo: noiDung.mucDo, deBai: noiDung.de, loiGiai: noiDung.loiGiai,
        nguon: tt.loNhapId ? 'NHAP_FILE' : 'THU_CONG',
        loNhapId: tt.loNhapId ? Number(tt.loNhapId) : null,
        nguoiTaoId: Number(tt.nguoiTaoId),
      }).returning({ id: phienBanCauHoi.id });
 
      await tx.insert(luaChon).values(noiDung.layLuaChon().map((l) => ({
        phienBanId: pb.id, kyHieu: l.kyHieu, noiDung: l.noiDung, laDapAnDung: l.laDapAnDung,
      })));
 
      await tx.update(cauHoi).set({ phienBanHienTaiId: pb.id }).where(eq(cauHoi.id, cau.id));
      return pb.id; // ra khỏi hàm không lỗi => COMMIT; ném lỗi ở bất kỳ dòng nào => ROLLBACK
    });
    return (await this.timTheoId(String(phienBanId)))!;
  }
 
  async timTheoId(id: string): Promise<PhienBanCauHoi | null> {
    const [pb] = await this.timNhieuTheoId([id]);
    return pb ?? null;
  }
 
  // ĐỌC: 2 câu truy vấn cho cả danh sách (không truy vấn từng câu một)
  async timNhieuTheoId(ids: string[]): Promise<PhienBanCauHoi[]> {
    const so = ids.map(sangSo).filter((x): x is number => x !== null);
    if (so.length === 0) return [];
    const dongPB = await this.db.select().from(phienBanCauHoi).where(inArray(phienBanCauHoi.id, so));
    const dongLC = await this.db.select().from(luaChon).where(inArray(luaChon.phienBanId, so));
 
    const theoId = new Map<number, PhienBanCauHoi>();
    for (const pb of dongPB) {
      theoId.set(pb.id, this.dungDoiTuong(pb, dongLC.filter((l) => l.phienBanId === pb.id)));
    }
    return so.map((i) => theoId.get(i)).filter((x): x is PhienBanCauHoi => x !== undefined);
  }
 
  // Nội dung phiên bản bất biến: chỉ ghi lại trạng thái duyệt
  async luu(pb: PhienBanCauHoi): Promise<PhienBanCauHoi> {
    await this.db.update(phienBanCauHoi).set({
      trangThai: pb.trangThai,
      nguoiDuyetId: pb.nguoiDuyetId === null ? null : Number(pb.nguoiDuyetId),
      duyetLuc: pb.duyetLuc,
    }).where(eq(phienBanCauHoi.id, Number(pb.id)));
    return pb;
  }
 
  // Dòng → đối tượng: đổi về dạng CauHoiJson rồi nhờ NhaMayCauHoi tạo đúng lớp con.
  // Nhà máy kiểm tra lại cấu trúc, nên dữ liệu hỏng trong CSDL cũng bị phát hiện.
  private dungDoiTuong(pb: DongPhienBan, cacLC: DongLuaChon[]): PhienBanCauHoi {
    const sapXep = [...cacLC].sort((x, y) => (x.kyHieu < y.kyHieu ? -1 : 1));
    const noiDung = this.nhaMay.tao({
      loai: pb.loaiCau, mucDo: pb.mucDo, de: pb.deBai, loiGiai: pb.loiGiai,
      luaChon: sapXep.map((l) => ({ kyHieu: l.kyHieu, noiDung: l.noiDung, dung: l.laDapAnDung })),
    });
    return new PhienBanCauHoi(
      String(pb.id), String(pb.cauHoiId), pb.soPhienBan, noiDung, String(pb.nguoiTaoId),
      pb.trangThai as TrangThaiPhienBan, sangChuoi(pb.nguoiDuyetId), pb.duyetLuc,
    );
  }
}
