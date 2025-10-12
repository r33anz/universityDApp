const { ethers } = require('hardhat');

async function main() {

    const KardexNFT = await ethers.getContractFactory("KardexNFT");
    const kardexNFT = await KardexNFT.deploy();
    await kardexNFT.waitForDeployment();
    const contractAddress = await kardexNFT.getAddress();
    
    console.log("Contract address NFT:", contractAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


