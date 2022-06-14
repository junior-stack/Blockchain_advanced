import LayOut from "../../Components/LayOut/LayOut";
import ModalBox from "../../Components/ModalBox/ModalBox";
import { TextField, Button } from "@mui/material";

const Admin = (props) => {
  return (
    <LayOut>
      <ModalBox>
        <h1>Set Usage Fee</h1>
        <TextField
          id="filled-number"
          type="number"
          className="Amount"
          label="UsageFee"
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ height: "200px", borderRadius: "100px" }}
          variant="filled"
        />
        <Button variant="contained" sx={{ height: "100px" }}>
          Set
        </Button>
      </ModalBox>
    </LayOut>
  );
};

export default Admin;
