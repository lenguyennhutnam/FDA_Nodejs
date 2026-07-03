import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Stack,
} from "@mui/material";
import {
  Close,
  PriorityHigh,
  Schedule,
  Notifications,
  CheckCircle,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import React from "react";

interface NotificationDetailModalProps {
  open: boolean;
  onClose: () => void;
  notification: {
    id: string;
    tieuDe?: string;
    noiDung?: string;
    doUuTien?: string;
    title?: string;
    content?: string;
    message?: string;
    priority?: string;
    createdAt?: string;
    created_date?: string;
    isRead?: boolean;
    trang_thai?: string;
    thong_bao?: {
      tieu_de?: string;
      noi_dung?: string;
      do_uu_tien?: string;
    };
  } | null;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  open,
  onClose,
  notification,
}) => {
  if (!notification) return null;

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case "cao":
      case "high":
        return "error";
      case "trung bình":
      case "medium":
        return "warning";
      case "thấp":
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityIcon = (priority?: string) => {
    if (
      priority?.toLowerCase().includes("cao") ||
      priority?.toLowerCase().includes("high")
    ) {
      return <PriorityHigh sx={{fontSize: "16px"}} />;
    }
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          maxHeight: "90vh",
          width: {xs: "95vw", sm: "600px", md: "700px"},
          maxWidth: "95vw",
          background: "#ffffff",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.15)",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 32px 20px",
          background: "linear-gradient(135deg, #1976d2 0%, #1565C0 100%)",
          color: "white",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #42a5f5 0%, #1976d2 50%, #1565C0 100%)",
          },
        }}
      >
        <Box sx={{display: "flex", alignItems: "center", gap: "12px"}}>
          <Box
            sx={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Notifications sx={{fontSize: "20px", color: "white"}} />
          </Box>
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "Be Vietnam Pro",
                fontWeight: 700,
                fontSize: "20px",
                color: "white",
                lineHeight: 1.2,
              }}
            >
              Chi tiết thông báo
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "Be Vietnam Pro",
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.8)",
                fontWeight: 400,
              }}
            >
              Thông tin chi tiết về thông báo
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.2)",
            },
            transition: "all 0.2s ease",
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{padding: "32px", background: "#fafafa"}}>
        <Stack spacing={3}>
          {/* Tiêu đề thông báo */}
          <Card
            sx={{
              background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
              border: "1px solid #e3f2fd",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.08)",
            }}
          >
            <CardContent sx={{padding: "24px"}}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Be Vietnam Pro",
                  fontWeight: 700,
                  fontSize: "18px",
                  color: "#1976d2",
                  marginBottom: "12px",
                  lineHeight: 1.4,
                }}
              >
                {notification?.thong_bao?.tieu_de ||
                  notification.tieuDe ||
                  notification.title ||
                  "Không có tiêu đề"}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Be Vietnam Pro",
                  fontSize: "16px",
                  lineHeight: 1.6,
                  color: "text.primary",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                }}
              >
                {notification?.thong_bao?.noi_dung ||
                  notification.noiDung ||
                  notification.content ||
                  notification.message ||
                  "Không có nội dung"}
              </Typography>
            </CardContent>
          </Card>

          {/* Thông tin meta */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"},
              gap: "16px",
            }}
          >
            {/* Độ ưu tiên */}
            <Card
              sx={{
                background: "#ffffff",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <CardContent sx={{padding: "20px"}}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "Be Vietnam Pro",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "text.secondary",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Độ ưu tiên
                </Typography>
                <Chip
                  label={
                    notification?.thong_bao?.do_uu_tien ||
                    notification.doUuTien ||
                    notification.priority ||
                    "Không xác định"
                  }
                  color={getPriorityColor(
                    notification?.thong_bao?.do_uu_tien ||
                      notification.doUuTien ||
                      notification.priority
                  )}
                  icon={getPriorityIcon(
                    notification?.thong_bao?.do_uu_tien ||
                      notification.doUuTien ||
                      notification.priority
                  )}
                  sx={{
                    fontFamily: "Be Vietnam Pro",
                    fontWeight: 600,
                    fontSize: "14px",
                    height: "32px",
                  }}
                />
              </CardContent>
            </Card>

            {/* Trạng thái đọc */}
            <Card
              sx={{
                background: "#ffffff",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <CardContent sx={{padding: "20px"}}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "Be Vietnam Pro",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "text.secondary",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  Trạng thái
                </Typography>
                <Box sx={{display: "flex", alignItems: "center", gap: "8px"}}>
                  {notification.trang_thai === "da_doc" ||
                  notification.isRead ? (
                    <CheckCircle sx={{fontSize: "20px", color: "#4caf50"}} />
                  ) : (
                    <RadioButtonUnchecked
                      sx={{fontSize: "20px", color: "#ff9800"}}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Be Vietnam Pro",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "text.primary",
                    }}
                  >
                    {notification.trang_thai === "da_doc" || notification.isRead
                      ? "Đã đọc"
                      : "Chưa đọc"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Thời gian tạo */}
          {(notification.created_date || notification.createdAt) && (
            <Card
              sx={{
                background: "#ffffff",
                border: "1px solid #e0e0e0",
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              }}
            >
              <CardContent sx={{padding: "20px"}}>
                <Box sx={{display: "flex", alignItems: "center", gap: "12px"}}>
                  <Box
                    sx={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background:
                        "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Schedule sx={{fontSize: "20px", color: "#1976d2"}} />
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontFamily: "Be Vietnam Pro",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "text.secondary",
                        marginBottom: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Thời gian tạo
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: "Be Vietnam Pro",
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "text.primary",
                      }}
                    >
                      {new Date(
                        notification.created_date || notification.createdAt
                      ).toLocaleString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          padding: "24px 32px 32px",
          background: "#ffffff",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Button
          onClick={onClose}
          variant="contained"
          size="large"
          sx={{
            fontFamily: "Be Vietnam Pro",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: "12px",
            padding: "12px 32px",
            fontSize: "16px",
            background: "linear-gradient(135deg, #1976d2 0%, #1565C0 100%)",
            boxShadow: "0 4px 16px rgba(25, 118, 210, 0.25)",
            "&:hover": {
              background: "linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)",
              boxShadow: "0 6px 20px rgba(25, 118, 210, 0.35)",
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationDetailModal;
