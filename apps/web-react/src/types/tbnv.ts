// TBNV Types and Interfaces

export enum TroopStatus {
  CoMat = 'CoMat',
  NghiPhep = 'NghiPhep',
  NghiOm = 'NghiOm',
  DiVien = 'DiVien',
  TranhThu = 'TranhThu',
  NghiCuoiTuan = 'NghiCuoiTuan',
  CongTac = 'CongTac',
  ChinhSach = 'ChinhSach',
  DiHoc = 'DiHoc',
  Khac = 'Khac',
  TangCuong = 'TangCuong',
  // DuNhiem = 'DuNhiem',
}

export const TroopStatusLabels: Record<TroopStatus, string> = {
  [TroopStatus.CoMat]: 'Có mặt',
  [TroopStatus.NghiPhep]: 'Nghỉ phép',
  [TroopStatus.NghiOm]: 'Nghỉ ốm',
  [TroopStatus.DiVien]: 'Đi viện',
  [TroopStatus.TranhThu]: 'Tranh thủ',
  [TroopStatus.NghiCuoiTuan]: 'Nghỉ cuối tuần',
  [TroopStatus.CongTac]: 'Công tác',
  [TroopStatus.ChinhSach]: 'Chính sách',
  [TroopStatus.DiHoc]: 'Đi học',
  [TroopStatus.Khac]: 'Khác',
  [TroopStatus.TangCuong]: 'Tăng cường',
  // [TroopStatus.DuNhiem]: 'Dự nhiệm',
};

// Báo quân số interfaces
export interface TroopStatusDetail {
  [key: string]: number;
}

export interface TypeCounts {
  SQ: { total: number; coMat: number; vang: number };
  QNCN: { total: number; coMat: number; vang: number };
  CCQP: { total: number; coMat: number; vang: number };
  HSQCS: { total: number; coMat: number; vang: number };
}

export interface TroopStatistics {
  statusCounts: Record<TroopStatus, number>;
  typeCounts: TypeCounts;
  totalCount: number;
}

export interface UnitTreeNode {
  _id: string;
  name: string;
  parent?: string;
  description?: string;
  key?: string;
  la_chi_huy_don_vi?: boolean;
  da_bao_cao: boolean;
  xac_nhan_luc: number | null;
  thong_ke: TroopStatistics;
  childs: UnitTreeNode[];
}

export interface TroopPersonnel {
  _id: string;
  full_name: string;
  rank?: string;
  username?: string;
  unit: string;
  trang_thai: TroopStatus;
  ghi_chu?: string;
  cap_nhat_luc?: number;
}

export interface TroopPersonnelListResponse {
  items: TroopPersonnel[];
  total: number;
  page: number;
  size: number;
}

export interface TroopStatusUpdateItem {
  nguoiDungId: string;
  trangThai: TroopStatus;
  ghiChu?: string;
}

export interface BulkUpdateTroopStatusRequest {
  ngay: number;
  mucTin: TroopStatusUpdateItem[];
}

export interface BulkUpdateTroopStatusResponse {
  inserted: number;
  updated: number;
  deleted: number;
}

export interface ConfirmTroopCountRequest {
  ngay: number;
  donViId: string;
  ghiChu?: string;
}

export interface SoLieuTongHop {
  tong_quan_so: number;
  tong_vang: number;
  [key: string]: number; // For TroopStatus counts
}

export interface ConfirmTroopCountResponse {
  _id: string;
  ngay: number;
  don_vi_id: string;
  xac_nhan_boi_id: string;
  xac_nhan_luc: number;
  so_lieu_tong_hop: SoLieuTongHop;
  ghi_chu?: string;
}

export interface UserInfo {
  _id: string;
  full_name: string;
  rank: string;
}

export interface UnitConfirmationStatus {
  don_vi_id: string;
  don_vi_name: string;
  da_xac_nhan: boolean;
  xac_nhan_luc?: number;
  xac_nhan_boi?: UserInfo;
  so_lieu_tong_hop?: SoLieuTongHop;
}

// NVVS (Nội vụ vệ sinh) interfaces
export interface CreateNVVSRequest {
  ngay: string; // YYYY-MM-DD format
  donViId: string;
  ketQua: string; // Required field
  ghiChu?: string;
  hinhAnh?: string[];
}

export interface UpdateNVVSRequest {
  ketQua?: string;
  ghiChu?: string;
  hinhAnh?: string[];
}

export interface UnitInfo {
  _id: string;
  name: string;
}

export interface NVVSReport {
  _id: string;
  ngay: string; // YYYY-MM-DD format
  don_vi_id: UnitInfo | string;
  ket_qua?: string;
  ghi_chu?: string;
  hinh_anh?: string[];
  tao_boi_id: UserInfo | string;
  tao_luc: number;
  cap_nhat_luc?: number;
}

export interface NVVSListResponse {
  items: NVVSReport[];
  total: number;
  page: number;
  size: number;
}

export interface NVVSStatistics {
  tong_so_bao_cao: number;
  diem_trung_binh: number;
}

// Query parameters
export interface GetUnitTreeParams {
  ngay?: number;
  rootUnitId?: string;
}

export interface GetTroopListParams {
  donViId: string;
  ngay: number;
  q?: string;
  trangThai?: TroopStatus;
  gomDonViCon?: boolean;
  page?: number;
  size?: number;
}

export interface GetConfirmationStatusParams {
  ngay: number;
  donViChaId: string;
}

export interface GetNVVSListParams {
  ngay?: number;
  donViId?: string;
  gomDonViCon?: boolean;
  page?: number;
  size?: number;
}

export interface GetNVVSStatsParams {
  ngay?: number;
  donViId?: string;
  gomDonViCon?: boolean;
}

