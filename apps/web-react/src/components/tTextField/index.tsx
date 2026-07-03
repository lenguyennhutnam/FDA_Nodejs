import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment, TextField } from "@mui/material";
import type { TextFieldProps } from "@mui/material/TextField";
import React from "react";
import { NumericFormat } from "react-number-format";
type Props = {
  label: string;
  type?: "text" | "number" | "currency";
  allowClear?: boolean;
};
const TTextField = (props: Props & TextFieldProps & any) => {
  const {
    allowClear = true,
    type = "text",
    variant = "outlined",
    id,
    ...otherProps
  } = props;
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword(show => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };
  return (
    <>
      {(type == "text" ||
        type == "number" ||
        type == "textarea" ||
        type == "password" ||
        type == "email") && (
          <TextField
            fullWidth
            label="Input"
            variant={variant}
            type={type == "password" && showPassword ? "text" : type}
            name={id}
            slotProps={{
              input: {
                endAdornment: (
                  <>
                    {" "}
                    {type == "password" && (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword
                              ? "hide the password"
                              : "display the password"
                          }
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          onMouseUp={handleMouseUpPassword}
                          edge="end"
                        >
                          {!showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )}
                  </>
                ),
              },
            }}
            {...otherProps}
          />
        )}
      {type == "currency" && (
        <NumericFormat
          customInput={TextField}
          name={id}
          variant={variant}
          thousandSeparator
          valueIsNumericString
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="start">VNĐ</InputAdornment>
              ),
              min: 0,
            },
          }}
          {...otherProps}
        />
      )}
    </>
  );
};
export { TTextField };
