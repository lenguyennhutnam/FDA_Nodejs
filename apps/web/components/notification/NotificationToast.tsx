import {
  Box,
  Typography,
  IconButton,
  Slide,
  Paper,
  Chip,
  Fade,
} from "@mui/material";
import { Notifications, Close, VolumeUp, VolumeOff } from "@mui/icons-material";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RouterLink } from "../../routers/routers";

interface NotificationToastProps {
  notification: {
    id?: string;
    thong_bao_id?: string;
    tieu_de?: string;
    noi_dung?: string;
    do_uu_tien?: string;
    created_date?: string;
    trang_thai?: string;
    thong_bao?: {
      tieu_de?: string;
      noi_dung?: string;
      do_uu_tien?: string;
      loai_thong_bao?: string;
      duong_dan?: string;
    };
  } | null;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onOpenMenu: () => void;
  autoHideDuration?: number;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onMarkAsRead,
  onOpenMenu,
  autoHideDuration = 3000,
}) => {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Effect for handling notification changes
  useEffect(() => {
    if (notification) {
      setShow(true);

      // Play notification sound
      if (soundEnabled && !isPlaying) {
        playNotificationSound();
      }
    } else {
      // If notification is null, hide immediately
      setShow(false);
    }
  }, [notification, soundEnabled, isPlaying]);

  // Effect for auto-hide timer
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      setTimerActive(false);
    }

    if (notification && show) {
      setTimerActive(true);

      // Auto hide after duration
      timerRef.current = setTimeout(() => {
        setShow(false);
        setTimerActive(false);
        // Wait for slide animation to complete before calling onClose
        setTimeout(() => {
          onClose();
        }, 300);
      }, autoHideDuration);
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        setTimerActive(false);
      }
    };
  }, [notification, show, autoHideDuration, onClose]);

  const playNotificationSound = React.useCallback(() => {
    try {
      setIsPlaying(true);
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Always use Telegram sound
      playTelegramSound(audioContext);
    } catch (error) {
      console.log("Could not play notification sound:", error);
      setIsPlaying(false);
    }
  }, []);

  const playTelegramSound = (audioContext: AudioContext) => {
    // Telegram-like notification sound
    const oscillator1 = audioContext.createOscillator();
    const oscillator2 = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Telegram characteristic sound: G4 and B4
    oscillator1.frequency.setValueAtTime(392, audioContext.currentTime); // G4
    oscillator2.frequency.setValueAtTime(
      493.88,
      audioContext.currentTime + 0.1
    ); // B4

    oscillator1.type = "sine";
    oscillator2.type = "sine";

    oscillator1.start(audioContext.currentTime);
    oscillator2.start(audioContext.currentTime + 0.1);

    oscillator1.stop(audioContext.currentTime + 0.5);
    oscillator2.stop(audioContext.currentTime + 0.5);

    // Telegram volume envelope
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);

    setTimeout(() => setIsPlaying(false), 600);
  };

  const handleToastClick = () => {
    console.log("Toast clicked!", notification);

    // Mark as read
    if (notification?.thong_bao_id || notification?.id) {
      const notifId = notification.thong_bao_id || notification.id;
      if (notifId) {
        console.log("Marking as read:", notifId);
        onMarkAsRead(notifId);
      }
    }

    // Navigate to the link if available
    console.log("Checking duong_dan:", notification?.thong_bao?.duong_dan);
    if (notification?.thong_bao?.duong_dan) {
      let targetPath = notification.thong_bao.duong_dan;

      // If it's a work calendar notification, redirect to view page
      if (notification?.thong_bao?.loai_thong_bao === "lich_cong_tac") {
        console.log("Work calendar notification, redirecting to view page");
        targetPath = RouterLink.HOME;
      }

      console.log("Navigating to:", targetPath);

      // Clear timer and close toast
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        setTimerActive(false);
      }
      setShow(false);
      setTimeout(() => {
        onClose();
        navigate(targetPath);
      }, 300);
    } else {
      console.log("No duong_dan found, notification structure:", {
        has_thong_bao: !!notification?.thong_bao,
        thong_bao_keys: notification?.thong_bao
          ? Object.keys(notification.thong_bao)
          : "no thong_bao",
      });
    }
  };

  if (!notification || !show) return null;

  return (
    <Slide direction="up" in={show} timeout={300}>
      <Paper
        elevation={8}
        onClick={handleToastClick}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: { xs: "90vw", sm: "380px" },
          maxWidth: "380px",
          zIndex: 9999,
          background: "linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)",
          border: "1px solid rgba(25, 118, 210, 0.2)",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
          animation: "slideInUp 0.3s ease-out",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
          },
          "@keyframes slideInUp": {
            "0%": {
              transform: "translateY(100%)",
              opacity: 0,
            },
            "100%": {
              transform: "translateY(0)",
              opacity: 1,
            },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1976d2 0%, #1565C0 100%)",
            color: "white",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Notifications sx={{ fontSize: "20px" }} />
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: "Be Vietnam Pro",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              Thông báo mới
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSoundEnabled(!soundEnabled);
              }}
              sx={{
                color: "white",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              {soundEnabled ? (
                <VolumeUp sx={{ fontSize: "16px" }} />
              ) : (
                <VolumeOff sx={{ fontSize: "16px" }} />
              )}
            </IconButton>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                // Clear timer
                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                  timerRef.current = null;
                  setTimerActive(false);
                }
                setShow(false);
                setTimeout(onClose, 300);
              }}
              sx={{
                color: "white",
                padding: "4px",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              <Close sx={{ fontSize: "16px" }} />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box
          sx={{ padding: "16px" }}
          onClick={(e) => {
            // Only handle click if clicking on the content area, not on buttons
            const target = e.target as HTMLElement;
            if (!target.closest("button")) {
              handleToastClick();
            }
          }}
        >
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              fontFamily: "Be Vietnam Pro",
              fontWeight: 600,
              fontSize: "16px",
              color: "#1976d2",
              marginBottom: "8px",
              lineHeight: 1.3,
              cursor: "pointer",
            }}
          >
            {notification?.thong_bao?.tieu_de ||
              notification.tieu_de ||
              "Thông báo"}
          </Typography>

          {/* Content */}
          <Typography
            variant="body2"
            sx={{
              fontFamily: "Be Vietnam Pro",
              color: "#424242",
              fontSize: "14px",
              lineHeight: 1.5,
              marginBottom: "12px",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              cursor: "pointer",
            }}
          >
            {notification?.thong_bao?.noi_dung || "Nội dung thông báo"}
          </Typography>

          {/* Priority and Time */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              marginBottom: "12px",
            }}
          >
            {notification.created_date && (
              <Typography
                variant="caption"
                sx={{
                  fontFamily: "Be Vietnam Pro",
                  color: "#757575",
                  fontSize: "11px",
                }}
              >
                {new Date(notification.created_date).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Box
            sx={{
              display: "flex",
              gap: "8px",
              justifyContent: "flex-end",
            }}
          >
            <Typography
              variant="caption"
              onClick={(e) => {
                e.stopPropagation();
                // Clear timer
                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                  timerRef.current = null;
                  setTimerActive(false);
                }
                setShow(false);
                setTimeout(onClose, 300);
              }}
              sx={{
                fontFamily: "Be Vietnam Pro",
                color: "#757575",
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: "4px",
                "&:hover": {
                  backgroundColor: "rgba(0, 0, 0, 0.04)",
                },
                fontSize: "12px",
              }}
            >
              Đóng
            </Typography>
          </Box>
        </Box>

        {/* Progress bar */}
        <Box
          sx={{
            height: "3px",
            background: "linear-gradient(90deg, #1976d2 0%, #1565C0 100%)",
            animation: `progressBar ${autoHideDuration}ms linear forwards`,
            "@keyframes progressBar": {
              "0%": { width: "100%" },
              "100%": { width: "0%" },
            },
          }}
        />
      </Paper>
    </Slide>
  );
};

export default NotificationToast;
