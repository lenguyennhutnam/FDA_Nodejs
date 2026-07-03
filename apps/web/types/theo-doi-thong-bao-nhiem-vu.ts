/**
 * Theo dõi thông báo nhiệm vụ
 * Người dùng có thể bật/tắt thông báo cho từng nhiệm vụ
 */

export interface TheoDoiThongBaoNhiemVu {
  _id: string;
  nguoi_dung_id: string;
  nhiem_vu_id: string;
  bat_thong_bao: boolean;
  created_date: Date;
  last_update: Date;
  trang_thai: boolean;
}

export interface CapNhatTheoDoiThongBaoDto {
  nhiem_vu_id: string;
  bat_thong_bao: boolean;
}

export interface TrangThaiTheoDoiThongBaoResponse {
  bat_thong_bao: boolean;
}

