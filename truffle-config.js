const HDWalletProvider = require("@truffle/hdwallet-provider");
require("dotenv").config();

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    goerli: {
      provider: function () {
        return new HDWalletProvider(
          `${process.env.DEPLOYER_PRIVATE_KEY}`,
          `https://eth-goerli.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}` // URL to Ethereum Node
        );
      },
      network_id: 5,
    },
  },
  contracts_directory: "./contracts",
  contracts_build_directory: "./abis",
  compilers: {
    solc: {
      version: "0.8.12",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
