import { DatePicker, DatePickerProps } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import React from "react";
import { formatTime } from "../../types";
import { formatDateToString } from "../../utils/parse";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/vi.js";

type TDatePickerProps = {
  value: Dayjs | string | null; // Giá trị có thể là Dayjs, chuỗi ISO hoặc null
  onChange: (isoString: string) => void; // Hàm callback trả về chuỗi ISO
  label?: string;
  error?: boolean; // ✅ Thêm error
  helperText?: string; // ✅ Thêm helperText
  format?: formatTime;
} & Omit<DatePickerProps<Dayjs>, "value" | "onChange">; // ✅ Nhận mọi props từ DatePicker, trừ value & onChange

const TDatePicker: React.FC<TDatePickerProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  format,
  ...otherProps
}) => {
  // Nếu value là string thì convert sang Dayjs, nếu là Dayjs thì giữ nguyên
  const dayjsValue =
    typeof value === "string"
      ? dayjs(value).isValid()
        ? dayjs(value)
        : null
      : value;

  const handleChange = (date: Dayjs | null) => {
    if (date && date.isValid()) {
      const timeString = formatDateToString(date, format);
      // Đảm bảo chỉ truyền string
      onChange(
        typeof timeString === "string" ? timeString : date.format("YYYY-MM-DD")
      );
    } else {
      onChange(""); // ✅ Nếu xóa ngày, trả về chuỗi rỗng
    }
  };
  // 2) Mapping tuyệt đối: dayjs(date).day() trả về 0..6 (0 = Chủ nhật)
  const WEEK_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return (
    <DatePicker
      label={label || "Chọn ngày"}
      value={dayjsValue}
      onChange={handleChange}
      dayOfWeekFormatter={date => {
        // date có thể là Dayjs object hoặc JS Date tùy adapter; dùng dayjs() an toàn
        const d = dayjs(date);
        const idx = d.day(); // 0 = CN, 1 = T2, ...
        return WEEK_LABELS[idx] ?? d.format("dd");
      }}
      format={format ?? formatTime.dayFull} // ✅ Hiển thị giờ & ngày theo format mong muốn
      {...otherProps} // ✅ Nhận tất cả các props khác
      slotProps={{
        ...otherProps.slotProps,
        textField: {
          ...otherProps.slotProps?.textField,
          error: error, // ✅ Truyền error vào TextField
          helperText: helperText, // ✅ Truyền helperText vào TextField
        },
      }}
    />
  );
};

export { TDatePicker };
