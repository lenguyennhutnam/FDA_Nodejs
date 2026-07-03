import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { useEffect, useState } from "react";
import { MdNavigateBefore, MdNavigateNext } from "react-icons/md";

// Extend dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.locale("vi");

interface WeekSelectorControls {
  showNavigationButtons?: boolean; // Hiển thị nút prev/next
  showCurrentWeekButton?: boolean; // Hiển thị nút "Tuần này"
  showYearSelector?: boolean; // Hiển thị dropdown chọn năm
  showWeekSelector?: boolean; // Hiển thị dropdown chọn tuần
  showWeekDisplay?: boolean; // Hiển thị text hiển thị tuần hiện tại
}

interface WeekSelectorProps {
  value: dayjs.Dayjs;
  onChange: (week: dayjs.Dayjs) => void;
  sx?: React.CSSProperties;
  controls?: WeekSelectorControls;
}

export const TWeekSelector = ({
  value,
  onChange,
  sx = {},
  controls = {
    showNavigationButtons: true,
    showCurrentWeekButton: true,
    showYearSelector: true,
    showWeekSelector: true,
    showWeekDisplay: true,
  },
}: WeekSelectorProps) => {
  const [currentYear, setCurrentYear] = useState(value.year());
  const [currentWeek, setCurrentWeek] = useState(value.week());

  // Generate years (current year ± 2)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Generate weeks for current year
  const weeks = Array.from({ length: 52 }, (_, i) => i + 1);

  useEffect(() => {
    setCurrentYear(value.year());
    setCurrentWeek(value.week());
  }, [value]);

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    const newWeek = dayjs().year(year).week(currentWeek);
    onChange(newWeek);
  };

  const handleWeekChange = (week: number) => {
    setCurrentWeek(week);
    const newWeek = dayjs().year(currentYear).week(week);
    onChange(newWeek);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = direction === 'prev' 
      ? value.subtract(1, 'week')
      : value.add(1, 'week');
    onChange(newWeek);
  };

  const goToCurrentWeek = () => {
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    onChange(now);
  };

  // Check if a week is the current week
  const isCurrentWeek = (week: number) => {
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    return now.year() === currentYear && now.week() === week;
  };

  const formatWeekDisplay = (week: dayjs.Dayjs) => {
    const startOfWeek = week.startOf('week');
    const endOfWeek = week.endOf('week');
    
    return `Tuần ${week.week()} (${startOfWeek.format('DD/MM')} - ${endOfWeek.format('DD/MM/YYYY')})`;
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, ...sx }}>
      {/* Navigation buttons */}
      {controls.showNavigationButtons && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigateWeek('prev')}
            sx={{
              minWidth: 40,
              height: 40,
              borderRadius: "8px",
              borderColor: "#e0e0e0",
              "&:hover": {
                borderColor: "#1976d2",
                backgroundColor: "#f0f7ff",
              },
            }}
          >
            <MdNavigateBefore size={20} />
          </Button>
          
          <Button
            variant="outlined"
            size="small"
            onClick={() => navigateWeek('next')}
            sx={{
              minWidth: 40,
              height: 40,
              borderRadius: "8px",
              borderColor: "#e0e0e0",
              "&:hover": {
                borderColor: "#1976d2",
                backgroundColor: "#f0f7ff",
              },
            }}
          >
            <MdNavigateNext size={20} />
          </Button>
        </Box>
      )}

      {/* Week display */}
      {controls.showWeekDisplay && (
        <Box sx={{ minWidth: 200 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: "#1976d2",
              textAlign: "center",
              backgroundColor: "#f0f7ff",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #e3f2fd",
            }}
          >
            {formatWeekDisplay(value)}
          </Typography>
        </Box>
      )}

      {/* Year selector */}
      {controls.showYearSelector && (
        <FormControl size="small" sx={{ minWidth: 80 }}>
          <InputLabel>Năm</InputLabel>
          <Select
            value={currentYear}
            onChange={(e) => handleYearChange(Number(e.target.value))}
            label="Năm"
            sx={{
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e0e0e0",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
              },
            }}
          >
            {years.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Week selector */}
      {controls.showWeekSelector && (
        <FormControl size="small" sx={{ minWidth: 100 }}>
          <InputLabel>Tuần</InputLabel>
          <Select
            value={currentWeek}
            onChange={(e) => handleWeekChange(Number(e.target.value))}
            label="Tuần"
            sx={{
              borderRadius: "8px",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#e0e0e0",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1976d2",
              },
            }}
          >
            {weeks.map((week) => (
              <MenuItem 
                key={week} 
                value={week}
                sx={{
                  backgroundColor: isCurrentWeek(week) ? "#e8f5e8" : "transparent",
                  color: isCurrentWeek(week) ? "#2e7d32" : "inherit",
                  fontWeight: isCurrentWeek(week) ? 700 : 400,
                  borderLeft: isCurrentWeek(week) ? "4px solid #4caf50" : "4px solid transparent",
                  position: "relative",
                  "&:hover": {
                    backgroundColor: isCurrentWeek(week) ? "#c8e6c9" : "#f5f5f5",
                  },
                  "&.Mui-selected": {
                    backgroundColor: isCurrentWeek(week) ? "#4caf50" : "#e3f2fd",
                    color: isCurrentWeek(week) ? "white" : "#1976d2",
                    "&:hover": {
                      backgroundColor: isCurrentWeek(week) ? "#388e3c" : "#bbdefb",
                    },
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Box sx={{ flex: 1 }}>
                    Tuần {week}
                  </Box>
                  
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {/* Current week button */}
      {controls.showCurrentWeekButton && (
        <Button
          variant="contained"
          onClick={goToCurrentWeek}
          sx={{
            backgroundColor: "#0A8DEE",
            textTransform: "none !important",
            minWidth: "100px",
            fontWeight: 500,
            "&:hover": {
              backgroundColor: "#0977d1",
            },
          }}
        >
          Tuần này
        </Button>
      )}
    </Box>
  );
};
