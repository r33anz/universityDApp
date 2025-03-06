const { ethers } = require('hardhat');

async function main() {

    const  Management = await ethers.getContractFactory("CredentialStudentManagement");
    const management = await Management.deploy();
    await management.waitForDeployment();
    const contractAddress = await management.getAddress(); 
    console.log("Management Student Credential deployed to:", contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  