require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

const result = require("dotenv").config({ path: ".env" });

if (result.error) {
  throw result.error;
}

const INFURA_URL = result.parsed.REACT_APP_INFURA_URL;

const ADMIN = result.parsed.REACT_APP_ADMIN;

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  etherscan: {
    apiKey: "KCW4EIP2RMWJPPDCSNHGIJ21WIXQCEVTX6",
  },
  networks: {
    rinkeby: {
      url: INFURA_URL,
      accounts: [`${ADMIN}`],
    },
    hardhat: {
      chainId: 1337,
      from: result.parsed.REACT_APP_HARDHAT_ACCOUNT,
    },
  },
  paths: {
    cache: "./src/cache",
    artifacts: "./src/artifacts",
    tests: "./test",
  },
};
