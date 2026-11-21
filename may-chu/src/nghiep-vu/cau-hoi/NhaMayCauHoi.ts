import { LoiCauHoiSai } from '../loi/LoiNghiepVu';
import { ChamKieuThiTotNghiep, ICachChamDungSai } from './CachChamDungSai';
import { CauDungSai } from './CauDungSai';
import { CauTracNghiem } from './CauTracNghiem';
import { LuaChon } from './LuaChon';
import { MucDo, NoiDungCauHoi } from './NoiDungCauHoi';

// Hình dạng một câu trong file JSON nhập vào (dữ liệu thô, chưa tin được)
export interface CauHoiJson {
  loai: string;
  mucDo: string;
  de: string;
  loiGiai?: string;
  luaChon: { kyHieu: string; noiDung: string; dung: boolean }[];
}

const CAC_MUC_DO: readonly string[] = ['BIET', 'HIEU', 'VAN_DUNG'];

// Mẫu Nhà máy (Factory): nơi DUY NHẤT biết "loại nào thì new lớp nào"
export class NhaMayCauHoi {
  constructor(private readonly cachChamDungSai: ICachChamDungSai = new ChamKieuThiTotNghiep()) {}

  tao(duLieu: CauHoiJson): NoiDungCauHoi {
    if (!CAC_MUC_DO.includes(duLieu.mucDo)) {
      throw new LoiCauHoiSai(`Mức độ không hợp lệ: ${duLieu.mucDo}`);
    }
    const mucDo = duLieu.mucDo as MucDo;
    const luaChon = (duLieu.luaChon ?? []).map((l) => new LuaChon(l.kyHieu, l.noiDung, l.dung));

    switch (duLieu.loai) {
      case 'TRAC_NGHIEM':
        return new CauTracNghiem(duLieu.de ?? '', mucDo, duLieu.loiGiai ?? '', luaChon);
      case 'DUNG_SAI':
        return new CauDungSai(duLieu.de ?? '', mucDo, duLieu.loiGiai ?? '', luaChon, this.cachChamDungSai);
      default:
        throw new LoiCauHoiSai(`Loại câu không hỗ trợ: ${duLieu.loai}`);
    }
  }
}
