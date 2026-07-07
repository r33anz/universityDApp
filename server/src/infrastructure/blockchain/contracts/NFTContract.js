import wallet from "../blockchainConnection.js";
import abiNFT from "../abi/abiNFT.js";
import { ethers } from "ethers";
import config from "../../config/env.js";
import { withContractErrors, awaitReceipt } from "./withContractErrors.js";

class NFTContract {
    constructor() {
        this.contractAddress = config.blockchain.contractNFT;
        this.ABI = abiNFT;
        this.contract = new ethers.Contract(this.contractAddress, this.ABI, wallet);
    }

    mintStudentKardex(studentAddress, sisCode, mfsCid, metadataURI) {
        if (!ethers.isAddress(studentAddress)) throw new Error("Dirección estudiante inválida");
        if (!sisCode) throw new Error("Student ID vacío");
        if (!metadataURI) throw new Error("Metadata URI vacío");
        if (!mfsCid) throw new Error("IPFS CID vacío");

        return withContractErrors("mintStudentKardex", async () => {
            const tx = await this.contract.mintStudentKardex(studentAddress, sisCode, mfsCid, metadataURI);
            await awaitReceipt(tx);
            return true;
        });
    }

    updateProgress(studentAddress, newMfsCid, newMetadataURI) {
        return withContractErrors("updateStudentProgress", async () => {
            const tx = await this.contract.updateStudentProgress(studentAddress, newMfsCid, newMetadataURI);
            await awaitReceipt(tx);
            return true;
        });
    }

    hasKardex(studentAddress) {
        return withContractErrors("hasKardex", async () => {
            return await this.contract.hasKardex(studentAddress);
        });
    }
}

export default new NFTContract();
