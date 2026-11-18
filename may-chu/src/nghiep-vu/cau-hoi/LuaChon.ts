// Đối tượng bất biến: Mọi thuộc tính readonly tạo xong không sửa được
export class LuaChon {
    constructor(
        readonly kyHieu : string, // A-D hoặc a-d
        readonly noiDung : string, // Có thể chứa latex
        readonly laDapAnDung : boolean,
    ) {}
}