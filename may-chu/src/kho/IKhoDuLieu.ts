// Generics: T là "loại đối tượng" – một interface dùng cho mọi kho.
// Promise vì đọc/ghi CSDL mất thời gian (bất đồng bộ), phải chờ bằng await.
export interface IKhoDuLieu<T> {
  timTheoId(id: string): Promise<T | null>; // không có thì trả null, không ném lỗi
  luu(doiTuong: T): Promise<T>;              // ghi lại thay đổi của đối tượng ĐÃ có trong CSDL
}
