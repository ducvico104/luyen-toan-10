import { LoiCauHoiSai } from '../loi/LoiNghiepVu';
import { LuaChon } from './LuaChon';
import { MucDo, NoiDungCauHoi } from './NoiDungCauHoi';
import { TraLoi } from './TraLoi';

export class CauTracNghiem extends NoiDungCauHoi {
  readonly loai = 'TRAC_NGHIEM' as const;

  constructor(de: string, mucDo: MucDo, loiGiai: string, luaChon: LuaChon[]) {
    super(de, mucDo, loiGiai, luaChon);
    this.kiemTra(); // sai cấu trúc thì không tạo được đối tượng
  }

  override kiemTra(): void {
    super.kiemTra();
    const kyHieu = this.luaChon.map((l) => l.kyHieu).join('');
    if (kyHieu !== 'ABCD') {
      throw new LoiCauHoiSai('Câu trắc nghiệm phải có đúng 4 lựa chọn A, B, C, D theo thứ tự');
    }
    const soDapAn = this.luaChon.filter((l) => l.laDapAnDung).length;
    if (soDapAn !== 1) {
      throw new LoiCauHoiSai(`Câu trắc nghiệm phải có đúng 1 đáp án, đang có ${soDapAn}`);
    }
  }

  cham(traLoi: TraLoi | null): number {
    if (traLoi === null || traLoi.loai !== 'TRAC_NGHIEM') return 0;
    const dapAn = this.luaChon.find((l) => l.laDapAnDung);
    return traLoi.chon === dapAn?.kyHieu ? 1 : 0;
  }
}
