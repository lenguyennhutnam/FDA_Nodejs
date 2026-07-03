import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Box,
  Typography,
  Chip,
  Paper,
  useTheme,
} from "@mui/material";
import { APIServices } from "../../utils";

interface NhienLieu {
  _id: string;
  ten: string;
  don_vi: string;
}

interface NhiemVu {
  _id: string;
  ten: string;
  khoi: string;
}

interface ChiTietHanMuc {
  nhien_lieu: string;
  nhiem_vu: string;
  so_luong: number;
}

interface TTableInputProps {
  value: ChiTietHanMuc[];
  onChange: (value: ChiTietHanMuc[]) => void;
}

const getKhoiDisplayName = (khoi: string): string => {
  switch (khoi) {
    case "ThamMuu":
      return "Tham mưu";
    case "ChinhTri":
      return "Chính trị";
    case "HauCanKyThuat":
      return "Hậu cần kỹ thuật";
    default:
      return khoi;
  }
};

const getKhoiColor = (khoi: string) => {
  switch (khoi) {
    case "ThamMuu":
      return { bg: "#e8f5e8", color: "#2e7d32" };
    case "ChinhTri":
      return { bg: "#fff3e0", color: "#f57c00" };
    case "HauCanKyThuat":
      return { bg: "#e3f2fd", color: "#1976d2" };
    default:
      return { bg: "#f5f5f5", color: "#666" };
  }
};

export const TTableNhienLieuInput: React.FC<TTableInputProps> = ({
  value,
  onChange,
}) => {
  const [nhienLieus, setNhienLieus] = useState<NhienLieu[]>([]);
  const [nhiemVus, setNhiemVus] = useState<NhiemVu[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [nhienLieuResponse, nhiemVuResponse] = await Promise.all([
          APIServices.NhienLieuService.getListEntity(1, 1000),
          APIServices.NhiemVuService.getListEntity(1, 1000),
        ]);

        setNhienLieus(nhienLieuResponse?.items || []);
        setNhiemVus(nhiemVuResponse?.items || []);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Group nhiệm vụ by khối
  const nhiemVuByKhoi = nhiemVus.reduce((acc, nhiemVu) => {
    if (!acc[nhiemVu.khoi]) {
      acc[nhiemVu.khoi] = [];
    }
    acc[nhiemVu.khoi].push(nhiemVu);
    return acc;
  }, {} as Record<string, NhiemVu[]>);

  // Helper: get value for a cell, default 0
  const getCellValue = (nhiemVuId: string, nhienLieuId: string): number => {
    const item = value.find(
      (item) => item.nhiem_vu === nhiemVuId && item.nhien_lieu === nhienLieuId
    );
    return item ? item.so_luong : 0;
  };

  // Helper: set value for a cell
  const setCellValue = (
    nhiemVuId: string,
    nhienLieuId: string,
    newValue: number
  ) => {
    const existingIndex = value.findIndex(
      (item) => item.nhiem_vu === nhiemVuId && item.nhien_lieu === nhienLieuId
    );
    if (newValue > 0) {
      if (existingIndex >= 0) {
        // Update existing item
        const newValueArray = [...value];
        newValueArray[existingIndex] = {
          ...newValueArray[existingIndex],
          so_luong: newValue,
        };
        onChange(newValueArray);
      } else {
        // Add new item
        onChange([
          ...value,
          {
            nhien_lieu: nhienLieuId,
            nhiem_vu: nhiemVuId,
            so_luong: newValue,
          },
        ]);
      }
    } else {
      // Remove item if value is 0 or empty
      if (existingIndex >= 0) {
        const newValueArray = value.filter(
          (_, index) => index !== existingIndex
        );
        onChange(newValueArray);
      }
    }
  };

  if (loading) {
    return <Typography>Đang tải...</Typography>;
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
        Chi tiết hạn mức
      </Typography>

      <Paper
        elevation={1}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <TableContainer
          sx={{
            maxHeight: 600,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#c1c1c1",
              borderRadius: "4px",
              "&:hover": {
                background: "#a8a8a8",
              },
            },
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    minWidth: 200,
                    maxWidth: 250,
                    backgroundColor: theme.palette.background.paper,
                    borderBottom: "2px solid",
                    borderBottomColor: "primary.main",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                  }}
                >
                  Nhiệm vụ
                </TableCell>
                {nhienLieus.map((nhienLieu) => (
                  <TableCell
                    key={nhienLieu._id}
                    align="center"
                    sx={{
                      fontWeight: 600,
                      minWidth: 140,
                      backgroundColor: theme.palette.background.paper,
                      borderBottom: "2px solid",
                      borderBottomColor: "primary.main",
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {nhienLieu.ten}
                      </Typography>
                      <Chip
                        label={nhienLieu.don_vi}
                        size="small"
                        variant="outlined"
                        sx={{
                          fontSize: "10px",
                          height: "20px",
                          "& .MuiChip-label": {
                            px: 1,
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(nhiemVuByKhoi).map(([khoi, nhiemVusInKhoi]) => (
                <React.Fragment key={khoi}>
                  {/* Header row for khoi */}
                  <TableRow
                    sx={{
                      backgroundColor: getKhoiColor(khoi).bg,
                      "&:hover": {
                        backgroundColor: getKhoiColor(khoi).bg,
                      },
                    }}
                  >
                    <TableCell
                      colSpan={nhienLieus.length + 1}
                      sx={{
                        borderBottom: "2px solid",
                        borderBottomColor: "divider",
                        py: 1,
                      }}
                    >
                      <Chip
                        label={getKhoiDisplayName(khoi)}
                        size="small"
                        sx={{
                          backgroundColor: getKhoiColor(khoi).bg,
                          color: getKhoiColor(khoi).color,
                          fontWeight: 600,
                          fontSize: "14px",
                          "& .MuiChip-label": {
                            px: 2,
                          },
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  {/* Data rows for nhiệm vụ in this khoi */}
                  {nhiemVusInKhoi.map((nhiemVu) => (
                    <TableRow
                      key={nhiemVu._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: "action.hover",
                        },
                        "&:nth-of-type(even)": {
                          backgroundColor: "action.hover",
                        },
                        "&:nth-of-type(even):hover": {
                          backgroundColor: "action.selected",
                        },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 500,
                          minWidth: 200,
                          maxWidth: 250,
                          borderRight: "1px solid",
                          borderRightColor: "divider",
                          backgroundColor: "background.paper",
                          position: "sticky",
                          left: 0,
                          zIndex: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 500,
                            lineHeight: 1.2,
                          }}
                        >
                          {nhiemVu.ten}
                        </Typography>
                      </TableCell>
                      {nhienLieus.map((nhienLieu) => {
                        const cellValue = getCellValue(
                          nhiemVu._id,
                          nhienLieu._id
                        );
                        return (
                          <TableCell
                            key={nhienLieu._id}
                            align="center"
                            sx={{
                              py: 1,
                              px: 0.5,
                            }}
                          >
                            <TextField
                              type="number"
                              size="small"
                              value={cellValue}
                              onChange={(e) => {
                                const val = parseInt(e.target.value, 10) || 0;
                                setCellValue(nhiemVu._id, nhienLieu._id, val);
                              }}
                              inputProps={{
                                min: 0,
                                max: 100000,
                                step: 1,
                                style: {
                                  textAlign: "center",
                                  fontSize: "14px",
                                },
                              }}
                              sx={{
                                width: "100px",
                                "& .MuiInputBase-root": {
                                  borderRadius: 1,
                                  backgroundColor: "background.paper",
                                  "&:hover": {
                                    backgroundColor: "action.hover",
                                  },
                                  "&.Mui-focused": {
                                    backgroundColor: "background.paper",
                                  },
                                },
                                "& .MuiInputBase-input": {
                                  textAlign: "center",
                                  py: 1,
                                  px: 1,
                                },
                              }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
