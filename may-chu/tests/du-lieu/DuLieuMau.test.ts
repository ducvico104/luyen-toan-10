import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { LoNhapCauHoi } from '../../src/nghiep-vu/cau-hoi/LoNhapCauHoi';
import { CauHoiJson, NhaMayCauHoi } from '../../src/nghiep-vu/cau-hoi/NhaMayCauHoi';
 
const THU_MUC = path.join(__dirname, '../../src/ha-tang/csdl/du-lieu');
const cacFile = readdirSync(THU_MUC).filter((f) => f.endsWith('.json'));
 
// describe.each: chạy cùng một nhóm kiểm thử cho từng file
describe.each(cacFile)('File dữ liệu %s', (tenFile) => {
  const danhSach = JSON.parse(readFileSync(path.join(THU_MUC, tenFile), 'utf8')) as CauHoiJson[];
 
  test('mọi câu đều đúng cấu trúc', () => {
    const lo = LoNhapCauHoi.tuDanhSach(new NhaMayCauHoi(), danhSach);
    expect(lo.danhSachLoi).toEqual([]); // sai thì Jest in rõ câu thứ mấy, lỗi gì
  });
 
  test('không có câu bị nhập trùng', () => {
    // Nhiều câu đúng/sai có cùng lời dẫn, nên so cả đề lẫn các lựa chọn
    const khoa = danhSach.map((c) => c.de + '|' + c.luaChon.map((l) => l.noiDung).join('|'));
    expect(new Set(khoa).size).toBe(khoa.length);
  });
});
