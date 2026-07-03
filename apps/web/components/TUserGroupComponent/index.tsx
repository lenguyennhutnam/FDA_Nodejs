import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import {useEffect, useState} from "react";
import {APIServices} from "../../utils";
import {UserGroupData} from "../../utils/apis/hanh-chinh/user-group";

// ===== INTERFACES =====
interface TUserGroupComponentProps {
  value: string[];
  onChange: (value: string[], userGroupData?: UserGroupData) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  mode?: "selector" | "info" | "assignment"; // Các chế độ khác nhau
}

interface UserGroupSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

interface UserGroupInfoProps {
  onSelectGroup: (userIds: string[], userGroupData?: UserGroupData) => void;
}

interface UserAssignmentSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
}

// ===== USER GROUP SELECTOR =====
const UserGroupSelector = ({
  value = [],
  onChange,
  label = "Chọn nhóm người dùng",
  placeholder = "Chọn nhóm...",
  error = false,
  helperText,
  disabled = false,
  required = false,
}: UserGroupSelectorProps) => {
  const [userGroups, setUserGroups] = useState<UserGroupData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Load user groups
  const loadUserGroups = async (textSearch: string = "") => {
    try {
      setLoading(true);
      const response = await APIServices.UserGroupService.getListEntity(
        1,
        50,
        textSearch
      );
      setUserGroups(response?.items || []);
    } catch (error) {
      console.error("Error loading user groups:", error);
      setUserGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserGroups();
  }, []);

  // Handle search
  const handleSearchChange = (event: any, newValue: string) => {
    setSearchText(newValue);
    loadUserGroups(newValue);
  };

  // Handle selection change
  const handleChange = (event: any, newValue: UserGroupData[]) => {
    // Extract user IDs from selected groups
    const userIds = newValue.flatMap(
      group => group.thanh_vien?.map(member => member._id) || []
    );
    onChange(userIds);
  };

  // Get selected groups based on current value (user IDs)
  const getSelectedGroups = () => {
    return userGroups.filter(group =>
      group.thanh_vien?.some(member => value.includes(member._id))
    );
  };

  // Format group display
  const formatGroupLabel = (group: UserGroupData) => {
    const memberCount = group.thanh_vien?.length || 0;
    return `${group.ten_nhom} (${memberCount} thành viên)`;
  };

  return (
    <Box>
      <Autocomplete
        multiple
        options={userGroups}
        value={getSelectedGroups()}
        onChange={handleChange}
        onInputChange={handleSearchChange}
        getOptionLabel={formatGroupLabel}
        loading={loading}
        disabled={disabled}
        filterOptions={options => options} // Disable default filtering since we handle it server-side
        renderInput={params => (
          <FormControl
            fullWidth
            error={error}
            disabled={disabled}
            required={required}
          >
            <FormLabel component="legend" sx={{mb: 1}}>
              {label}
            </FormLabel>
            <input
              {...params.InputProps}
              placeholder={placeholder}
              style={{
                width: "100%",
                padding: "12px",
                border: error ? "1px solid #d32f2f" : "1px solid #c4c4c4",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            />
            {helperText && (
              <Typography
                variant="caption"
                color={error ? "error" : "text.secondary"}
                sx={{mt: 1}}
              >
                {helperText}
              </Typography>
            )}
          </FormControl>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              {...getTagProps({index})}
              key={option._id}
              label={formatGroupLabel(option)}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))
        }
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {option.ten_nhom}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.thanh_vien?.length || 0} thành viên
              </Typography>
            </Box>
          </Box>
        )}
      />

      {/* Show selected users info */}
      {value.length > 0 && (
        <Box sx={{mt: 1}}>
          <Typography variant="caption" color="text.secondary">
            Đã chọn {value.length} người dùng từ {getSelectedGroups().length}{" "}
            nhóm
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// ===== TOOLTIP COMPONENT =====
const GroupMembersTooltip = ({group}: {group: UserGroupData}) => {
  const members = group.thanh_vien || [];

  if (members.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        Nhóm này chưa có thành viên nào
      </Typography>
    );
  }

  // Chỉ hiển thị 5 người đầu tiên
  const displayMembers = members.slice(0, 5);
  const remainingCount = members.length - 5;

  return (
    <Box sx={{maxWidth: 300}}>
      <Typography variant="subtitle2" sx={{mb: 1, fontWeight: "medium"}}>
        Thành viên trong nhóm "{group.ten_nhom}":
      </Typography>
      <Box>
        {displayMembers.map((member, index) => (
          <Box
            key={member._id}
            sx={{
              display: "flex",
              alignItems: "center",
              py: 0.5,
              borderBottom:
                index < displayMembers.length - 1 || remainingCount > 0
                  ? "1px solid #f0f0f0"
                  : "none",
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "#1976d2",
                mr: 1,
                flexShrink: 0,
              }}
            />
            <Typography variant="body2" sx={{fontSize: "0.875rem"}}>
              {member.full_name || member.username || "Không có tên"}
            </Typography>
          </Box>
        ))}

        {/* Hiển thị "và x người khác" nếu còn nhiều hơn 5 người */}
        {remainingCount > 0 && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              py: 0.5,
              px: 1,
              backgroundColor: "#f8f9fa",
              borderRadius: 1,
              mt: 0.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{fontSize: "0.875rem", fontStyle: "italic", color: "#6c757d"}}
            >
              và {remainingCount} người khác...
            </Typography>
          </Box>
        )}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{mt: 1, display: "block"}}
      >
        Tổng cộng: {members.length} thành viên
      </Typography>
    </Box>
  );
};

// ===== USER GROUP INFO =====
const UserGroupInfo = ({onSelectGroup}: UserGroupInfoProps) => {
  const [userGroups, setUserGroups] = useState<UserGroupData[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user groups
  const loadUserGroups = async () => {
    try {
      setLoading(true);
      const response = await APIServices.UserGroupService.getListEntity(
        1,
        50,
        ""
      );
      setUserGroups(response?.items || []);
    } catch (error) {
      console.error("Error loading user groups:", error);
      setUserGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserGroups();
  }, []);

  // Handle group selection
  const handleSelectGroup = (group: UserGroupData) => {
    console.log(group);
    const userIds = group.thanh_vien?.map(member => member._id) || [];
    onSelectGroup(userIds, group); // Truyền thêm group data
  };

  if (loading) {
    return (
      <Box sx={{mt: 2, p: 2, border: "1px solid #e0e0e0", borderRadius: 1}}>
        <Typography variant="body2" color="text.secondary">
          Đang tải danh sách nhóm...
        </Typography>
      </Box>
    );
  }

  if (userGroups.length === 0) {
    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Chưa có nhóm người dùng nào. Bạn có thể tạo nhóm trong menu "Quản lý
          nhóm người dùng".
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        border: "1px solid #e0e0e0",
        borderRadius: 1,
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="subtitle2" sx={{mb: 1, fontWeight: "medium"}}>
        Chọn nhanh từ nhóm có sẵn:
      </Typography>
      <Box sx={{display: "flex", flexWrap: "wrap", gap: 1}}>
        {userGroups.map(group => (
          <Tooltip
            key={group._id}
            title={<GroupMembersTooltip group={group} />}
            placement="top"
            arrow
            enterDelay={500}
            leaveDelay={200}
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: "white",
                  color: "text.primary",
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  "& .MuiTooltip-arrow": {
                    color: "white",
                    "&::before": {
                      border: "1px solid #e0e0e0",
                    },
                  },
                },
              },
            }}
          >
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSelectGroup(group)}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                minWidth: "auto",
                px: 1,
                py: 0.5,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                  borderColor: "#1976d2",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                },
              }}
            >
              {group.ten_nhom}
              <Chip
                label={group.thanh_vien?.length || 0}
                size="small"
                sx={{
                  ml: 1,
                  height: 16,
                  fontSize: "0.65rem",
                  backgroundColor:
                    group.thanh_vien?.length > 0 ? "#e3f2fd" : "#f5f5f5",
                  color: group.thanh_vien?.length > 0 ? "#1976d2" : "#9e9e9e",
                }}
              />
            </Button>
          </Tooltip>
        ))}
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{mt: 1, display: "block"}}
      >
        Di chuột qua tên nhóm để xem danh sách thành viên • Nhấn vào tên nhóm để
        chọn tất cả thành viên trong nhóm đó
      </Typography>
    </Box>
  );
};

// ===== USER ASSIGNMENT SELECTOR =====
const UserAssignmentSelector = ({
  value = [],
  onChange,
  label = "Phân công người dùng",
  error = false,
  helperText,
  disabled = false,
  required = false,
}: UserAssignmentSelectorProps) => {
  const [individualUsers, setIndividualUsers] = useState<string[]>([]);
  const [groupUsers, setGroupUsers] = useState<string[]>([]);

  // Separate individual users from group users
  useEffect(() => {
    // This is a simplified approach - in a real implementation,
    // you might want to track which users came from groups vs individual selection
    // For now, we'll assume all users in value are individual selections
    setIndividualUsers(value);
  }, [value]);

  // Handle individual user selection
  const handleIndividualChange = (newValue: string[]) => {
    // Combine group users with new individual users
    const combined = [...groupUsers, ...newValue];
    onChange(combined);
  };

  // Handle group selection
  const handleGroupChange = (newValue: string[]) => {
    setGroupUsers(newValue);
    // Combine with individual users
    const combined = [...individualUsers, ...newValue];
    onChange(combined);
  };

  return (
    <FormControl
      fullWidth
      error={error}
      disabled={disabled}
      required={required}
    >
      <FormLabel component="legend" sx={{mb: 1}}>
        {label}
      </FormLabel>

      {/* Group Selection */}
      <Box sx={{mb: 2}}>
        <Typography variant="subtitle2" sx={{mb: 1, fontWeight: "medium"}}>
          Chọn từ nhóm có sẵn
        </Typography>
        <UserGroupSelector
          value={groupUsers}
          onChange={handleGroupChange}
          placeholder="Chọn nhóm người dùng..."
          disabled={disabled}
        />
      </Box>

      <Divider sx={{my: 2}}>
        <Typography variant="caption" color="text.secondary">
          HOẶC
        </Typography>
      </Divider>

      {/* Individual Selection */}
      <Box>
        <Typography variant="subtitle2" sx={{mb: 1, fontWeight: "medium"}}>
          Chọn từng người riêng lẻ
        </Typography>
        <Box
          sx={{
            border: "1px solid #e0e0e0",
            borderRadius: 1,
            p: 2,
            backgroundColor: "#fafafa",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{mb: 1}}>
            Tính năng chọn từng người riêng lẻ sẽ được tích hợp vào đây
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Hiện tại bạn có thể sử dụng chức năng chọn nhóm ở trên
          </Typography>
        </Box>
      </Box>

      {/* Summary */}
      {value.length > 0 && (
        <Box sx={{mt: 2, p: 1, backgroundColor: "#e3f2fd", borderRadius: 1}}>
          <Typography variant="caption" color="primary">
            Đã chọn {value.length} người dùng
          </Typography>
        </Box>
      )}

      {helperText && (
        <Typography
          variant="caption"
          color={error ? "error" : "text.secondary"}
          sx={{mt: 1}}
        >
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

// ===== MAIN COMPONENT =====
export const TUserGroupComponent = ({
  value = [],
  onChange,
  label = "Chọn người nhận thông báo",
  placeholder = "Chọn nhóm...",
  error = false,
  helperText,
  disabled = false,
  required = false,
  mode = "assignment",
}: TUserGroupComponentProps) => {
  switch (mode) {
    case "selector":
      return (
        <UserGroupSelector
          value={value}
          onChange={onChange}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          disabled={disabled}
          required={required}
        />
      );

    case "info":
      return <UserGroupInfo onSelectGroup={onChange} />;

    case "assignment":
    default:
      return (
        <UserAssignmentSelector
          value={value}
          onChange={onChange}
          label={label}
          error={error}
          helperText={helperText}
          disabled={disabled}
          required={required}
        />
      );
  }
};

// Export individual components for backward compatibility
export {UserAssignmentSelector, UserGroupInfo, UserGroupSelector};
