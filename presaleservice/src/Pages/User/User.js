import LayOut from "../../Components/LayOut/LayOut";
import { TextField } from "@mui/material";
import ModalBox from "../../Components/ModalBox/ModalBox";

const User = (props) => {
  return (
    <LayOut>
      <ModalBox>
        <h1>Presale Token:</h1>
        <TextField
          id="filled-number"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ height: "200px", borderRadius: "100px" }}
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
          sx={{
            height: "200px",
            borderRadius: "20px",
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

export default User;
