import React from "react";
import { TimePicker, TimePickerProps } from "@mui/x-date-pickers/TimePicker";
import { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { formatDateToString } from "../../utils/common";

type TTimePickerProps = {
  value: string | null; // Chuỗi giờ dạng "HH:mm" hoặc null
  onChange: (time: string) => void; // Trả ra chuỗi "HH:mm"
  label?: string;
  error?: boolean;
  helperText?: string;
} & Omit<TimePickerProps, "value" | "onChange">;

const TTimePicker: React.FC<TTimePickerProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  ...otherProps
}) => {
  const handleChange = (time: Dayjs | null) => {
    if (time) {
      onChange(formatDateToString(time, "HH:mm")); // Trả về "HH:mm"
    } else {
      onChange("");
    }
  };

  return (
    <TimePicker
      label={label || "Chọn giờ"}
      value={value ? dayjs(`2000-01-01T${value}`) : null} // Chuyển từ "HH:mm" thành dayjs
      onChange={handleChange}
      ampm={false}
      {...otherProps}
      slotProps={{
        textField: {
          error,
          helperText,
        },
      }}
    />
  );
};

export { TTimePicker };
