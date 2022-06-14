import { Container } from "@mui/material";
import { styled } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import ModalBox from "../../Components/ModalBox/ModalBox";
import { Stack } from "@mui/material";
import { TextField } from "@mui/material";
import { Button } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import LayOut from "../../Components/LayOut/LayOut";
import { useState } from "react";
import "./Buyer.css";

const Buyer = (props) => {
  const [token, setToken] = useState("ETH");

  const handleChange = (event) => {
    setToken(event.target.value);
  };

  return (
    <LayOut>
      <ModalBox>
        <h1>Swap</h1>
        <TextField
          id="filled-number"
          type="number"
          className="Amount"
          label="Token Amount"
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ height: "200px", borderRadius: "100px" }}
          variant="filled"
        />
        <TextField
          id="filled-number"
          type="number"
          className="Amount"
          label="ETH amount"
          sx={{
            height: "200px",
            borderRadius: "20px",
          }}
          InputLabelProps={{
            shrink: true,
          }}
          variant="filled"
        />
        <Button variant="contained" sx={{ height: "100px" }}>
          Buy
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
            fontSize: "30px",
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

export default Buyer;
