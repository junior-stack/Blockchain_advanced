import AppBar from "@mui/material/AppBar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import { Container } from "@mui/system";
import { Stack, Toolbar } from "@mui/material";
import { Box, Menu, MenuItem, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as React from "react";
import Context from "../../Context/Context";

const NavBar = (props) => {
  let navigate = useNavigate();

  const { AccountAddress, setAccountAddress } = React.useContext(Context);

  const toUser = async () => {
    navigate("/user");
  };

  const toBuyer = async () => {
    navigate("/buyer");
  };

  const toFinish = async () => {
    navigate("/finish");
  };

  const toAdmin = async () => {
    navigate("/admin");
  };

  const connectWallet = async () => {
    const { ethereum } = window;
    if (Boolean(ethereum && ethereum.isMetaMask)) {
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (!accounts) {
        window.alert("You need to log into your metamask first");
      } else if (accounts[0] >= 0) {
        setAccountAddress(accounts[0]);
        ethereum.on("accountsChanged", function (accounts) {
          setAccountAddress(accounts[0]);
        });
      }
    } else {
      window.alert("You need to install your metamask");
    }
  };

  return (
    <AppBar position="static">
      <Toolbar disableGutters>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            color="inherit"
          >
            <MenuIcon />
          </IconButton>
        </Box>
        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
          <Button
            key={0}
            onClick={toUser}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            user
          </Button>
          <Button
            key={1}
            onClick={toBuyer}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            Buyer
          </Button>
          <Button
            key={2}
            onClick={toAdmin}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            Admin
          </Button>
          <Button
            key={3}
            onClick={toFinish}
            sx={{ my: 2, color: "white", display: "block" }}
          >
            Finish
          </Button>
          {AccountAddress === "" ? (
            <Button
              sx={{
                position: "relative",
                color: "white",
                display: "block",
                right: "-2000px",
              }}
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          ) : (
            <Box
              sx={{
                position: "relative",
                color: "white",
                display: "block",
                right: "-1800px",
                paddingTop: "20px",
              }}
            >
              {AccountAddress}{" "}
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
