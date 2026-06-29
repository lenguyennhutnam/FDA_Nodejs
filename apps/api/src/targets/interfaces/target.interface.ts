/** Mục tiêu bảo vệ — lưu tạm bằng file JSON, sau sẽ chuyển sang MongoDB. */
export interface Target {
  id: string;
  name: string;
  position: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}
