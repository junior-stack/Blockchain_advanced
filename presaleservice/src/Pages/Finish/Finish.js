import LayOut from "../../Components/LayOut/LayOut";
import { Button, TextField } from "@mui/material";
import ModalBox from "../../Components/ModalBox/ModalBox";
import "./Finish.css";

const Finish = () => {
  return (
    <LayOut>
      <ModalBox>
        <h1>Finish</h1>
        <Button variant="contained" sx={{ height: "100px" }}>
          End presale
        </Button>
        <Button variant="contained" sx={{ height: "100px" }}>
          Withdraw
        </Button>
        <TextField
          id="filled-number"
          type="number"
          label="Presale ID"
          sx={{
            width: "120px",
            m: 1,
            height: "70px",
            borderRadius: "20px",
            position: "absolute",
            right: "180px",
            top: "20px",
          }}
          InputLabelProps={{
            shrink: true,
          }}
          variant="filled"
        />
      </ModalBox>
    </LayOut>
  );
};

export default Finish;
