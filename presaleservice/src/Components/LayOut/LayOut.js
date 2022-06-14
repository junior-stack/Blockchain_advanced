import { Container } from "@mui/system";
import NavBar from "../NavBar/NavBar";
import { Stack } from "@mui/material";
import ModalBox from "../ModalBox/ModalBox";

const LayOut = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <NavBar />
      <Container sx={{ paddingTop: "200px" }}>
        <Stack direction="column" spacing={8}>
          {props.children}
        </Stack>
      </Container>
    </div>
  );
};

export default LayOut;
