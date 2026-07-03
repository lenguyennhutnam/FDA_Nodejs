import { Avatar, Box, CircularProgress, Tooltip, Typography } from '@mui/material';
import React, { useCallback, useEffect, useState } from 'react';
import AvatarCacheManager from '../../utils/avatarCache';

interface UserAvatarProps {
  userId: string;
  userName?: string;
  size?: number;
  showName?: boolean;
  showTooltip?: boolean;
  fallbackIcon?: React.ReactNode;
  sx?: object;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  userId,
  userName = '',
  size = 32,
  showName = false,
  showTooltip = true,
  fallbackIcon,
  sx = {},
  onClick,
}) => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Load avatar using cache manager
  const loadAvatar = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(false);
      
      const cacheManager = AvatarCacheManager.getInstance();
      const cachedUrl = await cacheManager.getAvatarUrl(userId);
      
      if (cachedUrl) {
        setAvatarUrl(cachedUrl);
      } else {
        setError(true);
      }
    } catch (err: unknown) {
      // Only log unexpected errors (not 404 which is normal when no avatar exists)
      const error = err as { message?: { status?: number } };
      if (error?.message?.status !== 404) {
        console.error('Error loading avatar for user:', userName, err);
      }
      
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load avatar when component mounts or userId changes
  useEffect(() => {
    loadAvatar();
  }, [loadAvatar]);


  // Get initials from user name
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Default avatar props
  const avatarProps = {
    sx: {
      width: size,
      height: size,
      fontSize: size * 0.4,
      fontWeight: 'bold',
      bgcolor: error ? '#f5f5f5' : '#1976d2',
      color: error ? '#666' : 'white',
      cursor: onClick ? 'pointer' : 'default',
      ...sx,
    },
    onClick,
  };

  // Avatar content
  const avatarContent = loading ? (
    <CircularProgress size={size * 0.6} color="inherit" />
  ) : avatarUrl && !error ? (
    <img
      src={avatarUrl}
      alt={userName || 'User avatar'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%',
      }}
    />
  ) : fallbackIcon || (
    <Typography
      sx={{
        fontSize: size * 0.4,
        fontWeight: 'bold',
        color: 'inherit',
      }}
    >
      {getInitials(userName)}
    </Typography>
  );

  // Main avatar component
  const avatarElement = (
    <Avatar {...avatarProps}>
      {avatarContent}
    </Avatar>
  );

  // If only showing avatar without name
  if (!showName) {
    return showTooltip && userName ? (
      <Tooltip title={userName} arrow>
        {avatarElement}
      </Tooltip>
    ) : avatarElement;
  }

  // Avatar with name
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ...sx }}>
      {avatarElement}

      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {showName && userName && (
          <Typography
            variant="body2"
            fontWeight="600"
            sx={{
              color: 'text.primary',
              fontSize: size * 0.35,
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userName}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default UserAvatar;
