import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Avatar,
  CircularProgress,
} from "@mui/material";
import {
  Palette as PaletteIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  ColorLens as ColorIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoIcon,
} from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setSelectedTheme, resetTheme, ThemeColors } from "../../redux/theme";
import { useNotifier } from "../../provider/NotificationProvider";

interface ThemeSettingsProps {
  onClose?: () => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const themeColors = useAppSelector((state) => state.theme.colors);
  const selectedPreset = useAppSelector((state) => state.theme.selectedPreset);
  const { success } = useNotifier();

  const [saving, setSaving] = useState(false);

  const predefinedThemes = {
    default: {
      name: "Mặc định",
      description: "Giao diện sáng với màu xanh dương chủ đạo",
      icon: <LightIcon />,
      color: "#1976d2",
      colors: {
        headerBackground: "#FCFDFE",
        headerText: "#000000",
        sidebarBackground: "white",
        sidebarText: "#64748B",
        sidebarActiveBackground: "rgba(9, 141, 238, 0.08)",
        sidebarActiveText: "#098DEE",
        sidebarHoverBackground: "rgba(9, 141, 238, 0.04)",
      },
    },
    // Themes 2 màu (header nhạt + sidebar đậm) - ưu tiên hiển thị trước
    lightPurpleGreen: {
      name: "Trắng - Xanh lá",
      description: "Header trắng với sidebar xanh lá",
      icon: <AutoIcon />,
      color: "#2e7d32",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#2e7d32",
        sidebarText: "#e8f5e8",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightOrangeBlue: {
      name: "Trắng - Xanh dương",
      description: "Header trắng với sidebar xanh dương",
      icon: <PaletteIcon />,
      color: "#1976d2",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#1976d2",
        sidebarText: "#e3f2fd",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightRedTeal: {
      name: "Trắng - Xanh ngọc",
      description: "Header trắng với sidebar xanh ngọc",
      icon: <PaletteIcon />,
      color: "#00695c",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#00695c",
        sidebarText: "#e0f2f1",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightPinkBlack: {
      name: "Trắng - Đen",
      description: "Header trắng với sidebar đen",
      icon: <DarkIcon />,
      color: "#000000",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#000000",
        sidebarText: "#ffffff",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightBrownIndigo: {
      name: "Trắng - Chàm",
      description: "Header trắng với sidebar chàm",
      icon: <PaletteIcon />,
      color: "#3f51b5",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#3f51b5",
        sidebarText: "#e8eaf6",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightTealOrange: {
      name: "Trắng - Cam",
      description: "Header trắng với sidebar cam",
      icon: <ColorIcon />,
      color: "#f57c00",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#f57c00",
        sidebarText: "#fff3e0",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightIndigoPink: {
      name: "Trắng - Hồng",
      description: "Header trắng với sidebar hồng",
      icon: <AutoIcon />,
      color: "#c2185b",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#c2185b",
        sidebarText: "#fce4ec",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightGreenRed: {
      name: "Trắng - Đỏ",
      description: "Header trắng với sidebar đỏ",
      icon: <PaletteIcon />,
      color: "#d32f2f",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#d32f2f",
        sidebarText: "#ffebee",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightCyanPurple: {
      name: "Trắng - Tím",
      description: "Header trắng với sidebar tím",
      icon: <ColorIcon />,
      color: "#7b1fa2",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#7b1fa2",
        sidebarText: "#f3e5f5",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
    lightGrayBrown: {
      name: "Trắng - Nâu",
      description: "Header trắng với sidebar nâu",
      icon: <PaletteIcon />,
      color: "#5d4037",
      colors: {
        headerBackground: "#ffffff",
        headerText: "#000000",
        sidebarBackground: "#5d4037",
        sidebarText: "#efebe9",
        sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
        sidebarActiveText: "#ffffff",
        sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
      },
    },
      lightOrangeGreen: {
        name: "Trắng - Xanh dương đậm",
        description: "Header trắng với sidebar xanh dương đậm",
        icon: <ColorIcon />,
        color: "#1565c0",
        colors: {
          headerBackground: "#ffffff",
          headerText: "#000000",
          sidebarBackground: "#1565c0",
          sidebarText: "#e3f2fd",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      // 12 themes 2 màu bổ sung với tương phản
      lightGrayRed: {
        name: "Trắng - Đỏ đậm",
        description: "Header trắng với sidebar đỏ đậm",
        icon: <PaletteIcon />,
        color: "#c62828",
        colors: {
          headerBackground: "#ffffff",
          headerText: "#000000",
          sidebarBackground: "#c62828",
          sidebarText: "#ffebee",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightBeigePurple: {
        name: "Beige - Tím đậm",
        description: "Header beige với sidebar tím đậm",
        icon: <AutoIcon />,
        color: "#6a1b9a",
        colors: {
          headerBackground: "#faf8f3",
          headerText: "#000000",
          sidebarBackground: "#6a1b9a",
          sidebarText: "#f3e5f5",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightCreamGreen: {
        name: "Kem - Xanh lá đậm",
        description: "Header kem với sidebar xanh lá đậm",
        icon: <PaletteIcon />,
        color: "#1b5e20",
        colors: {
          headerBackground: "#fefcf8",
          headerText: "#000000",
          sidebarBackground: "#1b5e20",
          sidebarText: "#e8f5e8",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightSilverOrange: {
        name: "Trắng - Cam đậm",
        description: "Header trắng với sidebar cam đậm",
        icon: <ColorIcon />,
        color: "#e65100",
        colors: {
          headerBackground: "#ffffff",
          headerText: "#000000",
          sidebarBackground: "#e65100",
          sidebarText: "#fff3e0",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightIvoryNavy: {
        name: "Ngà - Xanh navy",
        description: "Header ngà với sidebar xanh navy",
        icon: <ColorIcon />,
        color: "#0d47a1",
        colors: {
          headerBackground: "#fefefe",
          headerText: "#000000",
          sidebarBackground: "#0d47a1",
          sidebarText: "#e3f2fd",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightPearlPink: {
        name: "Ngọc trai - Hồng đậm",
        description: "Header ngọc trai với sidebar hồng đậm",
        icon: <PaletteIcon />,
        color: "#ad1457",
        colors: {
          headerBackground: "#fafafa",
          headerText: "#000000",
          sidebarBackground: "#ad1457",
          sidebarText: "#fce4ec",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightMintTeal: {
        name: "Mint - Teal đậm",
        description: "Header mint với sidebar teal đậm",
        icon: <ColorIcon />,
        color: "#004d40",
        colors: {
          headerBackground: "#f0fff4",
          headerText: "#000000",
          sidebarBackground: "#004d40",
          sidebarText: "#e0f2f1",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightLavenderIndigo: {
        name: "Lavender - Chàm đậm",
        description: "Header lavender với sidebar chàm đậm",
        icon: <AutoIcon />,
        color: "#283593",
        colors: {
          headerBackground: "#faf8ff",
          headerText: "#000000",
          sidebarBackground: "#283593",
          sidebarText: "#e8eaf6",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightRoseGold: {
        name: "Rose - Vàng đồng",
        description: "Header rose với sidebar vàng đồng",
        icon: <PaletteIcon />,
        color: "#ff8f00",
        colors: {
          headerBackground: "#fff5f5",
          headerText: "#000000",
          sidebarBackground: "#ff8f00",
          sidebarText: "#fff8e1",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightSkyBlue: {
        name: "Sky - Xanh dương đậm",
        description: "Header sky với sidebar xanh dương đậm",
        icon: <ColorIcon />,
        color: "#1565c0",
        colors: {
          headerBackground: "#f0f8ff",
          headerText: "#000000",
          sidebarBackground: "#1565c0",
          sidebarText: "#e3f2fd",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightCoralBrown: {
        name: "Coral - Nâu sẫm",
        description: "Header coral với sidebar nâu sẫm",
        icon: <PaletteIcon />,
        color: "#4e342e",
        colors: {
          headerBackground: "#fff5f5",
          headerText: "#000000",
          sidebarBackground: "#4e342e",
          sidebarText: "#efebe9",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
      lightAzureCyan: {
        name: "Azure - Cyan đậm",
        description: "Header azure với sidebar cyan đậm",
        icon: <ColorIcon />,
        color: "#006064",
        colors: {
          headerBackground: "#f0ffff",
          headerText: "#000000",
          sidebarBackground: "#006064",
          sidebarText: "#e0f7fa",
          sidebarActiveBackground: "rgba(255, 255, 255, 0.15)",
          sidebarActiveText: "#ffffff",
          sidebarHoverBackground: "rgba(255, 255, 255, 0.08)",
        },
      },
    };

  const handleSelectTheme = (themeKey: string, colors: ThemeColors) => {
    dispatch(setSelectedTheme({ preset: themeKey, colors }));
    success(
      `Đã áp dụng giao diện "${predefinedThemes[themeKey]?.name || "tùy chỉnh"}"`
    );
  };

  const handleResetTheme = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch(resetTheme());
    success('Đã reset giao diện về mặc định!');
    setSaving(false);
    if (onClose) onClose();
  };

  const themeCategories = [
    {
      title: "Giao diện hệ thống",
      icon: <PaletteIcon />,
      color: "#1976d2",
      themes: Object.entries(predefinedThemes).map(([key, theme]) => ({
        key,
        name: theme.name,
        description: theme.description,
        icon: theme.icon,
        color: theme.color,
        colors: theme.colors,
      })),
    },
  ];

  return (
    <Box sx={{ width: "100%", height: "100%", p: 0 }}>
      {/* Theme Categories */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {themeCategories.map((category, categoryIndex) => (
          <Box
            key={categoryIndex}
            sx={{ bgcolor: "white", p: 3, borderRadius: "8px" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Avatar
                  sx={{
                    bgcolor: category.color,
                    mr: 2,
                    width: 48,
                    height: 48,
                    boxShadow: "none",
                  }}
                >
                  {category.icon}
                </Avatar>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: category.color }}
                >
                  {category.title}
                </Typography>
              </Box>

              {/* Reset Button */}
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetTheme}
                disabled={saving}
                sx={{
                  padding: "10px 18px",
                  borderRadius: "8px",
                  border: "1px solid #D0D5DD",
                  background: "#FFF",
                  boxShadow: "none",
                  color: "#344054",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "24px",
                  textTransform: "none",
                  "&:hover": {
                    opacity: 0.9,
                    boxShadow: "none",
                    border: "1px solid #D0D5DD",
                  },
                }}
              >
                {saving ? <CircularProgress size={20} /> : "Reset mặc định"}
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: 2,
                pl: 0,
              }}
            >
              {category.themes.map((theme, themeIndex) => (
                <Box
                  key={themeIndex}
                  sx={{
                    border:
                      selectedPreset === theme.key
                        ? `2px solid ${theme.color}`
                        : "2px solid #e0e0e0",
                    borderRadius: "12px",
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      border: `2px solid ${theme.color}`,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
                    },
                  }}
                  onClick={() => handleSelectTheme(theme.key, theme.colors)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: theme.color,
                        mr: 2,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {theme.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {theme.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: "0.75rem" }}
                      >
                        {theme.description}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Theme Preview */}
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    {/* Header Preview */}
                    <Box
                      sx={{
                        flex: 1,
                        height: 40,
                        borderRadius: "4px",
                        background: theme.colors.headerBackground,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.colors.headerText,
                          fontWeight: 600,
                          fontSize: "10px",
                        }}
                      >
                        Header
                      </Typography>
                    </Box>
                    {/* Sidebar Preview */}
                    <Box
                      sx={{
                        flex: 1,
                        height: 40,
                        borderRadius: "4px",
                        background: theme.colors.sidebarBackground,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.colors.sidebarText,
                          fontWeight: 600,
                          fontSize: "10px",
                        }}
                      >
                        Sidebar
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Info Card - moved inside the theme category */}
            <Box sx={{ mt: 3, p: 3, bgcolor: "#f8f9fa", borderRadius: "8px" }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <CheckCircleIcon sx={{ color: "#4caf50", mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Thông tin về Giao diện
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", lineHeight: 1.6 }}
              >
                • Các giao diện này được thiết kế với màu sắc tương phản tốt để
                đảm bảo khả năng đọc
                <br />
                • Đồng chí có thể chọn giao diện bất kỳ lúc nào và chúng sẽ áp
                dụng ngay lập tức
                <br />
                • Nút "Reset mặc định" sẽ khôi phục giao diện về trạng thái ban
                đầu
                <br />• Giao diện sẽ được lưu và áp dụng cho toàn bộ hệ thống
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export { ThemeSettings };
export default ThemeSettings;
