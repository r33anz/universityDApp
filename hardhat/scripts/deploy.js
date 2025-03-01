const { ethers } = require('hardhat');

async function main() {
    const unlockTime = Math.floor(Date.now() / 1000) + 60;
    const  Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: ethers.parseEther("0.1") });
    await lock.waitForDeployment();
    const contractAddress = await lock.getAddress(); 
    console.log("Lock deployed to:", contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  