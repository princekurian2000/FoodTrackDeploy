const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = 'person team omit upgrade country theory point mail bar call mouse program';
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 8545
    },
    // ropsten: {
    //   provider: function() {
    //     return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/0327088953044457a07d02b0d9dc35bd")
    //   },
    //   network_id: 3
    // }
  }
};
