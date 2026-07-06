import { Box, Checkbox, CircularProgress, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from "@mui/material";
import { useState, useEffect } from "react";
import {
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { TTextField } from "../tTextField";
import { EmptyStateCell, EmptyStateContainer, EmptyStateRow } from "./styles";
import type { Column, Data } from "./types";

interface TTableProps {
  columns: Column[];
  rows: Data[];
  rowsPerPageOptions?: number[];
  showIndex?: boolean;
  hidePagination?: boolean;
  loading?: boolean;

  pageSize?: number;
  pageIndex?: number;
  total?: number;
  onChangePage?: (value: number) => void;
  onRowPerPageChange?: (value: number) => void;

  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: (checked: boolean) => void;
  rowIdKey?: string;

  onRowDoubleClick?: (row: Data) => void;
}

export const TTable: React.FC<TTableProps> = ({
  rows,
  columns,
  rowsPerPageOptions = [1, 5, 6, 8, 10, 25, 50, 100, 500],
  showIndex = false,
  hidePagination = false,
  loading = false,

  pageSize = 10,
  pageIndex = 1,
  total = 0,
  onChangePage = () => { },
  onRowPerPageChange = () => { },

  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  rowIdKey = "_id",
  onRowDoubleClick,
}) => {
  const [internalPage, setInternalPage] = useState(pageIndex);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(pageSize);
  
  // Keep internal state in sync with props
  useEffect(() => { setInternalPage(pageIndex); }, [pageIndex]);
  useEffect(() => { setInternalRowsPerPage(pageSize); }, [pageSize]);

  const [pageInput, setPageInput] = useState<string>("");
  
  const actualTotal = Math.max(total, rows?.length || 0);
  const totalPages = Math.ceil(actualTotal / internalRowsPerPage);

  const handlePageChange = (newPage: number) => {
    setInternalPage(newPage);
    onChangePage(newPage);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    handlePageChange(newPage + 1);
  };

  const handleFirstPage = () => {
    handlePageChange(1);
  };

  const handleLastPage = () => {
    handlePageChange(totalPages);
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      const page = parseInt(pageInput);
      if (page && page > 0 && page <= totalPages) {
        handlePageChange(page);
      }
      setPageInput("");
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = +event.target.value;
    setInternalRowsPerPage(val);
    onRowPerPageChange(val);
    handlePageChange(1); // Reset to first page
  };

  const handlePrevPage = () => {
    if (internalPage > 1) {
      handlePageChange(internalPage - 1);
    }
  };

  const handleNextPage = () => {
    if (internalPage < totalPages) {
      handlePageChange(internalPage + 1);
    }
  };

  const allSelected =
    (rows || []).length > 0 &&
    (rows || []).every(row => selectedIds.includes(String(row[rowIdKey])));

  let modifiedColumns = [...columns];
  if (showIndex) {
    modifiedColumns = [
      { id: "stt", label: "STT", minWidth: 50, align: "center" },
      ...modifiedColumns,
    ];
  }
  if (selectable) {
    modifiedColumns = [
      { id: "checkbox", label: "", minWidth: 50 },
      ...modifiedColumns,
    ];
  }

  // Calculate left position for sticky left columns
  let leftPosition = 0;
  const stickyLeftPositions: { id: string; left: number }[] = [];

  modifiedColumns.forEach(col => {
    if (col.sticky === "left") {
      stickyLeftPositions.push({ id: col.id, left: leftPosition });
      leftPosition += col.minWidth || 100;
    }
  });

  return (
    <Box sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table stickyHeader sx={{ borderCollapse: "collapse" }}>
          <TableHead>
            <TableRow>
              {modifiedColumns.map(column => (
                <TableCell
                  key={column.id}
                  align="center"
                  style={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                      ? `${column.maxWidth}px`
                      : undefined,
                    width: column.maxWidth
                      ? `${column.maxWidth}px`
                      : column.minWidth
                        ? `${column.minWidth}px`
                        : undefined,
                    ...(column.sticky
                      ? {
                        position: "sticky",
                        [column.sticky]:
                          column.sticky === "left"
                            ? `${stickyLeftPositions.find(
                              pos => pos.id === column.id
                            )?.left || 0
                            }px`
                            : "0px",
                        zIndex: column.sticky === "left" ? 20 : 15,
                      }
                      : {}),
                  }}
                  sx={{
                    backgroundColor: "#1976d2",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "13px",
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth
                      ? `${column.maxWidth}px`
                      : undefined,
                    width: column.maxWidth
                      ? `${column.maxWidth}px`
                      : column.minWidth
                        ? `${column.minWidth}px`
                        : undefined,
                    border: "1px solid #ffffff",
                    borderTop: "none",
                    borderLeft: "none",
                    textAlign: "center !important",
                    "&:last-child": {
                      borderRight: "none",
                    },
                    ...(column.sticky === "right" && {
                      borderRight: "1px solid #e0e0e0 !important",
                      backgroundColor: "#1976d2",
                    }),
                    ...(column.sticky === "left" && {
                      borderLeft: "1px solid #e0e0e0 !important",
                      backgroundColor: "#1976d2",
                    }),
                  } as any}
                >
                  {column.id === "checkbox" ? (
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selectedIds.length > 0 && !allSelected}
                      onChange={e => onToggleSelectAll?.(e.target.checked)}
                      sx={{
                        color: "#fff",
                        "&.Mui-checked": {
                          color: "#fff",
                        },
                        "&.MuiCheckbox-indeterminate": {
                          color: "#fff",
                        },
                      }}
                    />
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody sx={{ position: "relative" }}>
            {loading && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(2px)",
                  zIndex: 1,
                  width: "100%",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CircularProgress
                  size={40}
                  sx={{
                    color: "#1976d2",
                    animation: "spin 1s linear infinite",
                    "@keyframes spin": {
                      "0%": {
                        transform: "rotate(0deg)",
                      },
                      "100%": {
                        transform: "rotate(360deg)",
                      },
                    },
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Trang {internalPage} / {totalPages > 0 ? totalPages : 1}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  (Tổng: {actualTotal})
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color: "#1976d2",
                    fontWeight: 500,
                  }}
                >
                  Đang tải...
                </Typography>
              </Box>
            )}
            {(rows || []).length === 0 && (
              <EmptyStateRow>
                <EmptyStateCell colSpan={modifiedColumns.length}>
                  <EmptyStateContainer>
                    Không có dữ liệu hiển thị
                  </EmptyStateContainer>
                </EmptyStateCell>
              </EmptyStateRow>
            )}

            {(() => {
              const visibleRows = (rows?.length === actualTotal && rows?.length > internalRowsPerPage)
                ? (rows || []).slice((internalPage - 1) * internalRowsPerPage, internalPage * internalRowsPerPage)
                : (rows || []);
              
              return visibleRows.length > 0 && visibleRows.map((row, index) => {
                const rowId = String(row[rowIdKey]);
                const isChecked = selectedIds.includes(rowId);

                return (
                  <TableRow
                    key={`row-${index}`}
                    hover
                    onClick={() => onRowDoubleClick?.(row)}
                    sx={{
                      cursor: onRowDoubleClick ? "pointer" : "default",
                      "&:hover": {
                        backgroundColor: "#f5f5f5",
                      },
                      backgroundColor: "#ffffff",
                      border: onRowDoubleClick
                        ? "1px solid transparent"
                        : "none",
                      transition: "all 0.2s ease-in-out",
                      height: "auto",
                      ...((row.style as React.CSSProperties) || {}),
                    }}
                  >
                    {modifiedColumns.map(column => (
                      <TableCell
                        key={column.id}
                        align={column.align}
                        style={{
                          ...(column.sticky
                            ? {
                                position: "sticky",
                                [column.sticky]:
                                  column.sticky === "left"
                                    ? `${stickyLeftPositions.find(
                                      pos => pos.id === column.id
                                    )?.left || 0
                                    }px`
                                    : "0px",
                                zIndex: column.sticky === "left" ? 10 : 5,
                              }
                            : {}),
                        }}
                        sx={{
                          backgroundColor: "#ffffff",
                          fontWeight: 400,
                          verticalAlign: "middle",
                          color: "#000",
                          fontSize: "13px",
                          border: "1px solid #ccc",
                          borderTop: "none",
                          borderLeft: "none",

                          // Handle wordWrap
                          whiteSpace: column.wordWrap ? "pre-wrap" : "nowrap",
                          wordBreak: column.wordWrap
                            ? "break-word"
                            : "normal",
                          overflowWrap: column.wordWrap
                            ? "break-word"
                            : "normal",
                          hyphens: column.wordWrap ? "auto" : "none",
                          maxWidth: column.maxWidth
                            ? `${column.maxWidth}px`
                            : column.wordWrap
                              ? "400px"
                              : "none",
                          width: column.maxWidth
                            ? `${column.maxWidth}px`
                            : column.minWidth
                              ? `${column.minWidth}px`
                              : undefined,
                          minWidth: column.wordWrap ? "200px" : "auto",
                          padding: column.wordWrap ? "8px 12px" : "8px 12px",
                          lineHeight: column.wordWrap ? "1.4" : "normal",

                          // maxLines is handled in the cell content rendering

                          "&:last-child": {
                            borderRight: "none",
                          },
                          ...(column.sticky === "right" && {
                            borderRight: "2px solid #e0e0e0 !important",
                            backgroundColor: "#ffffff",
                          }),
                          ...(column.sticky === "left" && {
                            borderLeft: "2px solid #e0e0e0 !important",
                            backgroundColor: "#ffffff",
                          }),
                          ...((row.style as React.CSSProperties) || {}),
                        }}
                      >
                        {column.id === "checkbox" ? (
                          <Checkbox
                            checked={isChecked}
                            onChange={() => onToggleSelect?.(rowId)}
                          />
                        ) : column.id === "stt" ? (
                          (internalPage - 1) * internalRowsPerPage + index + 1
                        ) : column.maxWidth || column.maxLines ? (
                          <Tooltip
                            title={row[column.id] || ""}
                            placement="top"
                            arrow
                            enterDelay={500}
                            leaveDelay={200}
                          >
                            <Box
                              sx={{
                                // Kết hợp maxWidth và maxLines - ưu tiên maxWidth trước
                                ...(column.maxWidth && column.maxLines
                                  ? {
                                    // Cả hai thuộc tính: kết hợp hài hòa
                                    maxWidth: `${column.maxWidth}px`,
                                    width: `${column.maxWidth}px`,
                                    display: "-webkit-box",
                                    WebkitLineClamp: column.maxLines,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                    lineHeight: "1.4",
                                    boxSizing: "border-box",
                                  }
                                  : column.maxWidth
                                    ? {
                                      // Chỉ maxWidth: giới hạn chiều rộng, không xuống dòng
                                      maxWidth: `${column.maxWidth}px`,
                                      width: `${column.maxWidth}px`,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      display: "block",
                                      boxSizing: "border-box",
                                    }
                                    : column.maxLines
                                      ? {
                                        // Chỉ maxLines: giới hạn số dòng
                                        display: "-webkit-box",
                                        WebkitLineClamp: column.maxLines,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "normal",
                                        wordBreak: "break-word",
                                        lineHeight: "1.4",
                                        width: "100%",
                                        boxSizing: "border-box",
                                      }
                                      : {}),
                                cursor: "help",
                                width: "100%",
                              }}
                            >
                              {row[column.id]}
                            </Box>
                          </Tooltip>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              position: "relative",
                            }}
                          >
                            <span>{row[column.id]}</span>
                            {onRowDoubleClick &&
                              column.id === "nhiem_vu_trien_khai" && (
                                <Box
                                  sx={{
                                    ml: 1,
                                    opacity: 0.4,
                                    transition: "opacity 0.2s",
                                    fontSize: "12px",
                                    "&:hover": { opacity: 0.8 },
                                  }}
                                >
                                  👁️
                                </Box>
                              )}
                          </Box>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              });
            })()}
          </TableBody>
        </Table>
      </TableContainer>

      {!hidePagination && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 1,
            p: 2,
            borderTop: "1px solid rgba(0, 0, 0, 0.12)",
            "& .MuiTablePagination-root": {
              margin: 0,
              fontSize: "13px",
            },
            "& .MuiTablePagination-select": {
              padding: "4px 8px",
              fontSize: "13px",
            },
            "& .MuiTablePagination-selectLabel": {
              margin: 0,
              fontSize: "13px",
            },
            "& .MuiTablePagination-displayedRows": {
              margin: 0,
              fontSize: "13px",
            },
            "& .MuiTablePagination-actions": {
              display: "none",
            },
            "& .MuiTablePagination-menuItem": {
              fontSize: "13px",
            },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleFirstPage}
              disabled={internalPage === 1 || !actualTotal}
              size="small"
              sx={{
                color:
                  internalPage === 1 || !actualTotal
                    ? "rgba(0, 0, 0, 0.26)"
                    : "rgba(0, 0, 0, 0.54)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                padding: "4px",
              }}
            >
              <FaAngleDoubleLeft size={14} />
            </IconButton>
            <IconButton
              onClick={handlePrevPage}
              disabled={internalPage === 1 || !actualTotal}
              size="small"
              sx={{
                color:
                  internalPage === 1 || !actualTotal
                    ? "rgba(0, 0, 0, 0.26)"
                    : "rgba(0, 0, 0, 0.54)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                padding: "4px",
              }}
            >
              <FaChevronLeft size={14} />
            </IconButton>
            <TTextField
              label=""
              size="medium"
              value={pageInput}
              onChange={handlePageInputChange}
              onKeyPress={handlePageInputKeyPress}
              placeholder="Trang"
              sx={{
                width: 60,
                "& .MuiOutlinedInput-root": {
                  height: 28,
                  background: "white",
                  padding: "2px 8px",
                  fontSize: "13px",
                  "& input": {
                    padding: "4px 0",
                    textAlign: "center",
                  },
                },
              }}
            />
            <IconButton
              onClick={handleNextPage}
              disabled={internalPage >= totalPages || !actualTotal}
              size="small"
              sx={{
                color:
                  internalPage >= totalPages || !actualTotal
                    ? "rgba(0, 0, 0, 0.26)"
                    : "rgba(0, 0, 0, 0.54)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                padding: "4px",
              }}
            >
              <FaChevronRight size={14} />
            </IconButton>
            <IconButton
              onClick={handleLastPage}
              disabled={internalPage >= totalPages || !actualTotal}
              size="small"
              sx={{
                color:
                  internalPage >= totalPages || !actualTotal
                    ? "rgba(0, 0, 0, 0.26)"
                    : "rgba(0, 0, 0, 0.54)",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                padding: "4px",
              }}
            >
              <FaAngleDoubleRight size={14} />
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions}
              component="div"
              count={actualTotal}
              rowsPerPage={internalRowsPerPage}
              page={internalPage - 1}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Số dòng:"
              labelDisplayedRows={({ page }) => (
                <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <span>
                    Trang {page + 1}/{Math.ceil(total / pageSize)}
                  </span>
                  <span style={{ color: "rgba(0, 0, 0, 0.54)" }}>|</span>
                  <span>Tổng: {total}</span>
                </Box>
              )}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
