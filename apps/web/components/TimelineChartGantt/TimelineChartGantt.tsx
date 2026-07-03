import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import React, {useCallback, useMemo} from "react";
import {TimelineChartProps, TimelineTask} from "./types";

interface GanttData {
  id: string;
  name: string;
  start: Date;
  end: Date;
  color?: string;
  progress?: number;
  dependencies?: string[];
  isOverdue?: boolean; // Trạng thái quá hạn
}

const TimelineChartGantt: React.FC<TimelineChartProps> = ({
  // Core data
  data,
  filteredData,

  // Chart configuration
  height = 600,
  width = "100%",
  showToolbar = false,
  interactive = true,

  // Interactions
  onTaskClick,
  onDataPointSelection,

  // Filter functionality
  showFilters = false,
  searchable = true,
  searchText = "",
  onSearchChange,

  // Status filters
  statusFilter = true,
  selectedStatus = [],
  onStatusChange,

  // Date filters
  dateRangeFilter = true,
  startDate,
  endDate,
  onDateRangeChange,

  // Tree/Expand functionality
  expandable = false,
  expandedTasks = new Set(),
  onToggleExpand,
  showSubTasks = true,

  // Assignee filters
  assigneeFilter = true,
  selectedAssignees = [],
  onAssigneeChange,

  // Custom styling
  customColors,
  showTooltip = true,

  // Loading & Error
  loading = false,
  error,
  emptyMessage = "Không có dữ liệu timeline để hiển thị",

  // Advanced options
  autoHeight = false,
  minHeight = 400,
  maxHeight = 1200,
  scrollable = true,

  // Display options
  alignLeft = true,
  wrapTaskNames = true,
  showDataLabels = false,
  enableZoom = false,

  // Layout options
  labelColumnWidth,
  chartColumnWidth,
}) => {
  // Get status color
  const getStatusColor = (status: string): string => {
    // Use custom colors if provided, otherwise use default colors
    if (customColors && customColors[status]) {
      return customColors[status];
    }

    const defaultColors = {
      DangThucHien: "#1976d2",
      DaHoanThanh: "#2e7d32",
      DaHuy: "#d32f2f",
    };
    return defaultColors[status as keyof typeof defaultColors] || "#757575";
  };

  // Get progress value
  const getProgressValue = (status: string): number => {
    switch (status) {
      case "DangThucHien":
        return 0.5; // 50% progress
      case "DaHoanThanh":
        return 1.0; // 100% progress
      case "DaHuy":
        return 0.0; // 0% progress
      default:
        return 0.0;
    }
  };

  // Apply filters to data
  const processedData = useMemo(() => {
    let result = data;

    // Apply search filter
    if (searchable && searchText) {
      result = result.filter(task =>
        task.ten.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter && selectedStatus.length > 0) {
      result = result.filter(task => selectedStatus.includes(task.tien_do));
    }

    // Apply date range filter
    if (dateRangeFilter && (startDate || endDate)) {
      result = result.filter(task => {
        const taskStart = new Date(task.thoi_gian_bat_dau);
        const taskEnd = new Date(task.thoi_gian_ket_thuc);

        if (startDate && taskEnd < startDate) return false;
        if (endDate && taskStart > endDate) return false;
        return true;
      });
    }

    // Apply assignee filter
    if (assigneeFilter && selectedAssignees.length > 0) {
      result = result.filter(
        task => task.ca_nhan && selectedAssignees.includes(task.ca_nhan._id)
      );
    }

    // Apply tree/expand filter
    if (expandable && !showSubTasks) {
      result = result.filter(
        task => !task.children || task.children.length === 0
      );
    }

    return result;
  }, [
    data,
    searchable,
    searchText,
    statusFilter,
    selectedStatus,
    dateRangeFilter,
    startDate,
    endDate,
    assigneeFilter,
    selectedAssignees,
    expandable,
    showSubTasks,
  ]);

  // Convert TimelineTask to GanttData
  const ganttData = useMemo((): GanttData[] => {
    const sourceData = filteredData || processedData;

    return sourceData.map((task: TimelineTask) => ({
      id: task._id,
      name: task.ten,
      start: new Date(task.thoi_gian_bat_dau),
      end: new Date(task.thoi_gian_ket_thuc),
      color: task.is_qua_han ? "#ff6f00" : getStatusColor(task.tien_do), // Màu cam đỏ cho nhiệm vụ quá hạn
      progress: getProgressValue(task.tien_do),
      dependencies: task.children?.map(child => child._id) || [],
      isOverdue: task.is_qua_han, // Thêm flag để xử lý styling
    }));
  }, [filteredData, processedData, getStatusColor, getProgressValue]);

  // Calculate timeline bounds for real timeline
  const timelineBounds = useMemo(() => {
    if (ganttData.length === 0) return {min: new Date(), max: new Date()};

    const dates = ganttData.flatMap(task => [task.start, task.end]);
    return {
      min: new Date(Math.min(...dates.map(d => d.getTime()))),
      max: new Date(Math.max(...dates.map(d => d.getTime()))),
    };
  }, [ganttData]);

  // Calculate dynamic height based on autoHeight
  const calculatedHeight = useMemo(() => {
    if (height) return height;
    if (autoHeight) {
      const baseHeight = 60; // Height per task row
      const headerHeight = 70; // Header + axis height
      const calculatedHeight = Math.max(
        minHeight,
        Math.min(maxHeight, headerHeight + ganttData.length * baseHeight)
      );
      return calculatedHeight;
    }
    return 400;
  }, [height, autoHeight, ganttData.length, minHeight, maxHeight]);

  // Calculate position on timeline
  const getTimelinePosition = (date: Date) => {
    const totalDuration =
      timelineBounds.max.getTime() - timelineBounds.min.getTime();
    const taskPosition = date.getTime() - timelineBounds.min.getTime();
    return (taskPosition / totalDuration) * 100;
  };

  // Handle task click
  const handleTaskClick = useCallback(
    (taskId: string) => {
      if (onTaskClick) {
        onTaskClick(taskId);
      }
    },
    [onTaskClick]
  );

  // Handle data point selection
  const handleDataPointSelection = useCallback(
    (taskId: string, taskIndex: number) => {
      if (onDataPointSelection) {
        onDataPointSelection(taskId, taskIndex);
      }
    },
    [onDataPointSelection]
  );

  // Get status text in Vietnamese
  const getStatusText = (status: string): string => {
    const statusTexts = {
      DangThucHien: "Đang thực hiện",
      DaHoanThanh: "Đã hoàn thành",
      DaHuy: "Đã hủy",
    };
    return statusTexts[status as keyof typeof statusTexts] || "Không xác định";
  };

  // Create tooltip content
  const createTooltipContent = (
    task: GanttData,
    originalTask: TimelineTask
  ) => {
    const startDate = task.start.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const endDate = task.end.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const duration = Math.ceil(
      (task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
      <Box sx={{p: 1, maxWidth: 300}}>
        <Typography
          variant="subtitle2"
          sx={{fontWeight: 600, color: "#1976d2", mb: 1}}
        >
          📋 {task.name}
        </Typography>

        <Box sx={{display: "flex", flexDirection: "column", gap: 0.5}}>
          <Typography variant="caption" sx={{color: "#666"}}>
            <strong>⏰ Bắt đầu:</strong> {startDate}
          </Typography>

          <Typography variant="caption" sx={{color: "#666"}}>
            <strong>🏁 Kết thúc:</strong> {endDate}
          </Typography>

          <Typography variant="caption" sx={{color: "#666"}}>
            <strong>📊 Tiến độ:</strong> {getStatusText(originalTask.tien_do)}
          </Typography>

          <Typography variant="caption" sx={{color: "#666"}}>
            <strong>⏱️ Thời gian:</strong> {duration} ngày
          </Typography>

          {originalTask.ca_nhan?.full_name && (
            <Typography variant="caption" sx={{color: "#666"}}>
              <strong>👤 Người thực hiện:</strong>{" "}
              {originalTask.ca_nhan.full_name}
            </Typography>
          )}
        </Box>
      </Box>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        width={width}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box width={width}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Empty state
  if (!ganttData || ganttData.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height={height}
        width={width}
        sx={{
          backgroundColor: "#f5f5f5",
          borderRadius: 2,
          border: "1px dashed #ccc",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: width,
        height: calculatedHeight,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Filter Panel */}
      {showFilters && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{mb: 2, fontWeight: 600, color: "#1976d2"}}
          >
            🔍 Bộ lọc
          </Typography>

          {/* Search Filter */}
          {searchable && (
            <Box sx={{mb: 2}}>
              <TextField
                size="small"
                placeholder="Tìm kiếm nhiệm vụ..."
                value={searchText}
                onChange={e => onSearchChange?.(e.target.value)}
                sx={{width: "100%"}}
              />
            </Box>
          )}

          {/* Status Filter */}
          {statusFilter && (
            <Box sx={{mb: 2}}>
              <Typography
                variant="caption"
                sx={{display: "block", mb: 1, fontWeight: 500}}
              >
                Trạng thái:
              </Typography>
              <Box sx={{display: "flex", gap: 1, flexWrap: "wrap"}}>
                {["DangThucHien", "DaHoanThanh", "DaHuy"].map(status => (
                  <Chip
                    key={status}
                    label={
                      status === "DangThucHien"
                        ? "Đang thực hiện"
                        : status === "DaHoanThanh"
                        ? "Đã hoàn thành"
                        : "Đã hủy"
                    }
                    size="small"
                    color={
                      selectedStatus.includes(status) ? "primary" : "default"
                    }
                    onClick={() => {
                      const newStatus = selectedStatus.includes(status)
                        ? selectedStatus.filter(s => s !== status)
                        : [...selectedStatus, status];
                      onStatusChange?.(newStatus);
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Expand/Collapse Controls */}
          {expandable && (
            <Box sx={{display: "flex", gap: 1, alignItems: "center"}}>
              <Button
                size="small"
                variant={showSubTasks ? "contained" : "outlined"}
                onClick={() => onToggleExpand?.("all")}
              >
                {showSubTasks ? "Ẩn subtasks" : "Hiện subtasks"}
              </Button>
            </Box>
          )}
        </Box>
      )}

      {/* Custom Gantt Chart Implementation */}
      <Box
        sx={{
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Toolbar */}
        {showToolbar && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1,
              borderBottom: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{fontWeight: 600, color: "#1976d2"}}
            >
              📊 Biểu đồ thời gian
            </Typography>
            <Box sx={{display: "flex", gap: 1}}>
              <Typography variant="caption" sx={{color: "#666"}}>
                {ganttData.length} nhiệm vụ
              </Typography>
            </Box>
          </Box>
        )}

        {/* Timeline Grid Header */}
        <Box
          sx={{
            display: "flex",
            borderBottom: "2px solid #1976d2",
            backgroundColor: "#f0f7ff",
            minHeight: 40,
            alignItems: "center",
          }}
        >
          {/* Task Name Header */}
          <Box
            sx={{
              width: labelColumnWidth || 300,
              minWidth: labelColumnWidth || 300,
              maxWidth: labelColumnWidth || 300,
              px: 2,
              py: 1,
              borderRight: "1px solid #e0e0e0",
              backgroundColor: "#e3f2fd",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{fontWeight: 600, color: "#1976d2"}}
            >
              📋 Tên nhiệm vụ
            </Typography>
          </Box>

          {/* Timeline Header */}
          <Box
            sx={{
              flex: 1,
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{fontWeight: 600, color: "#1976d2"}}
            >
              📅 Timeline
            </Typography>
            <Typography variant="caption" sx={{color: "#666"}}>
              {ganttData.length} nhiệm vụ
            </Typography>
          </Box>
        </Box>

        {/* Timeline Axis - Only in Timeline section */}
        <Box
          sx={{
            display: "flex",
            height: 30,
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa",
          }}
        >
          {/* Empty space for Task Name column */}
          <Box
            sx={{
              width: labelColumnWidth || 300,
              minWidth: labelColumnWidth || 300,
              maxWidth: labelColumnWidth || 300,
              borderRight: "1px solid #e0e0e0",
              backgroundColor: "#f8f9fa",
            }}
          />

          {/* Timeline Axis Labels - Only in Timeline section */}
          <Box
            sx={{
              flex: 1,
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            {(() => {
              const days = Math.ceil(
                (timelineBounds.max.getTime() - timelineBounds.min.getTime()) /
                  (1000 * 60 * 60 * 24)
              );
              const step = Math.max(1, Math.floor(days / 10)); // Show max 10 labels
              const labels = [];

              for (let i = 0; i <= days; i += step) {
                const date = new Date(
                  timelineBounds.min.getTime() + i * 24 * 60 * 60 * 1000
                );
                const position = (i / days) * 100;

                labels.push(
                  <Box
                    key={i}
                    sx={{
                      position: "absolute",
                      left: `${position}%`,
                      top: "50%",
                      transform: "translateX(-50%) translateY(-50%)",
                      fontSize: "10px",
                      color: "#666",
                      fontWeight: 500,
                      textAlign: "center",
                      minWidth: "40px",
                    }}
                  >
                    {date.toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  </Box>
                );
              }

              return labels;
            })()}
          </Box>
        </Box>

        {/* Gantt Content */}
        <Box
          sx={{
            flex: 1,
            overflow: scrollable ? "auto" : "hidden",
            position: "relative",
            background: `
              linear-gradient(to right, 
                transparent 0%, 
                transparent 49%, 
                #f0f0f0 49%, 
                #f0f0f0 51%, 
                transparent 51%
              )
            `,
            backgroundSize: "20px 100%",
            minHeight: 0, // Important for flex child to shrink
          }}
        >
          {/* Task Rows */}
          {ganttData.map((task, index) => {
            // Find original task data
            const originalTask = (filteredData || data).find(
              t => t._id === task.id
            );
            const isExpanded = expandable && expandedTasks.has(task.id);
            const hasChildren =
              originalTask?.children && originalTask.children.length > 0;

            return (
              <Box
                key={task.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  minHeight: 60,
                  borderBottom: "1px solid #f0f0f0",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  },
                  cursor: interactive ? "pointer" : "default",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
                onClick={() => {
                  handleTaskClick(task.id);
                  handleDataPointSelection(task.id, index);
                }}
              >
                {/* Task Name Column */}
                <Box
                  sx={{
                    width: labelColumnWidth || 300,
                    minWidth: labelColumnWidth || 300,
                    maxWidth: labelColumnWidth || 300,
                    px: 2,
                    py: 1.5,
                    borderRight: "1px solid #e0e0e0",
                    backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    minHeight: 60,
                  }}
                >
                  {/* Expand/Collapse Button */}
                  {expandable && hasChildren && (
                    <Box
                      sx={{
                        mr: 1,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        backgroundColor: isExpanded ? "#1976d2" : "#e0e0e0",
                        color: isExpanded ? "white" : "#666",
                        fontSize: "12px",
                        fontWeight: "bold",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          backgroundColor: isExpanded ? "#1565c0" : "#1976d2",
                          color: "white",
                        },
                      }}
                      onClick={e => {
                        e.stopPropagation();
                        if (onToggleExpand) {
                          onToggleExpand(task.id);
                        }
                      }}
                    >
                      {isExpanded ? "−" : "+"}
                    </Box>
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flex: 1,
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: task.isOverdue ? 600 : 500,
                        color: task.isOverdue ? "#ff6f00" : "#333",
                        wordBreak: wrapTaskNames ? "break-word" : "normal",
                        whiteSpace: wrapTaskNames ? "normal" : "nowrap",
                        overflow: wrapTaskNames ? "visible" : "hidden",
                        textOverflow: wrapTaskNames ? "unset" : "ellipsis",
                        lineHeight: 1.4,
                        fontSize: "13px",
                        flex: 1,
                      }}
                    >
                      {task.name}
                    </Typography>
                    {task.isOverdue && (
                      <Chip
                        label="Quá hạn"
                        size="small"
                        sx={{
                          backgroundColor: "#ff6f00",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "9px",
                          height: 18,
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Timeline Column */}
                <Box
                  sx={{
                    flex: 1,
                    position: "relative",
                    height: 60,
                    display: "flex",
                    alignItems: "center",
                    px: 2,
                    backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafafa",
                  }}
                >
                  {/* Timeline Bar Container */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {/* Task Duration Bar with Tooltip */}
                    <Tooltip
                      title={
                        originalTask
                          ? createTooltipContent(task, originalTask)
                          : ""
                      }
                      placement="top"
                      arrow
                      componentsProps={{
                        tooltip: {
                          sx: {
                            backgroundColor: "white",
                            color: "text.primary",
                            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                            border: "1px solid #e0e0e0",
                            borderRadius: 2,
                            maxWidth: 350,
                          },
                        },
                        arrow: {
                          sx: {
                            color: "white",
                            "&::before": {
                              border: "1px solid #e0e0e0",
                            },
                          },
                        },
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          left: `${getTimelinePosition(task.start)}%`,
                          width: `${
                            getTimelinePosition(task.end) -
                            getTimelinePosition(task.start)
                          }%`,
                          height: 30,
                          backgroundColor: task.color,
                          borderRadius: 1,
                          top: "50%",
                          transform: "translateY(-50%)",
                          boxShadow: task.isOverdue
                            ? "0 2px 8px rgba(255, 111, 0, 0.4)"
                            : "0 2px 4px rgba(0,0,0,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minWidth: "2%",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          border: task.isOverdue ? "2px solid #ff6f00" : "none",
                          "&:hover": {
                            transform: "translateY(-50%) scale(1.02)",
                            boxShadow: task.isOverdue
                              ? "0 4px 16px rgba(255, 111, 0, 0.6)"
                              : "0 4px 12px rgba(0,0,0,0.2)",
                          },
                          ...(task.isOverdue && {
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: -8,
                              right: -8,
                              fontSize: "12px",
                              zIndex: 1,
                            },
                          }),
                        }}
                      ></Box>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default TimelineChartGantt;
