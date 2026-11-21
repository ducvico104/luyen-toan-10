import { LoiCauHoiSai } from '../loi/LoiNghiepVu';
import { ChamKieuThiTotNghiep, ICachChamDungSai } from './CachChamDungSai';
import { LuaChon } from './LuaChon';
import { MucDo, NoiDungCauHoi } from './NoiDungCauHoi';
import { KyHieuDungSai, TraLoi } from './TraLoi';

export class CauDungSai extends NoiDungCauHoi {
  readonly loai = 'DUNG_SAI' as const;

  constructor(
    de: string,
    mucDo: MucDo,
    loiGiai: string,
    luaChon: LuaChon[],
    // Kết hợp (composition): câu đúng/sai CHỨA một cách chấm, thay được khi cần
    private readonly cachCham: ICachChamDungSai = new ChamKieuThiTotNghiep(),
  ) {
    super(de, mucDo, loiGiai, luaChon);
    this.kiemTra();
  }

  override kiemTra(): void {
    super.kiemTra();
    const kyHieu = this.luaChon.map((l) => l.kyHieu).join('');
    if (kyHieu !== 'abcd') {
      throw new LoiCauHoiSai('Câu đúng/sai phải có đúng 4 ý a, b, c, d theo thứ tự');
    }
  }

  cham(traLoi: TraLoi | null): number {
    if (traLoi === null || traLoi.loai !== 'DUNG_SAI') return 0;
    const soYDung = this.luaChon.filter(
      (l) => traLoi.cacY[l.kyHieu as KyHieuDungSai] === l.laDapAnDung,
    ).length;
    return this.cachCham.tinhDiem(soYDung); // giao việc tính điểm cho chiến lược
  }
}
