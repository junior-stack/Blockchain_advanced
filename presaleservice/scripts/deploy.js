// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // We get the contract to deploy
  const PresaleService = await ethers.getContractFactory("PresaleService");
  [admin, usr1, usr2] = await ethers.getSigners();
  const presaleService = await PresaleService.deploy(
    100,
    admin.address,
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  );

  console.log("Presale deployed to:", presaleService.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
