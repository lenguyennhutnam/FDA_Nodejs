import React from "react";
import {
  DateTimePicker,
  DateTimePickerProps,
} from "@mui/x-date-pickers/DateTimePicker";
import {TextField} from "@mui/material";
import dayjs, {Dayjs} from "dayjs";

type TDateTimePickerProps = {
  value: string | null; // Giá trị có thể là chuỗi ISO hoặc null
  onChange: (isoString: string) => void; // Hàm callback trả về chuỗi ISO
  label?: string;
  error?: boolean; // ✅ Thêm error
  helperText?: string; // ✅ Thêm helperText
} & Omit<DateTimePickerProps<Dayjs>, "value" | "onChange">; // ✅ Nhận mọi props từ DateTimePicker, trừ value & onChange

const TDateTimePicker: React.FC<TDateTimePickerProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  ...otherProps
}) => {
  const handleChange = (date: Dayjs | null) => {
    if (date) {
      const isoString = date.toISOString(); // ✅ Convert thành ISO 8601
      onChange(isoString);
    } else {
      onChange(""); // ✅ Nếu xóa ngày, trả về chuỗi rỗng
    }
  };

  return (
    <DateTimePicker
      label={label || "Chọn ngày & giờ"}
      value={value ? dayjs(value) : null} // ✅ Convert từ ISO sang Dayjs object
      onChange={handleChange}
      format="HH:mm DD/MM/YYYY" // ✅ Hiển thị giờ & ngày theo format mong muốn
      ampm={true} // ✅ Hiển thị giờ theo 24h
      {...otherProps} // ✅ Nhận tất cả các props khác
      slotProps={{
        textField: {
          error: error, // ✅ Truyền error vào TextField
          helperText: helperText, // ✅ Truyền helperText vào TextField
        },
      }}
    />
  );
};

export {TDateTimePicker};
