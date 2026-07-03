import { styled } from '@mui/material/styles';
import { TableCell, TableRow, Box } from '@mui/material';

export const headerStyle = {
  backgroundColor: "#0A8DEE",
  color: "white",
  fontFamily: "Be Vietnam Pro",
  fontSize: "14px",
  fontWeight: "550",
  padding: "15px",
};

export const rowStyle = {
  backgroundColor: "white",
  fontFamily: "Be Vietnam Pro",
  fontSize: "14px",
  padding: "15px",
};

export const StyledTableCell = {
  backgroundColor: "white"
};

export const StyledTableRow = {
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  backgroundColor: "white",
};

export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  padding: '40px 20px',
  textAlign: 'center',
  backgroundColor: 'white',
  borderRadius: '0 0 8px 8px',
  color: theme.palette.text.secondary,
  fontFamily: 'Be Vietnam Pro',
  fontSize: '14px',
  width: '100%'
}));

export const EmptyStateCell = styled(TableCell)({
  padding: 0,
  border: 'none',
  backgroundColor: 'white',
});

export const EmptyStateRow = styled(TableRow)({
  height: 'auto',
  '&:last-child td': {
    border: 'none',
  },
  backgroundColor: 'white',
});