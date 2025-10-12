const { ethers, upgrades } = require('hardhat');

async function main() {
    
    const [deployer] = await ethers.getSigners();
    console.log("Upgrading with account:", deployer.address);

    // Dirección del proxy desplegado previamente
    const proxyAddress = "0xD1BD72d7292430c1dc1481f676739Fa697a0A50c"; 

    const CredentialStudentManagementV2 = await ethers.getContractFactory("CredentialStudentManagementV2");

    console.log("Upgrading proxy to new implementation...");
    const upgradedProxy = await upgrades.upgradeProxy(proxyAddress, CredentialStudentManagementV2, {
        kind: 'uups' 
    });

    await upgradedProxy.waitForDeployment();
    console.log("Proxy upgraded successfully!");
    console.log("Proxy address (unchanged):", await upgradedProxy.getAddress());

    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("New implementation address:", implementationAddress);
}

main().catch((error) => {
    console.error("Error during upgrade:", error);
    process.exitCode = 1;
});