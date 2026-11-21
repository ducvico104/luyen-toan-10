import { asc, eq } from 'drizzle-orm';
import { CSDL } from '../../ha-tang/csdl/ket-noi';
import { boLuyenTap, cauTrongBo } from '../../ha-tang/csdl/schema';
import { BoLuyenTap } from '../../nghiep-vu/luyen-tap/BoLuyenTap';
import { IKhoBoLuyenTap, ThongTinBoMoi } from '../IKho';
import { sangChuoi, sangSo } from './chuyen-doi';
 
export class KhoBoLuyenTapPostgres implements IKhoBoLuyenTap {
  constructor(private readonly db: CSDL) {}
 
  // 1 bộ = 1 dòng bo_luyen_tap + n dòng cau_trong_bo (giao dịch)
  async them(bo: BoLuyenTap, tt: ThongTinBoMoi): Promise<BoLuyenTap> {
    const boId = await this.db.transaction(async (tx) => {
      const [dong] = await tx.insert(boLuyenTap).values({
        tieuDe: bo.ten, nutPhamViId: Number(tt.nutPhamViId), thoiGianPhut: bo.thoiGianPhut,
        daKhoa: bo.daKhoa, nhanBanTuId: bo.boGocId === null ? null : Number(bo.boGocId),
        nguoiTaoId: Number(tt.nguoiTaoId),
      }).returning({ id: boLuyenTap.id });
      await tx.insert(cauTrongBo).values(bo.cacCau.map((c) => ({
        boId: dong.id, phienBanId: Number(c.phienBanId), thuTu: c.thuTu,
      })));
      return dong.id;
    });
    return (await this.timTheoId(String(boId)))!;
  }
 
  async timTheoId(id: string): Promise<BoLuyenTap | null> {
    const so = sangSo(id);
    if (so === null) return null;
    const [bo] = await this.db.select().from(boLuyenTap).where(eq(boLuyenTap.id, so));
    if (!bo) return null;
    const cac = await this.db.select().from(cauTrongBo)
      .where(eq(cauTrongBo.boId, so)).orderBy(asc(cauTrongBo.thuTu));
    return new BoLuyenTap(
      String(bo.id), bo.tieuDe, bo.thoiGianPhut,
      cac.map((c) => String(c.phienBanId)), bo.daKhoa, sangChuoi(bo.nhanBanTuId),
    );
  }
 
  // Ghi lại trạng thái khóa và danh sách câu (xóa cũ – thêm mới trong 1 giao dịch)
  async luu(bo: BoLuyenTap): Promise<BoLuyenTap> {
    const id = Number(bo.id);
    await this.db.transaction(async (tx) => {
      await tx.update(boLuyenTap).set({ daKhoa: bo.daKhoa }).where(eq(boLuyenTap.id, id));
      await tx.delete(cauTrongBo).where(eq(cauTrongBo.boId, id));
      await tx.insert(cauTrongBo).values(bo.cacCau.map((c) => ({
        boId: id, phienBanId: Number(c.phienBanId), thuTu: c.thuTu,
      })));
    });
    return bo;
  }
}
