export type KyHieuTracNghiem = 'A' | 'B' | 'C' | 'D';
export type KyHieuDungSai = 'a' | 'b' | 'c' | 'd';

export interface TraLoiTracNghiem {
    loai : 'TRAC_NGHIEM';
    chon : KyHieuTracNghiem;
}

export interface TraLoiDungSai {
    loai : 'DUNG_SAI';
    cacY : Partial<Record<KyHieuDungSai, boolean>>; //true = đúng, false = sai, thiếu = chưa chọn
}

//Hoặc cái này hoặc cái kia: Trường loại giúp TypeScrip phân biệt 2 kiểu
export type TraLoi = TraLoiTracNghiem | TraLoiDungSai;