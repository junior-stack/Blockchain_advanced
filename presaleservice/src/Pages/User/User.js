import LayOut from "../../Components/LayOut/LayOut";
import { TextField } from "@mui/material";
import ModalBox from "../../Components/ModalBox/ModalBox";
import { Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import "./User.css";

const User = (props) => {
  const [tokenList, setTokenList] = useState([
    {
      start: Date.now(),
      end: Date.now(),
      price: 0,
      tokenAmount: 0,
      tokenAddress: "",
    },
  ]);

  const add = () => {
    const arr = [...tokenList];
    arr.push({
      start: Date.now(),
      end: Date.now(),
      price: 0,
      tokenAmount: 0,
      tokenAddress: "",
    });
    setTokenList(arr);
  };

  const deletion = (index) => () => {
    if (tokenList.length == 1) return;
    const arr = [...tokenList];
    arr.splice(index, 1);
    setTokenList(arr);
  };

  const setPrice = (index) => (event) => {
    const arr = [...tokenList];
    arr[index].price = event.target.value;
    setTokenList(arr);
  };

  return (
    <LayOut>
      {tokenList.map((e, index) => {
        return (
          <ModalBox key={index}>
            <h1>Presale Token:</h1>
            <TextField
              id="filled-number"
              type="number"
              className="Amount"
              label="Start"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ height: "200px", borderRadius: "100px" }}
              variant="filled"
              value={e.start.toString()}
            />
            <TextField
              id="filled-number"
              type="number"
              className="Amount"
              label="End"
              sx={{
                height: "200px",
                borderRadius: "20px",
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="filled"
              value={e.end.toString()}
            />
            <TextField
              id="filled-number"
              type="number"
              className="Amount"
              label="Price"
              sx={{
                height: "200px",
                borderRadius: "20px",
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="filled"
              value={e.price}
              onChange={setPrice(index)}
            />
            <TextField
              id="filled-number"
              type="number"
              className="Amount"
              label="Token Amount"
              sx={{
                height: "200px",
                borderRadius: "20px",
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="filled"
              value={e.tokenAmount}
            />
            <TextField
              id="filled-number"
              type="number"
              className="Amount"
              label="Token Address"
              sx={{
                height: "200px",
                borderRadius: "20px",
              }}
              InputLabelProps={{
                shrink: true,
              }}
              variant="filled"
              value={e.tokenAddress}
            />
            <Button
              sx={{ height: "100px", bgcolor: "#f0f0f0" }}
              onClick={deletion(index)}
            >
              <DeleteIcon />
            </Button>
          </ModalBox>
        );
      })}

      <Button sx={{ height: "100px", bgcolor: "#f0f0f0" }} onClick={add}>
        <AddIcon />
      </Button>
      <Button variant="contained" sx={{ height: "100px" }}>
        Submit
      </Button>
      <div style={{ height: "200px" }}></div>
    </LayOut>
  );
};

export default User;
