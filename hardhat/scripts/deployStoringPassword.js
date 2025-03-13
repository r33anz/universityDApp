const { ethers } = require('hardhat');

async function main() {

    const  StorePassword = await ethers.getContractFactory("StoringPasswords");
    const storePassword = await StorePassword.deploy();
    await storePassword.waitForDeployment();
    const contractAddress = await storePassword.getAddress(); 
    console.log("Store Password Contract deployed to:", contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  