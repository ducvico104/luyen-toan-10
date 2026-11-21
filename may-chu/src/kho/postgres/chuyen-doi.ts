// Tầng nghiệp vụ dùng id kiểu chuỗi; CSDL dùng serial (số nguyên).
// Hai hàm nhỏ này là "phiên dịch viên" giữa hai bên.
export const sangSo = (id: string): number | null => (/^\d+$/.test(id) ? Number(id) : null);
export const sangChuoi = (id: number | null): string | null => (id === null ? null : String(id));
