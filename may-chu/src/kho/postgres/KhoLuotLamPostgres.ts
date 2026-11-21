import { and, asc, eq, sql } from 'drizzle-orm';
import { CSDL } from '../../ha-tang/csdl/ket-noi';
import { cauDaLam, luotLamBai } from '../../ha-tang/csdl/schema';
import { BoChamDiem, KetQua } from '../../nghiep-vu/lam-bai/BoChamDiem';
import { CauDaLam } from '../../nghiep-vu/lam-bai/CauDaLam';
import { IDongHo } from '../../nghiep-vu/lam-bai/DongHo';
import { LuotLamBai } from '../../nghiep-vu/lam-bai/LuotLamBai';
import { TenTrangThai } from '../../nghiep-vu/lam-bai/TrangThaiLuotLam';
import { IKhoCauHoi, IKhoLuotLam, ThongTinLuotMoi } from '../IKho';
import { sangSo } from './chuyen-doi';
 
// numeric trong PostgreSQL được Drizzle trả về dạng CHUỖI (để không mất chính xác)
const sangSoThuc = (x: string | null): number | null => (x === null ? null : Number(x));
 
export class KhoLuotLamPostgres implements IKhoLuotLam {
  constructor(
    private readonly db: CSDL,
    private readonly khoCauHoi: IKhoCauHoi, // phụ thuộc INTERFACE, không phụ thuộc lớp Postgres
    private readonly dongHo: IDongHo,
    private readonly boCham: BoChamDiem,
  ) {}
 
  async themLuotMoi(luot: LuotLamBai, tt: ThongTinLuotMoi): Promise<LuotLamBai> {
    const hocSinhId = Number(tt.hocSinhId);
    const boId = Number(tt.boId);
    const luotId = await this.db.transaction(async (tx) => {
      const [{ soLuot }] = await tx.select({ soLuot: sql<number>`count(*)::int` })
        .from(luotLamBai)
        .where(and(eq(luotLamBai.hocSinhId, hocSinhId), eq(luotLamBai.boId, boId)));
 
      const [dong] = await tx.insert(luotLamBai).values({
        hocSinhId, boId, lanThu: soLuot + 1, trangThai: luot.tenTrangThai,
        batDauLuc: luot.batDauLuc, hanNop: luot.hanNop, maYeuCau: tt.maYeuCau,
      }).returning({ id: luotLamBai.id });
 
      await tx.insert(cauDaLam).values(luot.cacCauDaLam.map((c) => ({
        luotLamId: dong.id, thuTu: c.thuTu, phienBanId: Number(c.phienBanId),
        traLoi: c.traLoi, diem: c.diem === null ? null : String(c.diem),
      })));
      return dong.id;
    });
    return (await this.timTheoId(String(luotId)))!;
  }
 
  async timTheoId(id: string): Promise<LuotLamBai | null> {
    const so = sangSo(id);
    if (so === null) return null;
    const [l] = await this.db.select().from(luotLamBai).where(eq(luotLamBai.id, so));
    if (!l) return null;
 
    const dongCau = await this.db.select().from(cauDaLam)
      .where(eq(cauDaLam.luotLamId, so)).orderBy(asc(cauDaLam.thuTu));
    // Nhờ kho câu hỏi dựng lại nội dung câu (đã có đáp án, cách chấm)
    const cacPhienBan = await this.khoCauHoi.timNhieuTheoId(dongCau.map((c) => String(c.phienBanId)));
    const theoId = new Map(cacPhienBan.map((pb) => [pb.id, pb]));
 
    const cacCau = dongCau.map((c) => {
      const pb = theoId.get(String(c.phienBanId));
      if (!pb) throw new Error(`Thiếu phiên bản câu hỏi ${c.phienBanId}`);
      return new CauDaLam(c.thuTu, String(c.phienBanId), pb.noiDung, c.traLoi ?? null, sangSoThuc(c.diem));
    });
 
    const ketQua = l.tongDiem === null ? null
      : new KetQua(Number(l.tongDiem), cacCau.length, l.soCauDungHet ?? 0, Number(l.diemThang10));
 
    return LuotLamBai.khoiPhuc({
      id: String(l.id), cacCau, batDauLuc: l.batDauLuc, hanNop: l.hanNop,
      tenTrangThai: l.trangThai as TenTrangThai, ketQua, nopLuc: l.nopLuc,
    }, this.dongHo, this.boCham);
  }
 
  // Ghi lại trạng thái, kết quả và câu trả lời từng câu (1 giao dịch)
  async luu(luot: LuotLamBai): Promise<LuotLamBai> {
    const id = Number(luot.id);
    const kq = luot.ketQua;
    await this.db.transaction(async (tx) => {
      await tx.update(luotLamBai).set({
        trangThai: luot.tenTrangThai, nopLuc: luot.nopLuc,
        tongDiem: kq ? String(kq.tongDiem) : null,
        diemThang10: kq ? String(kq.diemThang10) : null,
        soCauDungHet: kq ? kq.soCauDungHoanToan : null,
      }).where(eq(luotLamBai.id, id));
 
      for (const c of luot.cacCauDaLam) {
        await tx.update(cauDaLam)
          .set({ traLoi: c.traLoi, diem: c.diem === null ? null : String(c.diem) })
          .where(and(eq(cauDaLam.luotLamId, id), eq(cauDaLam.thuTu, c.thuTu)));
      }
    });
    return luot;
  }
}
