import React from "react";
import { Chip, ChipProps } from "@mui/material";
import {
  Star,
  MilitaryTech,
  EmojiEvents,
  Security,
  Person,
} from "@mui/icons-material";

interface TRankMilitaryProps extends Omit<ChipProps, 'icon' | 'label'> {
  rank: string;
  showIcon?: boolean;
  size?: 'small' | 'medium';
}

const TRankMilitary: React.FC<TRankMilitaryProps> = ({
  rank,
  showIcon = true,
  size = 'small',
  sx,
  ...props
}) => {
  // Function để lấy icon và màu sắc cho cấp bậc quân đội
  const getRankIconAndColor = (rank: string) => {
    const rankLower = rank.toLowerCase();
    
    // Cấp bậc cao nhất
    if (rankLower.includes('đại tướng')) {
      return {
        icon: <EmojiEvents sx={{ fontSize: size === 'small' ? 16 : 18 }} />,
        color: '#d4af37', // Vàng
        bgColor: '#fff8dc',
        borderColor: '#d4af37'
      };
    }
    
    // Cấp bậc cao
    if (rankLower.includes('thượng tướng') || rankLower.includes('trung tướng') || rankLower.includes('thiếu tướng')) {
      return {
        icon: <MilitaryTech sx={{ fontSize: size === 'small' ? 16 : 18 }} />,
        color: '#c0c0c0', // Bạc
        bgColor: '#f8f9fa',
        borderColor: '#c0c0c0'
      };
    }
    
    // Cấp bậc trung cao
    if (rankLower.includes('thượng tá') || rankLower.includes('đại tá') || rankLower.includes('trung tá') || rankLower.includes('thiếu tá')) {
      return {
        icon: <Star sx={{ fontSize: size === 'small' ? 16 : 18 }} />,
        color: '#1976d2', // Xanh dương
        bgColor: '#e3f2fd',
        borderColor: '#1976d2'
      };
    }
    
    // Cấp bậc thấp hơn
    if (rankLower.includes('thượng úy') || rankLower.includes('đại úy') || rankLower.includes('trung úy') || rankLower.includes('thiếu úy')) {
      return {
        icon: <Security sx={{ fontSize: size === 'small' ? 16 : 18 }} />,
        color: '#2e7d32', // Xanh lá
        bgColor: '#e8f5e8',
        borderColor: '#2e7d32'
      };
    }
    
    // Cấp bậc thấp nhất
    if (rankLower.includes('thượng sĩ') || rankLower.includes('trung sĩ') || rankLower.includes('hạ sĩ') || rankLower.includes('binh nhất') || rankLower.includes('binh nhì')) {
      return {
        icon: <Person sx={{ fontSize: size === 'small' ? 16 : 18 }} />,
        color: '#757575', // Xám
        bgColor: '#f5f5f5',
        borderColor: '#757575'
      };
    }
    
    // Mặc định
    return {
      icon: <MilitaryTech sx={{ fontSize: size === 'small' ? 16 : 18 }} />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
      borderColor: '#1976d2'
    };
  };

  const rankStyle = getRankIconAndColor(rank);

  return (
    <Chip
      label={rank}
      size={size}
      variant="outlined"
      icon={showIcon ? rankStyle.icon : undefined}
      sx={{
        fontSize: size === 'small' ? "0.7rem" : "0.8rem",
        height: size === 'small' ? 24 : 28,
        bgcolor: rankStyle.bgColor,
        color: rankStyle.color,
        borderColor: rankStyle.borderColor,
        fontWeight: 600,
        "& .MuiChip-icon": {
          color: rankStyle.color,
        },
        "&:hover": {
          bgcolor: rankStyle.bgColor,
          transform: "translateY(-1px)",
          boxShadow: `0 2px 4px ${rankStyle.color}20`,
        },
        transition: "all 0.2s ease-in-out",
        ...sx,
      }}
      {...props}
    />
  );
};

export default TRankMilitary;
