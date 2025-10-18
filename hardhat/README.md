# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

#Run scripts
``` shell
 npx hardhat run scripts/deploy.js --network bsctestnet
```

#Verify Contract
```shell
npx hardhat verify --network bsctestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```