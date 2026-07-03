export * from "./api-method.enum";
export * from "./field-type.enum";
export * from "./format-time.enum";
export * from "./hanh-chinh";
export * from "./loai-lenh";
export * from "./loai-nhien-lieu.enum";
export * from "./loai-phieu-xang-dau";
export * from "./menu-items.type";
export * from "./nhiem-vu.enum";
export * from "./param-search.type";
export * from "./permissions.type";
export * from "./rank.enum";
export * from "./task.type";
export * from "./theo-doi-thong-bao-nhiem-vu";

export enum SystemFeatures {
  // Quan Tri He Thong
  QuanTriHeThong = "QuanTriHeThong",

  // Quản lý tài khoản tác chiến (Facebook)
  QuanLyTaiKhoanTacChien = "QuanLyTaiKhoanTacChien",
}

export enum SystemAction {
  View = "View",
  Edit = "Edit",
  Approve = "Approve",
  Report = "Report",
  UnitApprove = "UnitApprove",
}

export enum TrangThaiTaiKhoanFacebook {
  HoatDong = "Đang hoạt động",
  BiKhoaTamThoi = "Bị khóa tạm thời",
  BiVoHieuHoa = "Đã die/vô hiệu hóa",
  ChuaXacMinh = "Chưa xác minh",
  NgungSuDung = "Ngừng sử dụng",
}
