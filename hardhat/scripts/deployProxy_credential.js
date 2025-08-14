const { ethers } = require('hardhat');

async function main() {
    const Implementation = await ethers.getContractFactory("CredentialStudentManagement");
    const implementation = await Implementation.deploy();
    await implementation.waitForDeployment();
    const implementationAddress = await implementation.getAddress();
    console.log("Implementation contract address:", implementationAddress);
    console.log("Implementación desplegada en:", implementation.target);

    const Proxy = await ethers.getContractFactory("CredentialProxy");
    const proxy = await Proxy.deploy(implementationAddress);
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();  
    console.log("Proxy contract address:", proxyAddress);
    console.log("Proxy desplegado en:", proxy.target);

    const proxyAsImpl = await ethers.getContractAt("CredentialStudentManagement", proxy.target);

    // Verificar admin
    const admin = await proxyAsImpl.getAdmin();
    console.log("Admin configurado:", admin);

    console.log("✅ Deploy inicial completado");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });


