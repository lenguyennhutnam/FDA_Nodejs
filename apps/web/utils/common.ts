import dayjs, { Dayjs } from "dayjs";
import { toNumber } from "./parse";

export const formatNumberVND = (number: number): string => {
  if (typeof number !== "number" || isNaN(number)) {
    throw new Error("Giá trị nhập vào phải là một số hợp lệ.");
  }
  return number.toLocaleString("en-US", {}); // Dùng chuẩn Việt Nam với dấu `.`
};
export const formatToCurrencyTypeToFixed = (
  currency,
  fixed = 0,
  type: any = "en-US"
) => {
  return currency || currency == 0
    ? toNumber(currency).toLocaleString(type, {
        minimumFractionDigits: 0,
        maximumFractionDigits: fixed,
      })
    : "";
};
export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);

  // Lấy giờ, phút, ngày, tháng, năm
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Tháng tính từ 0
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}/${month}/${year}`;
};

export const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

export const formatDateToStringFormat = (
  data: string | Date | null | undefined,
  format: string = "DD/MM/YYYY"
): string => {
  if (!data) return "";

  const d = dayjs(data);

  if (!d.isValid()) return "";

  return d.format(format);
};

export const formatDateToString = (
  date: Dayjs | string | null | undefined,
  format: string = "YYYY-MM-DD"
): string => {
  if (!date) return "";
  const d = typeof date === "string" ? dayjs(date) : date;

  // Nếu định dạng là giờ phút
  if (format === "HH:mm") {
    return d.format("HH:mm");
  }

  // Mặc định là ngày đầy đủ
  return d.format(format);
};

export const buildFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof Blob) {
      formData.append(key, value, (value as File).name);
    } else if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      formData.append(key, value.toString());
    } else if (value !== undefined && value !== null) {
      formData.append(key, JSON.stringify(value));
    }
  });

  return formData;
};

export const getWeekRange = (date = new Date()) => {
  // Tạo bản sao để không làm thay đổi date gốc
  const current = new Date(date);

  // Xác định ngày trong tuần (0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy)
  const day = current.getDay();

  // Nếu là Chủ Nhật, thì tính lùi về Thứ Hai của tuần trước
  const diffToMonday = day === 0 ? -6 : 1 - day;

  // Tính ngày đầu tuần (Thứ Hai)
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  // Tính ngày cuối tuần (Chủ Nhật)
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return { monday, sunday };
};

export const getMaPhieuNhapXuat = (
  is_nhap: boolean,
  is_xuat: boolean,
  stt_nam: number,
  year: number = new Date().getFullYear()
) => {
  if (!is_nhap && !is_xuat) return "";
  const stt = Number(stt_nam) < 10 ? "0" + stt_nam : stt_nam;
  return `P${is_nhap ? "N" : "X"}/${stt}-${year}`;
};
