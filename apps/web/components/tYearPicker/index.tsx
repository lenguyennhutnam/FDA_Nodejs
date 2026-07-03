import React from "react";
import {LocalizationProvider, DatePicker} from "@mui/x-date-pickers";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, {Dayjs} from "dayjs";

interface TYearPickerProps {
  value?: number | string;
  onChange?: (value: number | null) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  size?: "small" | "medium";
}

export const TYearPicker: React.FC<TYearPickerProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  size = "medium",
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        views={["year"]}
        label={label}
        value={value ? dayjs(String(value)) : null}
        onChange={(date: Dayjs | null) => {
          if (onChange) {
            onChange(date ? date.year() : null);
          }
        }}
        slotProps={{
          textField: {
            error,
            helperText,
            fullWidth: true,
            size,
          },
        }}
      />
    </LocalizationProvider>
  );
};
