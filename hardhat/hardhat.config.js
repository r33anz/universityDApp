require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
dotenv.config();


module.exports = {
  solidity: "0.8.28",
  networks: {
    bsctestnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.BSCSCAN_API_KEY, 
  },
};