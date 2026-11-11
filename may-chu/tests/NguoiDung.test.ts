import { HocSinh, QuanTriVien } from '../src/nghiep-vu/tai-khoan/NguoiDung';
import { LoiDuLieuKhongHopLe, LoiKhongCoQuyen } from '../src/nghiep-vu/loi/LoiNghiepVu';

const taoHS = () => new HocSinh('hs1', 'an@x.vn', 'da-bam', 'Nguyễn An');
const taoQTV = () => new QuanTriVien('qt1', 'qt@x.vn', 'da-bam', 'Quản trị');

test('tài khoản mới mặc định hoạt động, đăng nhập được', () => {
  expect(taoHS().coTheDangNhap()).toBe(true);
});

test('đa hình: mỗi lớp tự trả lời có quyền quản lý không', () => {
  expect(taoHS().coQuyenQuanLy()).toBe(false);
  expect(taoQTV().coQuyenQuanLy()).toBe(true);
});

test('đổi họ tên: cắt khoảng trắng, từ chối tên quá ngắn', () => {
  const hs = taoHS();
  hs.doiThongTin('  Trần Bình  ');
  expect(hs.hoTen).toBe('Trần Bình');
  expect(() => hs.doiThongTin(' A ')).toThrow(LoiDuLieuKhongHopLe);
});

test('quản trị viên khóa rồi mở khóa học sinh', () => {
  const hs = taoHS(), qtv = taoQTV();
  qtv.khoaTaiKhoan(hs);
  expect(hs.coTheDangNhap()).toBe(false);
  qtv.moKhoaTaiKhoan(hs);
  expect(hs.trangThai).toBe('HOAT_DONG');
});

test('quản trị viên không được tự khóa mình', () => {
  const qtv = taoQTV();
  expect(() => qtv.khoaTaiKhoan(qtv)).toThrow(LoiKhongCoQuyen);
});
