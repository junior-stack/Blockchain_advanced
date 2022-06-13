import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Paper } from "@mui/material";
const ModalBox = (props) => {
  return (
    <Paper elevation={3}>
      <Stack
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
        spacing={1}
        sx={{ padding: "20px" }}
      >
        {props.children}
      </Stack>
    </Paper>
  );
};

export default ModalBox;
