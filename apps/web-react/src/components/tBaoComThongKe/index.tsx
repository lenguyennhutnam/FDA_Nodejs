import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, useTheme } from "@mui/material";
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

interface ChiTietBaoCom {
  nguoi_dung_detail: {
    full_name: string;
  };
  an_sang: boolean;
  an_trua: boolean;
  an_toi: boolean;
}

interface ThongKeTong {
  tong_sang: number;
  tong_trua: number;
  tong_toi: number;
}

export const TBaoComThongKe = () => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(
    dayjs().tz("Asia/Ho_Chi_Minh")
  );
  const [chiTietNguoiDung, setChiTietNguoiDung] = useState<Array<{
    stt: number;
    ho_ten: string;
    an_sang: boolean;
    an_trua: boolean;
    an_toi: boolean;
  }>>([]);
  const [tongChiTiet, setTongChiTiet] = useState<ThongKeTong>({
    tong_sang: 0,
    tong_trua: 0,
    tong_toi: 0,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);

  const loadBaoComData = (date: dayjs.Dayjs) => {
    const formattedDate = date.format("YYYY-MM-DD");
    APIServices.BaoComService.getLichSuBaoCom(formattedDate).then((res) => {
      if (res) {
        setChiTietNguoiDung(
          res.danh_sach.map((item: ChiTietBaoCom, index: number) => ({
            stt: index + 1,
            ho_ten: item.nguoi_dung_detail?.full_name,
            an_sang: item.an_sang,
            an_trua: item.an_trua,
            an_toi: item.an_toi,
          }))
        );
        setTongChiTiet({
          tong_sang: res.tong_an_sang,
          tong_trua: res.tong_an_trua,
          tong_toi: res.tong_an_toi,
        });
      }
    });
  };

  useEffect(() => {
    loadBaoComData(selectedDate);
  }, [selectedDate]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

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
          Thống kê báo cơm
        </Typography>

        <TDatePicker
          label="Chọn ngày"
          value={selectedDate.format(formatTime.dayFull)}
          onChange={(value) => {
            if (value) {
              const parsedDate = dayjs(value, formatTime.dayFull).tz("Asia/Ho_Chi_Minh");
              setSelectedDate(parsedDate);
            }
          }}
          format={formatTime.dayFull}
          sx={{ width: 180 }}
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={500} mb={1}>
          Tổng số suất
        </Typography>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(25, 118, 210, 0.08)",
              minWidth: 120,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              {tongChiTiet.tong_sang}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bữa sáng
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(25, 118, 210, 0.08)",
              minWidth: 120,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              {tongChiTiet.tong_trua}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bữa trưa
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: "rgba(25, 118, 210, 0.08)",
              minWidth: 120,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" color="primary.main" fontWeight={600}>
              {tongChiTiet.tong_toi}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Bữa tối
            </Typography>
          </Box>
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
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }}>STT</TableCell>
                <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }}>Họ tên</TableCell>
                <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }} align="center">
                  Bữa sáng
                </TableCell>
                <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }} align="center">
                  Bữa trưa
                </TableCell>
                <TableCell sx={{ bgcolor: "#0A8DEE", color: "white" }} align="center">
                  Bữa tối
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chiTietNguoiDung
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row.stt}>
                    <TableCell>{row.stt}</TableCell>
                    <TableCell>{row.ho_ten}</TableCell>
                    <TableCell align="center">
                      {row.an_sang ? "✓" : ""}
                    </TableCell>
                    <TableCell align="center">
                      {row.an_trua ? "✓" : ""}
                    </TableCell>
                    <TableCell align="center">
                      {row.an_toi ? "✓" : ""}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={chiTietNguoiDung.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5]}
          sx={{
            "& .MuiTablePagination-select": {
              display: "none",
            },
            "& .MuiTablePagination-selectLabel": {
              display: "none",
            },
          }}
        />
      </Box>
    </Paper>
  );
}; 