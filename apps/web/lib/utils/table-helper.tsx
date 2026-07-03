import { Box, Button, Menu, MenuItem } from "@mui/material";
import { ReactNode, useState } from "react";

const RowActions = (props: any) => {
  const { row, actions, align } = props;
  const [anchorEl, setAnchorEl] = useState<any>(null);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        gap: "10px",
        alignItems: "center",
        justifyContent: align,
      }}
    >
      {actions.map((action: any, index: number) => {
        const isDisabled = typeof action.disabled === 'function' ? action.disabled(row) : !!action.disabled;

        return (
          <span key={index}>
            {action.type === "dropdown" ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleClick}
                  startIcon={action.icon}
                  size="small"
                  disabled={isDisabled}
                  sx={{
                    backgroundColor: isDisabled ? "#e0e0e0" : (action.color || "#0A8DEE"),
                    textTransform: "none !important",
                    minWidth: "auto",
                    padding: "6px 8px",
                    fontSize: "0.75rem",
                    height: "32px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {action?.label ?? ""}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={() => handleClose()}
                  PaperProps={{
                    elevation: 1,
                  }}
                  MenuListProps={{
                    sx: {
                      "& .MuiMenuItem-root": {
                        "&:hover": {
                          backgroundColor: "#0A8DEE",
                          color: "white",
                        },
                      },
                    },
                  }}
                >
                  {action.buttons.map((button: any) => (
                    <MenuItem
                      key={button.label}
                      onClick={() => {
                        button.onClick(row);
                        handleClose();
                      }}
                    >
                      {button.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : (
              <Button
                variant="contained"
                onClick={() => !isDisabled && action.onClick(row)}
                startIcon={action.icon}
                size="small"
                disabled={isDisabled}
                sx={{
                  backgroundColor: isDisabled ? "#e0e0e0" : (action.color || "#0A8DEE"),
                  textTransform: "none !important",
                  minWidth: "auto",
                  padding: "6px 8px",
                  fontSize: "0.75rem",
                  height: "32px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {action.label}
              </Button>
            )}
          </span>
        );
      })}
    </Box>
  );
};

export const addActionToRows = (rows: any[], actions: any[] = [], align: string = "center") => {
  return addFieldToItems(rows, "actions", row => (
    <RowActions row={row} actions={actions} align={align}></RowActions>
  ));
};

export const addFieldToItems = <T extends object, K extends keyof any>(
  items: T[],
  fieldName: K,
  generateValue: (item: T) => any
): (T & Record<K, any>)[] => {
  return items?.map(item => ({
    ...(item as T),
    [fieldName]: generateValue(item),
  })) as (T & Record<K, any>)[];
};

export const addOptionsToColumns = <T extends object>(
  columns: T[],
  fieldId: string,
  options: {value: any; label?: string; customLabel?: ReactNode}[]
): T[] => {
  return columns.map((column: any) =>
    column.id === fieldId ? {...column, options} : column
  );
};

export const addOnChangeToColumns = <T extends object>(
  columns: T[],
  fieldId: string,
  onChange: (formData: any, value: any) => void
): T[] => {
  return columns.map((column: any) =>
    column.id === fieldId ? {...column, onChange} : column
  );
};

export const changeKeyValueToColumns = <T extends object>(
  columns: T[],
  fieldId: string,
  changedKey: string,
  changedvalue: any
): T[] => {
  return columns.map((column: any) =>
    column.id === fieldId ? {...column, [changedKey]: changedvalue} : column
  );
};

export const addFetchOptionsToColumns = <T extends object>(
  columns: T[],
  fieldId: string,
  fetchOptions: (input: string) => Promise<{value: any; label: string}[]>
): T[] => {
  return columns.map((column: any) =>
    column.id === fieldId ? {...column, fetchOptions} : column
  );
};

export const addFieldToColumns = <T extends object>(
  columns: T[],
  fieldId: string,
  name: string,
  value: any
): T[] => {
  return columns.map((column: any) =>
    column.id === fieldId
      ? {
          ...column,
          ...{
            [name]: value,
          },
        }
      : column
  );
};
