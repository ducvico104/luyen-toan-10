import { LoiNghiepVu, LoiHetGio, LoiKhongCoQuyen } from "../src/nghiep-vu/loi/LoiNghiepVu";

test("mỗi lớp lỗi tự biết mã HTTP của mình", () => {
  const ds: LoiNghiepVu[] = [new LoiHetGio("Hết giờ"), new LoiKhongCoQuyen("Cấm")];
  const cacMa = ds.map(loi => loi.maHttp());   // cùng một lời gọi, kết quả khác nhau
  expect(cacMa).toEqual([409, 403]);
});

test("lỗi giữ đúng tên lớp con và thông báo", () => {
  const loi = new LoiHetGio("Đã hết thời gian làm bài");
  expect(loi.name).toBe("LoiHetGio");
  expect(loi.message).toBe("Đã hết thời gian làm bài");
  expect(loi instanceof LoiNghiepVu).toBe(true);
  expect(loi instanceof Error).toBe(true);
});