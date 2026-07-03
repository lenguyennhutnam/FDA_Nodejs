import {
  NotificationsOutlined,
  Notifications,
  ListAlt,
  Settings,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { RouterLink } from "../../routers/routers";
import {
  AppBar,
  Box,
  Menu,
  MenuItem,
  Toolbar,
  Badge,
  Typography,
} from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { ThongBaoService } from "../../utils/apis";
import NotificationDetailModal from "./NotificationDetailModal";
import NotificationToast from "./NotificationToast";
import { useAppSelector } from "../../hooks";

interface NotificationIconProps {
  sx?: any;
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ sx }) => {
  const navigate = useNavigate();
  const themeColors = useAppSelector(state => state.theme.colors);
  const [notificationAnchorEl, setNotificationAnchorEl] =
    useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<any>(null);
  const [previousUnreadCount, setPreviousUnreadCount] = useState<number>(0);
  const [isLoadingForToast, setIsLoadingForToast] = useState<boolean>(false);
  const notificationAnchorRef = useRef<null | HTMLElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const menuScrollRef = useRef<HTMLDivElement>(null);

  // Load notifications and unread count on mount
  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  // Scroll detection for infinite loading
  useEffect(() => {
    const menuElement = menuScrollRef.current;
    if (!menuElement) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = menuElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

      if (isNearBottom && hasMore && !loadingMore) {
        loadMoreNotifications();
      }
    };

    // Add scroll listener with a small delay to ensure element is ready
    const timeoutId = setTimeout(() => {
      menuElement.addEventListener("scroll", handleScroll);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      menuElement.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loadingMore, currentPage, totalPages]);

  // Alternative scroll detection using intersection observer
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const menuElement = menuScrollRef.current;
    if (!menuElement) return;

    // Create a sentinel element at the bottom
    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    sentinel.style.width = "100%";
    sentinel.id = "scroll-sentinel";

    // Add sentinel to the bottom of the scroll container
    menuElement.appendChild(sentinel);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !loadingMore) {
            loadMoreNotifications();
          }
        });
      },
      {
        root: menuElement,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      const existingSentinel = document.getElementById("scroll-sentinel");
      if (existingSentinel) {
        existingSentinel.remove();
      }
    };
  }, [hasMore, loadingMore, notifications.length]);

  // Set up automatic refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const oldUnreadCount = unreadCount;
      await loadUnreadCount(true);

      // If menu is open, always reload the list to show any new notifications
      if (isMenuOpen) {
        setCurrentPage(1);
        setHasMore(true);
        setTotalPages(0);
        loadNotifications(1, false);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [unreadCount, isMenuOpen]);

  // Simple detection for new notifications
  useEffect(() => {
    // Show toast when unread count increases
    if (unreadCount > previousUnreadCount) {
      // Set flag to indicate we're loading for toast
      setIsLoadingForToast(true);

      // Always load fresh notifications first
      setCurrentPage(1);
      setHasMore(true);
      setTotalPages(0);

      // Force refresh by clearing notifications first, then load new ones
      setNotifications([]);

      // Load notifications and wait for completion
      loadNotifications(1, false, true) // Force refresh
        .then(() => {
          // Fresh notifications loaded
        })
        .catch((error) => {
          setIsLoadingForToast(false);
        });
    }

    // Update previous unread count
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount]);

  // Show toast when notifications are loaded and we have unread notifications
  useEffect(() => {
    // Only show toast if we're loading for toast, have notifications, no current toast, and unread count > 0
    if (
      isLoadingForToast &&
      notifications.length > 0 &&
      !toastNotification &&
      unreadCount > 0
    ) {
      // Add a small delay to ensure notifications state is fully updated
      const timer = setTimeout(() => {
        const unreadNotifications = notifications.filter(
          (notif) => notif.trang_thai !== "da_doc"
        );

        if (unreadNotifications.length > 0) {
          const newestNotification = unreadNotifications[0];
          setToastNotification(newestNotification);
        }

        // Reset the flag
        setIsLoadingForToast(false);
      }, 100); // Small delay to ensure state is updated

      return () => clearTimeout(timer);
    }
  }, [isLoadingForToast, notifications, toastNotification, unreadCount]);

  const loadNotifications = async (
    page = 1,
    append = false,
    forceRefresh = false
  ) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Add timestamp to force refresh if needed
      const keyword = forceRefresh ? `?t=${Date.now()}` : "";
      const data = await ThongBaoService.getListNotification(page, 10, keyword);

      if (data) {
        const newNotifications = data.items || [];
        const total = data.total || 0;
        const limit = data.limit || 10;
        const currentPageFromAPI = data.page || page;
        const totalPages = Math.ceil(total / limit);

        setTotalPages(totalPages);
        setHasMore(currentPageFromAPI < totalPages);

        // Update currentPage to match API response
        setCurrentPage(currentPageFromAPI);

        if (append) {
          setNotifications((prev) => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }
      }
    } catch (error) {
    } finally {
      if (append) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadMoreNotifications = async () => {
    if (loadingMore || !hasMore) {
      return;
    }

    const nextPage = currentPage + 1;
    await loadNotifications(nextPage, true);
  };

  const loadUnreadCount = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      }
      const data = await ThongBaoService.countUnreadNotification();
      const newCount = data?.data?.so_luong_chua_doc || 0;
      setUnreadCount(newCount);
    } catch (error) {
      // Error loading unread count
    } finally {
      if (showRefreshing) {
        setRefreshing(false);
      }
    }
  };

  const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationAnchorEl(event.currentTarget);
    notificationAnchorRef.current = event.currentTarget;
    setIsMenuOpen(true);
    setCurrentPage(1);
    setHasMore(true);
    setTotalPages(0);
    loadNotifications(1, false);
    loadUnreadCount();
  };

  const notificationIconRef = useRef<HTMLDivElement>(null);

  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
    notificationAnchorRef.current = null;
    setIsMenuOpen(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await ThongBaoService.markNotificationAsRead(notificationId);
      loadUnreadCount();
      // Reset pagination and reload from first page
      setCurrentPage(1);
      setHasMore(true);
      setTotalPages(0);
      loadNotifications(1, false);
    } catch (error) {
      // Error marking notification as read
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await ThongBaoService.markAllNotificationAsRead("");
      setUnreadCount(0);
      // Reset pagination and reload from first page
      setCurrentPage(1);
      setHasMore(true);
      setTotalPages(0);
      loadNotifications(1, false);
    } catch (error) {
      // Error marking all notifications as read
    }
  };

  const handleNotificationDoubleClick = (notification: any) => {
    setSelectedNotification(notification);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedNotification(null);
  };

  const handleToastClose = () => {
    setToastNotification(null);
  };

  const handleToastMarkAsRead = (notificationId: string) => {
    handleMarkAsRead(notificationId);
    setToastNotification(null);
  };

  const handleToastOpenMenu = () => {
    // Open notification menu
    if (notificationIconRef.current) {
      setNotificationAnchorEl(notificationIconRef.current);
      notificationAnchorRef.current = notificationIconRef.current;
      setCurrentPage(1);
      setHasMore(true);
      setTotalPages(0);
      loadNotifications(1, false);
      loadUnreadCount();
    }
    setToastNotification(null);
  };

  return (
    <>
      {/* Notification Icon */}
      <Box
        ref={notificationIconRef}
        onClick={handleNotificationOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          color: themeColors.headerText,
          cursor: "pointer",
          padding: "8px",
          borderRadius: "50%",

          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
          ...(unreadCount > 0 && {
            backgroundColor: "rgba(25, 118, 210, 0.08)",
            "&:hover": {
              backgroundColor: "rgba(25, 118, 210, 0.12)",
            },
          }),
          ...(unreadCount > 0 && {
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": {
                transform: "scale(1)",
              },
              "50%": {
                transform: "scale(1.05)",
              },
              "100%": {
                transform: "scale(1)",
              },
            },
          }),
          ...sx,
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <Notifications
              sx={{
                fontSize: "24px",
                color: themeColors.headerText,
                opacity: refreshing ? 0.7 : 1,
                transition: "opacity 0.3s ease",
              }}
            />
          ) : (
            <NotificationsOutlined
              sx={{
                fontSize: "24px",
                color: themeColors.headerText,
                opacity: refreshing ? 0.7 : 1,
                transition: "opacity 0.3s ease",
              }}
            />
          )}
        </Badge>
      </Box>

      {/* Notification Menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={Boolean(notificationAnchorEl)}
        onClose={handleNotificationClose}
        PaperProps={{
          sx: {
            width: { xs: "90vw", sm: "400px", md: "500px" },
            maxWidth: "90vw",
            maxHeight: "500px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ padding: "12px 12px", borderBottom: "1px solid #E0E0E0" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: "Be Vietnam Pro",
                fontWeight: 600,
                fontSize: "18px",
              }}
            >
              Thông báo
            </Typography>
            <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#1976d2",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => {
                  navigate(RouterLink.CAI_DAT_THONG_BAO);
                  handleNotificationClose(); // Close the menu
                }}
              >
                <Settings sx={{ fontSize: "16px" }} />
                Cài đặt
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#1976d2",
                  cursor: "pointer",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => {
                  navigate(RouterLink.CAI_DAT_THONG_BAO);
                  handleNotificationClose(); // Close the menu
                }}
              >
                <ListAlt sx={{ fontSize: "16px" }} />
                Xem tất cả
              </Typography>
              {unreadCount > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#1976d2",
                    cursor: "pointer",
                    fontSize: "14px",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  onClick={handleMarkAllAsRead}
                >
                  Đánh dấu tất cả đã đọc
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          ref={menuScrollRef}
          onScroll={(e) => {
            const element = e.currentTarget;
            const { scrollTop, scrollHeight, clientHeight } = element;
            const isNearBottom = scrollTop + clientHeight >= scrollHeight - 10;
          }}
          sx={{
            flex: 1,
            overflow: "auto",
            maxHeight: "calc(500px - 60px)", // Subtract header height
            minHeight: "200px",
          }}
        >
          {notifications.length === 0 ? (
            <Box sx={{ padding: "40px 20px", textAlign: "center" }}>
              <Typography
                color="text.secondary"
                sx={{ fontFamily: "Be Vietnam Pro", fontSize: "14px" }}
              >
                Không có thông báo nào
              </Typography>
            </Box>
          ) : (
            notifications.map((notification, index) => (
              <MenuItem
                key={notification.thong_bao_id || index}
                onClick={() => {
                  handleMarkAsRead(notification.thong_bao_id);
                  // Navigate to the link if available
                  if (notification?.thong_bao?.duong_dan) {
                    handleNotificationClose();
                    let targetPath = notification.thong_bao.duong_dan;
                    
                    // If it's a work calendar notification, redirect to view page instead of manage page
                    if (notification?.thong_bao?.loai_thong_bao === 'lich_cong_tac') {
                      targetPath = RouterLink.HOME;
                    }
                    
                    navigate(targetPath);
                  }
                }}
                sx={{
                  padding: "16px 20px",
                  borderBottom:
                    index < notifications.length - 1
                      ? "1px solid #F0F0F0"
                      : "none",
                  backgroundColor:
                    notification.trang_thai == "da_doc"
                      ? "linear-gradient(135deg, #F5F5F5 0%, #EEEEEE 100%)"
                      : "linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)",
                  borderLeft:
                    notification.trang_thai == "da_doc"
                      ? "3px solid #E0E0E0"
                      : "3px solid #1976d2",
                  "&:hover": {
                    backgroundColor:
                      notification.trang_thai == "da_doc"
                        ? "linear-gradient(135deg, #E8E8E8 0%, #E0E0E0 100%)"
                        : "linear-gradient(135deg, #BBDEFB 0%, #E1BEE7 100%)",
                    transition: "all 0.2s ease",
                  },
                  minHeight: "auto",
                  whiteSpace: "normal",
                  alignItems: "flex-start",
                  cursor: "pointer",
                  userSelect: "none",
                  overflow: "hidden",
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  "&:active": {
                    backgroundColor:
                      notification.trang_thai == "da_doc"
                        ? "rgba(158, 158, 158, 0.15)"
                        : "rgba(25, 118, 210, 0.15)",
                  },
                }}
              >
                <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Be Vietnam Pro",
                      fontWeight: 700,
                      color:
                        notification.trang_thai == "da_doc"
                          ? "#000000"
                          : "#1565C0",
                      marginBottom: "6px",
                      fontSize: "15px",
                      lineHeight: 1.3,
                      textShadow:
                        notification.trang_thai == "da_doc"
                          ? "none"
                          : "0 1px 2px rgba(25, 118, 210, 0.1)",
                    }}
                  >
                    {" "}
                    {notification?.thong_bao?.tieu_de || "Thông báo"}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Be Vietnam Pro",
                      color:
                        notification.trang_thai == "da_doc"
                          ? "#616161"
                          : "#424242",
                      display: "block",
                      lineHeight: 1.5,
                      fontSize: "14px",
                      marginBottom: "8px",
                      wordBreak: "break-word",
                      overflowWrap: "break-word",
                      hyphens: "auto",
                      fontWeight:
                        notification.trang_thai == "da_doc" ? 400 : 500,
                    }}
                  >
                    {notification?.thong_bao?.noi_dung || "Nội dung thông báo"}
                  </Typography>
                  {notification.created_date && (
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: "Be Vietnam Pro",
                        color:
                          notification.trang_thai == "da_doc"
                            ? "#616161"
                            : "#1976d2",
                        fontSize: "12px",
                        fontWeight:
                          notification.trang_thai == "da_doc" ? 500 : 600,
                        backgroundColor:
                          notification.trang_thai == "da_doc"
                            ? "rgba(97, 97, 97, 0.12)"
                            : "rgba(25, 118, 210, 0.12)",
                        padding: "2px 6px",
                        borderRadius: "14px",
                        display: "inline-block",
                        width: "fit-content",
                        border:
                          notification.trang_thai == "da_doc"
                            ? "1px solid rgba(97, 97, 97, 0.2)"
                            : "1px solid rgba(25, 118, 210, 0.2)",
                        boxShadow:
                          notification.trang_thai == "da_doc"
                            ? "0 1px 3px rgba(97, 97, 97, 0.1)"
                            : "0 1px 3px rgba(25, 118, 210, 0.1)",
                      }}
                    >
                      {new Date(notification.created_date).toLocaleString(
                        "vi-VN"
                      )}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            ))
          )}

          {/* Loading indicator for infinite scroll - Sticky */}
          {loadingMore && (
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px 20px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#ffffff",
                borderTop: "1px solid #e0e0e0",
                boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #e0e0e0",
                  borderTop: "2px solid #1976d2",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
              <Typography
                color="text.secondary"
                sx={{
                  fontFamily: "Be Vietnam Pro",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Đang tải thêm thông báo...
              </Typography>
            </Box>
          )}

          {/* End of list indicator - Sticky */}
          {!hasMore && notifications.length > 0 && !loadingMore && (
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px 20px",
                textAlign: "center",
                borderTop: "1px solid #e0e0e0",
                backgroundColor: "#f8f9fa",
                boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.05)",
                zIndex: 1,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontFamily: "Be Vietnam Pro",
                  fontSize: "12px",
                  fontWeight: 500,
                }}
              >
                Đã tải hết thông báo
              </Typography>
            </Box>
          )}
        </Box>
      </Menu>

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        open={modalOpen}
        onClose={handleModalClose}
        notification={selectedNotification}
      />

      {/* Notification Toast */}
      <NotificationToast
        notification={toastNotification}
        onClose={handleToastClose}
        onMarkAsRead={handleToastMarkAsRead}
        onOpenMenu={handleToastOpenMenu}
        autoHideDuration={3000}
      />
    </>
  );
};

export default NotificationIcon;
