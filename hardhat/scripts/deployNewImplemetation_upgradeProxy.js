const { ethers } = require("hardhat");

async function main() {
  const [admin] = await ethers.getSigners();
  console.log("Usando admin:", admin.address);

  // Dirección del proxy ya desplegado
  const PROXY_ADDRESS = "0xTuDireccionDeProxy";

  const NewImplementation = await ethers.getContractFactory("CredentialStudentManagement");
  const newImplementation = await NewImplementation.deploy();
  await newImplementation.waitForDeployment();
  console.log("Nueva implementación desplegada en:", newImplementation.target);

  const proxyContract = await ethers.getContractAt("CredentialProxy", PROXY_ADDRESS);

  const tx = await proxyContract.connect(admin).upgrade(newImplementation.target);
  await tx.wait();
  console.log("Proxy actualizado a nueva implementación");

  const proxyAsImpl = await ethers.getContractAt("CredentialStudentManagement", PROXY_ADDRESS);
  const adminAddress = await proxyAsImpl.getAdmin();
  console.log("Admin sigue siendo:", adminAddress);

  console.log("✅ Upgrade completado");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
