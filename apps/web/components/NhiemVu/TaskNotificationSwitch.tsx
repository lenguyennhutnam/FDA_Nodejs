import { useEffect, useState } from "react";
import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import { useNotifier } from "../../provider/NotificationProvider";
import { NhiemVuService } from "../../utils/apis/quan-ly-nhiem-vu/nhiem-vu";

interface TaskNotificationSwitchProps {
  taskId: string;
  className?: string;
}

/**
 * Component hiển thị switch để bật/tắt thông báo cho nhiệm vụ
 * - Dạng switch với text giải thích ở dưới
 * - Mặc định là tắt thông báo
 */
const TaskNotificationSwitch: React.FC<TaskNotificationSwitchProps> = ({
  taskId,
  className = "",
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false); // Mặc định là tắt
  const [loading, setLoading] = useState<boolean>(false);
  const { success, error } = useNotifier();

  // Lấy trạng thái hiện tại khi component mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        // Validate taskId trước khi gọi API
        if (!taskId || taskId.trim() === '') {
          console.warn('TaskId không hợp lệ:', taskId);
          return;
        }

        const data = await NhiemVuService.getNotificationFollowStatus(taskId);
        // API trả về: { bat_thong_bao: boolean }
        if (data) {
          setIsEnabled(data.bat_thong_bao ?? false); // Mặc định là false (tắt)
        } else {
          setIsEnabled(false); // Nếu không có data, mặc định là tắt
        }
      } catch (error) {
        console.error("Lỗi khi lấy trạng thái theo dõi thông báo:", error);
      }
    };

    if (taskId) {
      fetchStatus();
    }
  }, [taskId]);

  // Xử lý thay đổi switch
  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const newStatus = event.target.checked;

    // Validate taskId trước khi gọi API
    if (!taskId || taskId.trim() === '') {
      error('ID nhiệm vụ không hợp lệ');
      return;
    }

    setLoading(true);
    try {
      await NhiemVuService.toggleNotificationFollow({
        nhiem_vu_id: taskId,
        bat_thong_bao: newStatus,
      });

      setIsEnabled(newStatus);

      success(
        newStatus
          ? "Đã bật thông báo cho nhiệm vụ này"
          : "Đã tắt thông báo cho nhiệm vụ này"
      );
    } catch (err: any) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      error(
        err?.message || "Thay đổi trạng thái nhận thông báo không thành công"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className={className} sx={{ mt: 2 }}>
      <FormControlLabel
        control={
          <Switch
            checked={isEnabled}
            onChange={handleChange}
            disabled={loading}
            color="primary"
          />
        }
        label={
          <Box>
            <Typography
              variant="body2"
              sx={{ 
                fontWeight: "medium",
                color: "text.primary"
              }}
            >
              Nhận thông báo khi có thay đổi
            </Typography>
            <Typography
              variant="caption"
              sx={{ 
                color: "text.secondary", 
                fontSize: "0.75rem",
                display: "block",
                mt: 0.5
              }}
            >
              {isEnabled 
                ? "Đồng chí sẽ nhận thông báo khi nhiệm vụ này có cập nhật, bình luận mới hoặc thay đổi trạng thái"
                : "Đồng chí sẽ không nhận thông báo về nhiệm vụ này"
              }
            </Typography>
          </Box>
        }
        sx={{
          alignItems: "flex-start",
          "& .MuiFormControlLabel-label": {
            width: "100%",
            ml: 1,
          },
        }}
      />
    </Box>
  );
};

export default TaskNotificationSwitch;
