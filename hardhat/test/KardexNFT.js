const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KardexNFT", function () {
    let KardexNFT, kardex;
    let owner, student1, student2, other;
    const studentId1 = "202000321";
    const studentId2 = "202000322";
    const ipfsCid = "QmExampleIpfsCid";
    const metadataUri = "https://local-dominio/ipfs/QmMetadataHash123456";

    beforeEach(async function () {
        [owner, student1, student2, other] = await ethers.getSigners();
        KardexNFT = await ethers.getContractFactory("KardexNFT");
        kardex = await KardexNFT.deploy();
        await kardex.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await kardex.owner()).to.equal(owner.address);
        });

        it("Should have correct name and symbol", async function () {
            expect(await kardex.name()).to.equal("UMSSKardex");
            expect(await kardex.symbol()).to.equal("UMSSKRDX");
        });

        it("Should start with token counter at 0", async function () {
            // No hay getter público para _tokenIdCounter, pero podemos verificar indirectamente
            expect(await kardex.hasKardex(student1.address)).to.be.false;
        });
    });

    describe("Minting", function () {
        it("Should mint a new NFT for a student", async function () {
            const tx = await kardex.connect(owner).mintStudentKardex(
                student1.address,
                studentId1,
                5,
                ipfsCid,
                metadataUri
            );

            await expect(tx)
                .to.emit(kardex, "KardexMinted")
                .withArgs(1, student1.address);

            const tokenId = 1;
            expect(await kardex.studentToToken(student1.address)).to.equal(tokenId);
            expect(await kardex.studentIdToToken(studentId1)).to.equal(tokenId);
            expect(await kardex.ownerOf(tokenId)).to.equal(student1.address);
            expect(await kardex.tokenURI(tokenId)).to.equal(metadataUri);
        });

        it("Should store correct kardex info", async function () {
            await kardex.connect(owner).mintStudentKardex(
                student1.address,
                studentId1,
                5,
                ipfsCid,
                metadataUri
            );

            const kinfo = await kardex.getStudentKardex(student1.address);
            expect(kinfo.student).to.equal(student1.address);
            expect(kinfo.studentId).to.equal(studentId1);
            expect(kinfo.totalSubjects).to.equal(5);
            expect(kinfo.currentIpfsCid).to.equal(ipfsCid);
            expect(kinfo.isActive).to.be.true;
            expect(kinfo.version).to.equal(1);
        });

        it("Should mint multiple NFTs with incremental IDs", async function () {
            await kardex.connect(owner).mintStudentKardex(
                student1.address, studentId1, 5, ipfsCid, metadataUri
            );
            await kardex.connect(owner).mintStudentKardex(
                student2.address, studentId2, 3, ipfsCid, metadataUri
            );

            expect(await kardex.studentToToken(student1.address)).to.equal(1);
            expect(await kardex.studentToToken(student2.address)).to.equal(2);
        });

        describe("Minting Validations", function () {
            it("Should revert if called by non-owner", async function () {
                await expect(
                    kardex.connect(student1).mintStudentKardex(
                        student1.address, studentId1, 5, ipfsCid, metadataUri
                    )
                ).to.be.revertedWithCustomError(kardex, "OwnableUnauthorizedAccount");
            });

            it("Should revert with invalid address", async function () {
                await expect(
                    kardex.connect(owner).mintStudentKardex(
                        ethers.ZeroAddress, studentId1, 5, ipfsCid, metadataUri
                    )
                ).to.be.revertedWith("Direccion invalida");
            });

            it("Should revert if student already has NFT", async function () {
                await kardex.connect(owner).mintStudentKardex(
                    student1.address, studentId1, 5, ipfsCid, metadataUri
                );

                await expect(
                    kardex.connect(owner).mintStudentKardex(
                        student1.address, studentId2, 3, ipfsCid, metadataUri
                    )
                ).to.be.revertedWith("Estudiante ya tiene NFT");
            });

            it("Should revert if student ID already exists", async function () {
                await kardex.connect(owner).mintStudentKardex(
                    student1.address, studentId1, 5, ipfsCid, metadataUri
                );

                await expect(
                    kardex.connect(owner).mintStudentKardex(
                        student2.address, studentId1, 3, ipfsCid, metadataUri
                    )
                ).to.be.revertedWith("Student ID ya existe");
            });

            it("Should revert with zero subjects", async function () {
                await expect(
                    kardex.connect(owner).mintStudentKardex(
                        student1.address, studentId1, 0, ipfsCid, metadataUri
                    )
                ).to.be.revertedWith("Debe tener materias");
            });

            it("Should revert with empty student ID", async function () {
                await expect(
                    kardex.connect(owner).mintStudentKardex(
                        student1.address, "", 5, ipfsCid, metadataUri
                    )
                ).to.be.revertedWith("Student ID no puede estar vacio");
            });
        });
    });

    describe("Progress Updates", function () {
        beforeEach(async function () {
            await kardex.connect(owner).mintStudentKardex(
                student1.address, studentId1, 5, ipfsCid, metadataUri
            );
        });

        it("Should update student progress correctly", async function () {
            const newIpfsCid = "QmNewExampleIpfsCid";
            const newMetadataUri = "https://local-dominio/ipfs/QmNewMetadataHash";

            const tx = await kardex.connect(owner).updateStudentProgress(
                student1.address, 8, newIpfsCid, newMetadataUri
            );

            await expect(tx)
                .to.emit(kardex, "KardexProgressed")
                .withArgs(1, student1.address, 2);

            const kinfo = await kardex.getStudentKardex(student1.address);
            expect(kinfo.totalSubjects).to.equal(8);
            expect(kinfo.currentIpfsCid).to.equal(newIpfsCid);
            expect(kinfo.version).to.equal(2);
            expect(await kardex.tokenURI(1)).to.equal(newMetadataUri);
        });

        it("Should allow same number of subjects (no regression)", async function () {
            await expect(
                kardex.connect(owner).updateStudentProgress(
                    student1.address, 5, "newCid", "newUri"
                )
            ).to.not.be.reverted;

            const kinfo = await kardex.getStudentKardex(student1.address);
            expect(kinfo.totalSubjects).to.equal(5);
            expect(kinfo.version).to.equal(2);
        });

        describe("Progress Update Validations", function () {
            it("Should revert if called by non-owner", async function () {
                await expect(
                    kardex.connect(student1).updateStudentProgress(
                        student1.address, 8, "newCid", "newUri"
                    )
                ).to.be.revertedWithCustomError(kardex, "OwnableUnauthorizedAccount");
            });

            it("Should revert if student has no NFT", async function () {
                await expect(
                    kardex.connect(owner).updateStudentProgress(
                        student2.address, 8, "newCid", "newUri"
                    )
                ).to.be.revertedWith("Estudiante no tiene NFT");
            });

            it("Should revert if trying to decrease subjects", async function () {
                await expect(
                    kardex.connect(owner).updateStudentProgress(
                        student1.address, 3, "newCid", "newUri"
                    )
                ).to.be.revertedWith("No puede retroceder");
            });
        });
    });

    describe("View Functions", function () {
        beforeEach(async function () {
            await kardex.connect(owner).mintStudentKardex(
                student1.address, studentId1, 5, ipfsCid, metadataUri
            );
        });

        it("Should return correct kardex info", async function () {
            const kinfo = await kardex.getStudentKardex(student1.address);
            expect(kinfo.student).to.equal(student1.address);
            expect(kinfo.studentId).to.equal(studentId1);
            expect(kinfo.totalSubjects).to.equal(5);
            expect(kinfo.isActive).to.be.true;
            expect(kinfo.version).to.equal(1);
        });

        it("Should return correct hasKardex status", async function () {
            expect(await kardex.hasKardex(student1.address)).to.be.true;
            expect(await kardex.hasKardex(student2.address)).to.be.false;
        });

        it("Should return correct student progress", async function () {
            const [tokenId, totalSubjects, version, lastUpdated] = 
                await kardex.getStudentProgress(student1.address);

            expect(tokenId).to.equal(1);
            expect(totalSubjects).to.equal(5);
            expect(version).to.equal(1);
            expect(lastUpdated).to.be.greaterThan(0);
        });

        it("Should revert getStudentKardex for non-existing student", async function () {
            await expect(
                kardex.getStudentKardex(student2.address)
            ).to.be.revertedWith("Estudiante no tiene NFT");
        });

        it("Should revert getStudentProgress for non-existing student", async function () {
            await expect(
                kardex.getStudentProgress(student2.address)
            ).to.be.revertedWith("Estudiante no tiene NFT");
        });
    });

    describe("Transfer Restrictions", function () {
        beforeEach(async function () {
            await kardex.connect(owner).mintStudentKardex(
                student1.address, studentId1, 5, ipfsCid, metadataUri
            );
        });

        it("Should prevent transfers between addresses", async function () {
            await expect(
                kardex.connect(student1).transferFrom(student1.address, student2.address, 1)
            ).to.be.revertedWith("NFT no transferible");
        });

        it("Should prevent safeTransferFrom", async function () {
            await expect(
                kardex.connect(student1)["safeTransferFrom(address,address,uint256)"](
                    student1.address, student2.address, 1
                )
            ).to.be.revertedWith("NFT no transferible");
        });

        it("Should prevent approve", async function () {
            await expect(
                kardex.connect(student1).approve(student2.address, 1)
            ).to.be.revertedWith("NFT no transferible");
        });
    });

    describe("Burning", function () {
        beforeEach(async function () {
            await kardex.connect(owner).mintStudentKardex(
                student1.address, studentId1, 5, ipfsCid, metadataUri
            );
        });

        it("Should burn kardex correctly", async function () {
            const tx = await kardex.connect(owner).burnKardex(1);

            await expect(tx)
                .to.emit(kardex, "KardexDeleted")
                .withArgs(1, student1.address);

            // Verify cleanups
            expect(await kardex.studentToToken(student1.address)).to.equal(0);
            expect(await kardex.studentIdToToken(studentId1)).to.equal(0);
            expect(await kardex.hasKardex(student1.address)).to.be.false;

            // Token should no longer exist
            await expect(kardex.ownerOf(1)).to.be.revertedWithCustomError(
                kardex, "ERC721NonexistentToken"
            );
        });

        it("Should allow student to mint again after burning", async function () {
            await kardex.connect(owner).burnKardex(1);

            // Should be able to mint again
            await expect(
                kardex.connect(owner).mintStudentKardex(
                    student1.address, studentId1, 3, ipfsCid, metadataUri
                )
            ).to.not.be.reverted;

            expect(await kardex.hasKardex(student1.address)).to.be.true;
        });

        describe("Burning Validations", function () {
            it("Should revert if called by non-owner", async function () {
                await expect(
                    kardex.connect(student1).burnKardex(1)
                ).to.be.revertedWithCustomError(kardex, "OwnableUnauthorizedAccount");
            });

            it("Should revert if token doesn't exist", async function () {
                await expect(
                    kardex.connect(owner).burnKardex(999)
                ).to.be.revertedWith("Token no existe");
            });
        });
    });

    describe("Interface Support", function () {
        it("Should support required interfaces", async function () {
            // ERC721
            expect(await kardex.supportsInterface("0x80ac58cd")).to.be.true;
            // ERC721Metadata
            expect(await kardex.supportsInterface("0x5b5e139f")).to.be.true;
            // ERC165
            expect(await kardex.supportsInterface("0x01ffc9a7")).to.be.true;
        });
    });

    describe("Edge Cases", function () {
        it("Should handle multiple updates correctly", async function () {
            await kardex.connect(owner).mintStudentKardex(
                student1.address, studentId1, 5, ipfsCid, metadataUri
            );

            // Multiple updates
            await kardex.connect(owner).updateStudentProgress(
                student1.address, 8, "cid2", "uri2"
            );
            await kardex.connect(owner).updateStudentProgress(
                student1.address, 12, "cid3", "uri3"
            );

            const kinfo = await kardex.getStudentKardex(student1.address);
            expect(kinfo.totalSubjects).to.equal(12);
            expect(kinfo.version).to.equal(3);
            expect(kinfo.currentIpfsCid).to.equal("cid3");
        });

        it("Should handle large subject numbers", async function () {
            const largeNumber = 1000;
            await kardex.connect(owner).mintStudentKardex(
                student1.address, studentId1, largeNumber, ipfsCid, metadataUri
            );

            const kinfo = await kardex.getStudentKardex(student1.address);
            expect(kinfo.totalSubjects).to.equal(largeNumber);
        });

        it("Should handle long strings", async function () {
            const longStudentId = "A".repeat(50);
            const longIpfsCid = "Qm" + "B".repeat(44);
            const longUri = "https://example.com/" + "C".repeat(100);

            await expect(
                kardex.connect(owner).mintStudentKardex(
                    student1.address, longStudentId, 5, longIpfsCid, longUri
                )
            ).to.not.be.reverted;

            const kinfo = await kardex.getStudentKardex(student1.address);
            expect(kinfo.studentId).to.equal(longStudentId);
            expect(kinfo.currentIpfsCid).to.equal(longIpfsCid);
        });
    });
});