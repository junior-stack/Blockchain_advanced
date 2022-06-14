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
        <Button variant="contained" sx={{ height: "100px" }}>
          Buy
        </Button>

        <Stack
          sx={{ position: "absolute", right: "180px", top: "380px" }}
          direction="row"
          spacing={2}
        >
          <FormControl variant="filled" sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="demo-simple-select-filled-label">
              Select a Token
            </InputLabel>
            <Select
              labelId="demo-simple-select-filled-label"
              id="demo-simple-select-filled"
              onChange={handleChange}
              value={token}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value={"DAI"}>DAI</MenuItem>
              <MenuItem value={"Solana"}>Solana</MenuItem>
              <MenuItem value={"ERC"}>ERC</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </ModalBox>
    </LayOut>
  );
};

export default Buyer;
