const { ethers } = require('hardhat');

async function main() {

    const KardexNFT = await ethers.getContractFactory("KardexNFT");
    const kardexNFT = await KardexNFT.deploy();
    await kardexNFT.waitForDeployment();
    const contractAddress = await kardexNFT.getAddress();
    
    console.log("Contract address NFT:", contractAddress);
    
    try {
        const name = await kardexNFT.name();
        const symbol = await kardexNFT.symbol();
        const owner = await kardexNFT.owner();
        
        console.log("\n📄 Contract verification:");
        console.log("  Name:", name);
        console.log("  Symbol:", symbol);
        console.log("  Owner:", owner);
    } catch (error) {
        console.warn("⚠️ Could not verify contract details:", error.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


