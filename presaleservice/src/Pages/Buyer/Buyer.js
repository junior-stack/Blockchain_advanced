import { Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import ModalBox from "../../Components/ModalBox/ModalBox";
import NavBar from "../../Components/NavBar/NavBar";
import { TextField } from "@mui/material";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const Buyer = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <NavBar />
      <Container sx={{ paddingTop: "200px" }}>
        <ModalBox>
          <TextField
            id="filled-number"
            type="number"
            InputLabelProps={{
              shrink: true,
            }}
            sx={{ height: "200px", borderRadius: "20px" }}
            variant="filled"
          />
          <TextField
            id="filled-number"
            type="number"
            sx={{
              height: "200px",
              borderRadius: "20px",
            }}
            InputLabelProps={{
              shrink: true,
            }}
            variant="filled"
          />
          <TextField
            id="filled-number"
            type="number"
            sx={{ height: "140px", borderRadius: "20px" }}
            InputLabelProps={{
              shrink: true,
            }}
            variant="filled"
          />
        </ModalBox>
      </Container>
    </div>
  );
};

export default Buyer;
