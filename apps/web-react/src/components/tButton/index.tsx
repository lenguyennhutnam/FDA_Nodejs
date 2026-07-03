import {Button, ButtonProps} from "@mui/material";
import {styled} from "@mui/system";
const TButton = styled(Button)(
  ({theme, variant, sx, ...props}: ButtonProps & any) => ({
    padding: theme.spacing(0.8),
    borderRadius: theme.shape.borderRadius,
    transition: "opacity 0.25s ease",
    "&:hover": {
      opacity: variant == "contained" ? 0.8 : 1,
    },
  })
);
export {TButton};
