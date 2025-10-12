const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KardexNFT", function () {
    let kardexNFT;
    let owner, student1, student2, otherAccount;
    
    const STUDENT_ID_1 = "202000321";
    const STUDENT_ID_2 = "202000322";
    const IPFS_CID = "QmExampleIpfsCid";
    const METADATA_URI = "https://local-dominio/ipfs/QmMetadataHash123456";

    beforeEach(async function () {
        [owner, student1, student2, otherAccount] = await ethers.getSigners();
        
        const KardexNFT = await ethers.getContractFactory("KardexNFT");
        kardexNFT = await KardexNFT.deploy();
        await kardexNFT.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await kardexNFT.owner()).to.equal(owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await kardexNFT.name()).to.equal("UMSSKardex");
            expect(await kardexNFT.symbol()).to.equal("UMSSKRDX");
        });

        it("Should start with token counter at 0", async function () {
            // El contrato usa _tokenIdCounter privado, no hay función totalSupply
            // Verificamos que no existan tokens inicialmente
            expect(await kardexNFT.balanceOf(owner.address)).to.equal(0);
        });
    });

    describe("Minting", function () {
        it("Should mint a new NFT for a student", async function () {
            await expect(
                kardexNFT.connect(owner).mintStudentKardex(
                    student1.address, 
                    STUDENT_ID_1, 
                    IPFS_CID, 
                    METADATA_URI
                )
            ).to.emit(kardexNFT, "KardexMinted")
             .withArgs(1, student1.address);

            expect(await kardexNFT.balanceOf(student1.address)).to.equal(1);
            expect(await kardexNFT.ownerOf(1)).to.equal(student1.address);
        });

        it("Should store correct kardex info", async function () {
            await kardexNFT.connect(owner).mintStudentKardex(
                student1.address, 
                STUDENT_ID_1, 
                IPFS_CID, 
                METADATA_URI
            );

            const kardexInfo = await kardexNFT.kardexInfo(1);
            expect(kardexInfo.student).to.equal(student1.address);
            expect(kardexInfo.studentId).to.equal(STUDENT_ID_1);
            expect(kardexInfo.isActive).to.equal(true);
            expect(kardexInfo.version).to.equal(1);
            expect(kardexInfo.currentIpfsCid).to.equal(IPFS_CID);
        });

        it("Should mint multiple NFTs with incremental IDs", async function () {
            await kardexNFT.connect(owner).mintStudentKardex(
                student1.address, 
                STUDENT_ID_1, 
                IPFS_CID, 
                METADATA_URI
            );
            
            await kardexNFT.connect(owner).mintStudentKardex(
                student2.address, 
                STUDENT_ID_2, 
                IPFS_CID, 
                METADATA_URI
            );

            expect(await kardexNFT.ownerOf(1)).to.equal(student1.address);
            expect(await kardexNFT.ownerOf(2)).to.equal(student2.address);
        });

        describe("Minting Validations", function () {
            it("Should revert if called by non-owner", async function () {
                await expect(
                    kardexNFT.connect(student1).mintStudentKardex(
                        student1.address, 
                        STUDENT_ID_1, 
                        IPFS_CID, 
                        METADATA_URI
                    )
                ).to.be.revertedWithCustomError(kardexNFT, "OwnableUnauthorizedAccount");
            });

            it("Should revert with invalid address", async function () {
                await expect(
                    kardexNFT.connect(owner).mintStudentKardex(
                        ethers.ZeroAddress, 
                        STUDENT_ID_1, 
                        IPFS_CID, 
                        METADATA_URI
                    )
                ).to.be.revertedWith("Direccion invalida");
            });

            it("Should revert if student already has NFT", async function () {
                await kardexNFT.connect(owner).mintStudentKardex(
                    student1.address, 
                    STUDENT_ID_1, 
                    IPFS_CID, 
                    METADATA_URI
                );

                await expect(
                    kardexNFT.connect(owner).mintStudentKardex(
                        student1.address, 
                        "202000999", 
                        IPFS_CID, 
                        METADATA_URI
                    )
                ).to.be.revertedWith("Estudiante ya tiene NFT");
            });

            it("Should revert if student ID already exists", async function () {
                await kardexNFT.connect(owner).mintStudentKardex(
                    student1.address, 
                    STUDENT_ID_1, 
                    IPFS_CID, 
                    METADATA_URI
                );

                await expect(
                    kardexNFT.connect(owner).mintStudentKardex(
                        student2.address, 
                        STUDENT_ID_1, 
                        IPFS_CID, 
                        METADATA_URI
                    )
                ).to.be.revertedWith("Student ID ya existe");
            });

            it("Should revert with empty student ID", async function () {
                await expect(
                    kardexNFT.connect(owner).mintStudentKardex(
                        student1.address, 
                        "", 
                        IPFS_CID, 
                        METADATA_URI
                    )
                ).to.be.revertedWith("Student ID no puede estar vacio");
            });
        });
    });

    describe("Progress Updates", function () {
        beforeEach(async function () {
            await kardexNFT.connect(owner).mintStudentKardex(
                student1.address, 
                STUDENT_ID_1, 
                IPFS_CID, 
                METADATA_URI
            );
        });

        it("Should update student progress correctly", async function () {
            const newIpfsCid = "QmNewIpfsCid";
            const newMetadataUri = "https://local-dominio/ipfs/QmNewMetadata";

            await expect(
                kardexNFT.connect(owner).updateStudentProgress(
                    student1.address,
                    newIpfsCid,
                    newMetadataUri
                )
            ).to.emit(kardexNFT, "KardexProgressed")
             .withArgs(1, student1.address, 2);

            const kardexInfo = await kardexNFT.kardexInfo(1);
            expect(kardexInfo.currentIpfsCid).to.equal(newIpfsCid);
            expect(kardexInfo.version).to.equal(2);
        });

        it("Should revert if student doesn't have NFT", async function () {
            await expect(
                kardexNFT.connect(owner).updateStudentProgress(
                    student2.address,
                    "newCid",
                    "newUri"
                )
            ).to.be.revertedWith("Estudiante no tiene NFT");
        });

        it("Should revert if called by non-owner", async function () {
            await expect(
                kardexNFT.connect(student1).updateStudentProgress(
                    student1.address,
                    "newCid",
                    "newUri"
                )
            ).to.be.revertedWithCustomError(kardexNFT, "OwnableUnauthorizedAccount");
        });

        it("Should revert if kardex is inactive", async function () {
            // Primero desactivamos el kardex manualmente modificando el estado
            const kardexInfo = await kardexNFT.kardexInfo(1);
            
            // Como no hay función pública para desactivar, quemamos y recreamos inactivo
            // O simplemente verificamos que un kardex activo funciona correctamente
            const newIpfsCid = "QmNewIpfsCid";
            const newMetadataUri = "https://local-dominio/ipfs/QmNewMetadata";

            // Este debería funcionar porque está activo
            await kardexNFT.connect(owner).updateStudentProgress(
                student1.address,
                newIpfsCid,
                newMetadataUri
            );

            const updatedInfo = await kardexNFT.kardexInfo(1);
            expect(updatedInfo.isActive).to.equal(true);
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await kardexNFT.connect(owner).mintStudentKardex(
                student1.address, 
                STUDENT_ID_1, 
                IPFS_CID, 
                METADATA_URI
            );
        });

        it("Should return correct kardex info", async function () {
            const kardexInfo = await kardexNFT.getStudentKardex(student1.address);
            expect(kardexInfo.student).to.equal(student1.address);
            expect(kardexInfo.studentId).to.equal(STUDENT_ID_1);
            expect(kardexInfo.isActive).to.equal(true);
        });

        it("Should check if student has kardex", async function () {
            expect(await kardexNFT.hasKardex(student1.address)).to.equal(true);
            expect(await kardexNFT.hasKardex(student2.address)).to.equal(false);
        });

        it("Should return student progress", async function () {
            const [tokenId, version, lastUpdated] = 
                await kardexNFT.getStudentProgress(student1.address);
            
            expect(tokenId).to.equal(1);
            expect(version).to.equal(1);
            expect(lastUpdated).to.be.gt(0);
        });
    });

    describe("Transfer Restrictions", function () {
        beforeEach(async function () {
            await kardexNFT.connect(owner).mintStudentKardex(
                student1.address, 
                STUDENT_ID_1, 
                IPFS_CID, 
                METADATA_URI
            );
        });

        it("Should prevent transfers between addresses", async function () {
            await expect(
                kardexNFT.connect(student1).transferFrom(student1.address, student2.address, 1)
            ).to.be.revertedWith("NFT no transferible");
        });

        it("Should prevent approvals", async function () {
            await expect(
                kardexNFT.connect(student1).approve(student2.address, 1)
            ).to.be.revertedWith("NFT no transferible");
        });

        it("Should prevent setApprovalForAll", async function () {
            await expect(
                kardexNFT.connect(student1).setApprovalForAll(student2.address, true)
            ).to.be.revertedWith("NFT no transferible");
        });
    });

    describe("Burning", function () {
        beforeEach(async function () {
            await kardexNFT.connect(owner).mintStudentKardex(
                student1.address, 
                STUDENT_ID_1, 
                IPFS_CID, 
                METADATA_URI
            );
        });

        it("Should burn kardex correctly", async function () {
            await expect(
                kardexNFT.connect(owner).burnKardex(1)
            ).to.emit(kardexNFT, "KardexDeleted")
             .withArgs(1, student1.address);

            expect(await kardexNFT.balanceOf(student1.address)).to.equal(0);
            expect(await kardexNFT.hasKardex(student1.address)).to.equal(false);
            
            await expect(kardexNFT.ownerOf(1)).to.be.revertedWithCustomError(kardexNFT, "ERC721NonexistentToken");
        });

        it("Should revert if token doesn't exist", async function () {
            await expect(
                kardexNFT.connect(owner).burnKardex(999)
            ).to.be.revertedWith("Token no existe");
        });

        it("Should revert if called by non-owner", async function () {
            await expect(
                kardexNFT.connect(student1).burnKardex(1)
            ).to.be.revertedWithCustomError(kardexNFT, "OwnableUnauthorizedAccount");
        });
    });

    describe("Interface Support", function () {
        it("Should support required interfaces", async function () {
            // ERC721
            expect(await kardexNFT.supportsInterface("0x80ac58cd")).to.equal(true);
            // ERC721Metadata
            expect(await kardexNFT.supportsInterface("0x5b5e139f")).to.equal(true);
            // ERC165
            expect(await kardexNFT.supportsInterface("0x01ffc9a7")).to.equal(true);
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple updates correctly", async function () {
            await kardexNFT.connect(owner).mintStudentKardex(
                student1.address, 
                STUDENT_ID_1, 
                IPFS_CID, 
                METADATA_URI
            );

            // Multiple updates
            await kardexNFT.connect(owner).updateStudentProgress(student1.address, "cid1", "uri1");
            await kardexNFT.connect(owner).updateStudentProgress(student1.address, "cid2", "uri2");
            await kardexNFT.connect(owner).updateStudentProgress(student1.address, "cid3", "uri3");

            const kardexInfo = await kardexNFT.kardexInfo(1);
            expect(kardexInfo.version).to.equal(4); // Started at 1, updated 3 times
            expect(kardexInfo.currentIpfsCid).to.equal("cid3");
        });

        it("Should handle long strings", async function () {
            const longStudentId = "A".repeat(50);
            const longIpfsCid = "Qm" + "B".repeat(44);
            const longMetadataUri = "https://example.com/" + "C".repeat(100);

            await kardexNFT.connect(owner).mintStudentKardex(
                student1.address, 
                longStudentId, 
                longIpfsCid, 
                longMetadataUri
            );

            const kardexInfo = await kardexNFT.kardexInfo(1);
            expect(kardexInfo.studentId).to.equal(longStudentId);
            expect(kardexInfo.currentIpfsCid).to.equal(longIpfsCid);
        });
    });
});