import LayOut from "../../Components/LayOut/LayOut";
import ModalBox from "../../Components/ModalBox/ModalBox";
import { TextField, Button } from "@mui/material";
import { useState } from "react";

const Admin = (props) => {
  const [usageFee, setUsageFee] = useState("");

  const changeUsageFee = (event) => {
    setUsageFee(event.target.value);
  };

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
          value={usageFee}
          onChange={changeUsageFee}
        />
        <Button variant="contained" sx={{ height: "100px" }}>
          Set
        </Button>
      </ModalBox>
    </LayOut>
  );
};

export default Admin;
