import { Box, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import timezone from "dayjs/plugin/timezone";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";
import { useEffect, useState } from "react";
import { formatTime } from "../../types/format-time.enum";
import { APIServices } from "../../utils";
import { TDatePicker } from "../tDatePicker";

// Set locale to Vietnamese and extend plugins
dayjs.locale("vi");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.updateLocale("vi", {
  weekStart: 1
});

interface ThucDon {
  _id: string;
  ngay: string;
  bua_sang: string;
  bua_trua: string;
  bua_toi: string;
  muc_an?: {
    _id: string;
    ten_muc_an: string;
    so_tien: number;
    ghi_chu?: string;
  };
  ngay_display?: React.ReactNode;
}

export const TThucDon = () => {
  const theme = useTheme();
  const [startDate, setStartDate] = useState(
    dayjs().tz("Asia/Ho_Chi_Minh").startOf("week")
  );
  const [endDate, setEndDate] = useState(
    dayjs().tz("Asia/Ho_Chi_Minh").endOf("week")
  );
  const [thucDons, setThucDons] = useState<ThucDon[]>([]);

  const getWeekdayName = (date: string) => {
    const weekdays = [
      "Chủ nhật",
      "Thứ hai",
      "Thứ ba",
      "Thứ tư",
      "Thứ năm",
      "Thứ sáu",
      "Thứ bảy",
    ];
    const day = dayjs(date).day();
    return weekdays[day];
  };

  // load data
  const loadData = async () => {
    try {
      const request = await APIServices.BaoComService.getThucDonList(
        startDate.format("YYYY-MM-DD"),
        endDate.format("YYYY-MM-DD")
      );
      const { items } = request;
      const formattedItems = items.map((item: ThucDon) => ({
        ...item,
        ngay_display: (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {getWeekdayName(item.ngay)}
            </Typography>
            <Typography>
              {dayjs(item.ngay).format(formatTime.dayFull)}
            </Typography>
          </Box>
        ),
      }));
      setThucDons(formattedItems);
    } catch (error) {
      console.error("Error loading thuc don:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        borderRadius: 4,
        background: theme.palette.background.paper,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          pb: 2,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="h5"
          fontWeight={500}
          sx={{
            color: theme.palette.primary.main,
            fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
          }}
        >
          Thực đơn tuần
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <TDatePicker
            label="Từ ngày"
            value={startDate.format(formatTime.dayFull)}
            onChange={(value) => {
              if (value) {
                const parsedDate = dayjs(value, formatTime.dayFull).tz("Asia/Ho_Chi_Minh");
                setStartDate(parsedDate);
              }
            }}
            format={formatTime.dayFull}
            sx={{ width: 180 }}
          />
          <TDatePicker
            label="Đến ngày"
            value={endDate.format(formatTime.dayFull)}
            onChange={(value) => {
              if (value) {
                const parsedDate = dayjs(value, formatTime.dayFull).tz("Asia/Ho_Chi_Minh");
                setEndDate(parsedDate);
              }
            }}
            format={formatTime.dayFull}
            sx={{ width: 180 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          "& .MuiTableContainer-root": {
            borderRadius: 2,
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          },
          "& .MuiTableHead-root": {
            bgcolor: "background.default",
          },
          "& .MuiTableCell-head": {
            fontWeight: 600,
          },
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }}>Ngày</TableCell>
              <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }}>Bữa sáng</TableCell>
              <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }}>Bữa trưa</TableCell>
              <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }}>Bữa tối</TableCell>
              <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }}>Mức ăn</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {thucDons.map((row: ThucDon) => (
              <TableRow
                key={row._id}
                sx={
                  dayjs(row.ngay).isSame(dayjs(), "day")
                    ? {
                        backgroundColor: "rgba(25, 118, 210, 0.08)",
                        "&:hover": {
                          backgroundColor: "rgba(25, 118, 210, 0.12)",
                        },
                        "& .MuiTableCell-root": {
                          color: "primary.main",
                          fontWeight: 600,
                        },
                      }
                    : undefined
                }
              >
                <TableCell>{row.ngay_display}</TableCell>
                <TableCell>{row.bua_sang}</TableCell>
                <TableCell>{row.bua_trua}</TableCell>
                <TableCell>{row.bua_toi}</TableCell>
                <TableCell>{row.muc_an ? `${row.muc_an.ten_muc_an} - ${row.muc_an.so_tien?.toLocaleString('vi-VN')}đ` : 'Chưa chọn'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};
