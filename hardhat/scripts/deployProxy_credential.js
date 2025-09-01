const { ethers, upgrades } = require('hardhat'); 

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const CredentialStudentManagement = await ethers.getContractFactory("CredentialStudentManagement");
    const implementation = await CredentialStudentManagement.deploy();
    await implementation.waitForDeployment();
    console.log("Implementation address:", await implementation.getAddress());

    const proxy = await upgrades.deployProxy(CredentialStudentManagement, [deployer.address], { 
        kind: 'uups' // Especifica UUPS
    });
    await proxy.waitForDeployment();
    console.log("Proxy address:", await proxy.getAddress());

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});