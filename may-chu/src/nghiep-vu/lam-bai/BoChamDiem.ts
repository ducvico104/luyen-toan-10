import { CauDaLam } from './CauDaLam';

export class KetQua {
  constructor(
    readonly tongDiem: number,
    readonly soCau: number,
    readonly soCauDungHoanToan: number,
    readonly diemThang10: number,
  ) {}
}

const lamTron2 = (x: number): number => Math.round(x * 100) / 100;

export class BoChamDiem {
  cham(cacCau: readonly CauDaLam[]): KetQua {
    let tong = 0;
    let dungHoanToan = 0;
    for (const cau of cacCau) {
      const diem = cau.chamDiem();
      tong += diem;
      if (diem === 1) dungHoanToan++;
    }
    const diemThang10 = lamTron2((tong / cacCau.length) * 10);
    return new KetQua(lamTron2(tong), cacCau.length, dungHoanToan, diemThang10);
  }
}
