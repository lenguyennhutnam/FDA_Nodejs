import { Chip } from '@mui/material';
import React from 'react';
import { TroopStatus, TroopStatusLabels } from '../../types/tbnv';

interface TroopStatusChipProps {
  status: TroopStatus;
}

const statusColors: Record<TroopStatus, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  [TroopStatus.CoMat]: 'success',
  [TroopStatus.NghiPhep]: 'info',
  [TroopStatus.NghiOm]: 'warning',
  [TroopStatus.DiVien]: 'error',
  [TroopStatus.TranhThu]: 'info',
  [TroopStatus.NghiCuoiTuan]: 'default',
  [TroopStatus.CongTac]: 'info',
  [TroopStatus.ChinhSach]: 'default',
  [TroopStatus.DiHoc]: 'warning',
  [TroopStatus.Khac]: 'default',
  [TroopStatus.TangCuong]: 'success',
};

export const TroopStatusChip: React.FC<TroopStatusChipProps> = ({ status }) => {
  return (
    <Chip
      label={TroopStatusLabels[status]}
      color={statusColors[status]}
      size="small"
    />
  );
};

export default TroopStatusChip;

