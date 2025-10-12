const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("CredentialStudentManagement", function () {
    let credentialContract;
    let owner, student1, student2, admin, otherAccount;
    
    const STUDENT_SIS_1 = "SIS001";
    const STUDENT_SIS_2 = "SIS002";
    const INVALID_SIS = "";
    const PASSWORD_HASH = ethers.keccak256(ethers.toUtf8Bytes("password123"));
    const IPFS_HASH = "QmTestHash123456789";

    beforeEach(async function () {
        [owner, student1, student2, admin, otherAccount] = await ethers.getSigners();
        
        const CredentialStudentManagement = await ethers.getContractFactory("CredentialStudentManagement");
        credentialContract = await upgrades.deployProxy(
            CredentialStudentManagement,
            [owner.address],
            { initializer: "initialize" }
        );
        await credentialContract.waitForDeployment();
    });

    describe("Inicialización", function () {
        it("Debe inicializar correctamente el contrato", async function () {
            expect(await credentialContract.owner()).to.equal(owner.address);
        });
    });

    describe("emitCredential", function () {
        it("Debe emitir credencial correctamente", async function () {
            await expect(
                credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address)
            ).to.emit(credentialContract, "CredentialIssued")
             .withArgs(STUDENT_SIS_1, student1.address, await time.latest() + 1);

            const student = await credentialContract.students(STUDENT_SIS_1);
            expect(student.codSIS).to.equal(STUDENT_SIS_1);
            expect(student.walletAddress).to.equal(student1.address);
            expect(student.passwordHash).to.equal(ethers.ZeroHash);
            expect(student.ipfsHash).to.equal("");
            expect(student.issuedAt).to.be.gt(0);

            expect(await credentialContract.walletToSIS(student1.address)).to.equal(STUDENT_SIS_1);
        });

        it("No debe permitir SIS code vacío", async function () {
            await expect(
                credentialContract.connect(owner).emitCredential(INVALID_SIS, student1.address)
            ).to.be.revertedWith("El codigo SIS no puede estar vacio");
        });

        it("No debe permitir wallet address cero", async function () {
            await expect(
                credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, ethers.ZeroAddress)
            ).to.be.revertedWith("Wallet no puede ser 0x0");
        });

        it("No debe permitir wallet del contrato", async function () {
            const contractAddress = await credentialContract.getAddress();
            await expect(
                credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, contractAddress)
            ).to.be.revertedWith("La billetera del estudiante no puede ser el proxy");
        });

        it("No debe permitir duplicar estudiante", async function () {
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
            
            await expect(
                credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student2.address)
            ).to.be.revertedWith("El estudiante ya existe");
        });

        it("Solo el owner puede emitir credenciales", async function () {
            await expect(
                credentialContract.connect(student1).emitCredential(STUDENT_SIS_1, student1.address)
            ).to.be.revertedWithCustomError(credentialContract, "OwnableUnauthorizedAccount");
        });
    });

    describe("setStudentPassword", function () {
        beforeEach(async function () {
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
        });

        it("Debe permitir al estudiante establecer contraseña", async function () {
            await credentialContract.connect(student1).setStudentPassword(STUDENT_SIS_1, PASSWORD_HASH);
            
            const student = await credentialContract.students(STUDENT_SIS_1);
            expect(student.passwordHash).to.equal(PASSWORD_HASH);
        });

        it("No debe permitir SIS code vacío", async function () {
            await expect(
                credentialContract.connect(student1).setStudentPassword(INVALID_SIS, PASSWORD_HASH)
            ).to.be.revertedWith("El codigo SIS no puede estar vacio");
        });

        it("Solo el estudiante propietario puede establecer contraseña", async function () {
            await expect(
                credentialContract.connect(student2).setStudentPassword(STUDENT_SIS_1, PASSWORD_HASH)
            ).to.be.revertedWith("Solo el estudiante puede establecer la contrasenia");
        });
    });

    describe("setIPFSHash", function () {
        beforeEach(async function () {
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
        });

        it("Debe permitir al owner establecer IPFS hash", async function () {
            await credentialContract.connect(owner).setIPFSHash(STUDENT_SIS_1, IPFS_HASH);
            
            const student = await credentialContract.students(STUDENT_SIS_1);
            expect(student.ipfsHash).to.equal(IPFS_HASH);
        });

        it("No debe permitir SIS code vacío", async function () {
            await expect(
                credentialContract.connect(owner).setIPFSHash(INVALID_SIS, IPFS_HASH)
            ).to.be.revertedWith("El codigo SIS no puede estar vacio");
        });

        it("No debe permitir estudiante inexistente", async function () {
            await expect(
                credentialContract.connect(owner).setIPFSHash("SISXXX", IPFS_HASH)
            ).to.be.revertedWith("El estudiante no existe");
        });

        it("Solo el owner puede establecer IPFS hash", async function () {
            await expect(
                credentialContract.connect(student1).setIPFSHash(STUDENT_SIS_1, IPFS_HASH)
            ).to.be.revertedWithCustomError(credentialContract, "OwnableUnauthorizedAccount");
        });
    });

    describe("getStudentAddressBySISCode", function () {
        beforeEach(async function () {
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
        });

        it("Debe retornar la dirección correcta del estudiante", async function () {
            const address = await credentialContract.getStudentAddressBySISCode(STUDENT_SIS_1);
            expect(address).to.equal(student1.address);
        });

        it("No debe permitir SIS code vacío", async function () {
            await expect(
                credentialContract.getStudentAddressBySISCode(INVALID_SIS)
            ).to.be.revertedWith("El codigo SIS no puede estar vacio");
        });

        it("No debe permitir estudiante inexistente", async function () {
            await expect(
                credentialContract.getStudentAddressBySISCode("SISXXX")
            ).to.be.revertedWith("El estudiante no existe");
        });
    });

    describe("getStudentPassword", function () {
        beforeEach(async function () {
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
            await credentialContract.connect(student1).setStudentPassword(STUDENT_SIS_1, PASSWORD_HASH);
        });

        it("Debe permitir al estudiante obtener su contraseña", async function () {
            const password = await credentialContract.connect(student1).getStudentPassword(STUDENT_SIS_1);
            expect(password).to.equal(PASSWORD_HASH);
        });

        it("No debe permitir SIS code vacío", async function () {
            await expect(
                credentialContract.connect(student1).getStudentPassword(INVALID_SIS)
            ).to.be.revertedWith("El codigo SIS no puede estar vacio");
        });

        it("Solo el estudiante propietario puede obtener la contraseña", async function () {
            await expect(
                credentialContract.connect(student2).getStudentPassword(STUDENT_SIS_1)
            ).to.be.revertedWith("Solo el estudiante puede obtener la contrasenia");
        });
    });

    describe("requestKardex", function () {
        beforeEach(async function () {
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
        });

        it("Debe permitir solicitar kardex con pago", async function () {
            const paymentAmount = ethers.parseEther("0.1");
            const initialBalance = await ethers.provider.getBalance(owner.address);

            await expect(
                credentialContract.connect(student1).requestKardex(STUDENT_SIS_1, { value: paymentAmount })
            ).to.emit(credentialContract, "RequestKardex")
             .withArgs(STUDENT_SIS_1, student1.address, await time.latest() + 1);

            const finalBalance = await ethers.provider.getBalance(owner.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });

        it("No debe permitir solicitar sin pago", async function () {
            await expect(
                credentialContract.connect(student1).requestKardex(STUDENT_SIS_1, { value: 0 })
            ).to.be.revertedWith("Pago requerido");
        });

        it("No debe permitir SIS code vacío", async function () {
            await expect(
                credentialContract.connect(student1).requestKardex(INVALID_SIS, { value: ethers.parseEther("0.1") })
            ).to.be.revertedWith("El codigo SIS no puede estar vacio");
        });

        it("No debe permitir estudiante inexistente", async function () {
            await expect(
                credentialContract.connect(student1).requestKardex("SISXXX", { value: ethers.parseEther("0.1") })
            ).to.be.revertedWith("El estudiante no existe");
        });

        it("Solo el estudiante propietario puede solicitar kardex", async function () {
            await expect(
                credentialContract.connect(student2).requestKardex(STUDENT_SIS_1, { value: ethers.parseEther("0.1") })
            ).to.be.revertedWith("Solo el estudiante puede solicitar el kardex");
        });
    });

    describe("verifyWalletToSIS", function () {
        beforeEach(async function () {
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
        });

        it("Debe retornar el SIS code correcto para una wallet", async function () {
            const sisCode = await credentialContract.verifyWalletToSIS(student1.address);
            expect(sisCode).to.equal(STUDENT_SIS_1);
        });

        it("No debe permitir wallet inexistente", async function () {
            await expect(
                credentialContract.verifyWalletToSIS(student2.address)
            ).to.be.revertedWith("El estudiante no existe");
        });
    });

    describe("Flujo completo", function () {
        it("Debe ejecutar un flujo completo de credencial", async function () {
            // 1. Emitir credencial
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
            
            // 2. Estudiante establece contraseña
            await credentialContract.connect(student1).setStudentPassword(STUDENT_SIS_1, PASSWORD_HASH);
            
            // 3. Owner establece IPFS hash
            await credentialContract.connect(owner).setIPFSHash(STUDENT_SIS_1, IPFS_HASH);
            
            // 4. Verificar datos del estudiante
            const student = await credentialContract.students(STUDENT_SIS_1);
            expect(student.codSIS).to.equal(STUDENT_SIS_1);
            expect(student.walletAddress).to.equal(student1.address);
            expect(student.passwordHash).to.equal(PASSWORD_HASH);
            expect(student.ipfsHash).to.equal(IPFS_HASH);
            
            // 5. Solicitar kardex
            const paymentAmount = ethers.parseEther("0.1");
            await credentialContract.connect(student1).requestKardex(STUDENT_SIS_1, { value: paymentAmount });
            
            // 6. Verificar mapeo wallet -> SIS
            expect(await credentialContract.verifyWalletToSIS(student1.address)).to.equal(STUDENT_SIS_1);
        });
    });

    describe("Seguridad y Edge Cases", function () {
        it("Debe manejar múltiples estudiantes correctamente", async function () {
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_1, student1.address);
            await credentialContract.connect(owner).emitCredential(STUDENT_SIS_2, student2.address);
            
            expect(await credentialContract.verifyWalletToSIS(student1.address)).to.equal(STUDENT_SIS_1);
            expect(await credentialContract.verifyWalletToSIS(student2.address)).to.equal(STUDENT_SIS_2);
        });

        it("Debe fallar al transferir ownership a address(0)", async function () {
            await expect(
                credentialContract.connect(owner).transferOwnership(ethers.ZeroAddress)
            ).to.be.revertedWithCustomError(credentialContract, "OwnableInvalidOwner");
        });
    });
});

// Utilidad para manejar tiempo en tests
const time = {
    latest: async () => {
        const block = await ethers.provider.getBlock("latest");
        return block.timestamp;
    }
};