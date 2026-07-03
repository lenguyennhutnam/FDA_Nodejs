// Types for Danh mục địa điểm
export interface DanhMucDiaDiem {
  _id: string;
  noi_dung: string;
  ghi_chu?: string;
  created_date: number;
  last_update: number;
}

export interface CreateDanhMucDiaDiemDto {
  noi_dung: string;
  ghi_chu?: string;
}

export interface UpdateDanhMucDiaDiemDto {
  noi_dung?: string;
  ghi_chu?: string;
}

// Types for Danh mục nội dung
export interface DanhMucNoiDung {
  _id: string;
  noi_dung: string;
  ghi_chu?: string;
  created_date: number;
  last_update: number;
}

export interface CreateDanhMucNoiDungDto {
  noi_dung: string;
  ghi_chu?: string;
}

export interface UpdateDanhMucNoiDungDto {
  noi_dung?: string;
  ghi_chu?: string;
}

// API Response types
export interface DanhMucDiaDiemResponse {
  items: DanhMucDiaDiem[];
  total: number;
  page: number;
  size: number;
  offset: number;
}

export interface DanhMucNoiDungResponse {
  items: DanhMucNoiDung[];
  total: number;
  page: number;
  size: number;
  offset: number;
}

// Types for Danh mục chủ trì
export interface DanhMucChuTri {
  _id: string;
  chu_tri: string;
  ghi_chu?: string;
  created_date: number;
  last_update: number;
}

export interface CreateDanhMucChuTriDto {
  chu_tri: string;
  ghi_chu?: string;
}

export interface UpdateDanhMucChuTriDto {
  chu_tri?: string;
  ghi_chu?: string;
}

export interface DanhMucChuTriResponse {
  items: DanhMucChuTri[];
  total: number;
  page: number;
  size: number;
  offset: number;
}

// Types for Danh mục thành phần
export interface DanhMucThanhPhan {
  _id: string;
  thanh_phan: string;
  ghi_chu?: string;
  created_date: number;
  last_update: number;
}

export interface CreateDanhMucThanhPhanDto {
  thanh_phan: string;
  ghi_chu?: string;
}

export interface UpdateDanhMucThanhPhanDto {
  thanh_phan?: string;
  ghi_chu?: string;
}

export interface DanhMucThanhPhanResponse {
  items: DanhMucThanhPhan[];
  total: number;
  page: number;
  size: number;
  offset: number;
}