
const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config()

const mnemonic = process.env.PRIVATE_KEY
const mnemonic_test = process.env.PRIVATE_KEY
const bscApiKey = process.env.BSC_API_KEY
const polygonApiKey = process.env.POLYGON_API_KEY

module.exports = {

  plugins: ["truffle-plugin-verify"],

  api_keys: {
    bscscan: bscApiKey,
    polygonscan: polygonApiKey
  },

  networks: {
    ftm_testnet: {
      //  https://rpcapi.fantom.network for mainnet
      provider: () => new HDWalletProvider(mnemonic,'https://rpc.testnet.fantom.network/'),
      network_id: 4002, // as seen in error message
      confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    ftm_mainnet: {
      provider: () => new HDWalletProvider(mnemonic,'https://rpc.ftm.tools'),
      network_id: 250, // as seen in error message
      confirmations: 3,
      timeoutBlocks: 10000,
      skipDryRun: true,
      networkCheckTimeout: 999999, // for handling timeouts
      // gas: 2000000,
      // gasPrice: 50000000000,
    },
    velas_mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://evmexplorer.velas.com/rpc`),
      network_id: 106,
      confirmations: 2,
      timeoutBlocks: 10000, // was 500 before
      skipDryRun: true,
      gas: 20000000,
      gasPrice: 50000000000, // 1 eth is the max
    },

    velas_testnet: {
      provider: () => new HDWalletProvider(mnemonic, `wss://api.velas.com/`),
      network_id: 111,
      confirmations: 2,
      timeoutBlocks: 10000, // was 500 before
      skipDryRun: true,
      gas: 20000000,
      gasPrice: 50000000000, // 1 eth is the max
    },
    matic_mumbai: {
      // matic mumbai testnet
      provider: () => new HDWalletProvider(mnemonic_test, `https://rpc-mumbai.maticvigil.com`),
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
      gas: 20000000,
      gasPrice: 50000000000,
    },
    bsc_testnet: {
      provider: () => new HDWalletProvider(mnemonic_test,'https://data-seed-prebsc-1-s1.binance.org:8545'),
      network_id: 97,
      // confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    bsc_mainnet: {
      provider: () => new HDWalletProvider(mnemonic,'https://bsc-dataseed.binance.org/'),
      network_id: 56,
      // confirmations: 5,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    matic_mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://polygon-rpc.com`),
      network_id: 137,
      confirmations: 2,
      timeoutBlocks: 10000, // was 500 before
      skipDryRun: true,
      gas: 20000000,
      gasPrice: 50000000000, // 1 eth is the max
    },
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.1",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  },

};