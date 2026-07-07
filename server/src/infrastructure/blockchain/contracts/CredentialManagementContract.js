import wallet from "../blockchainConnection.js";
import abiCredentialManagement from "../abi/abiCredentialManagement.js";
import { ethers } from "ethers";
import config from "../../config/env.js";
import { withContractErrors, awaitReceipt } from "./withContractErrors.js";

class CredentialManagement {
    constructor() {
        this.contractAddress = config.blockchain.contractCredentialManagement;
        this.ABI = abiCredentialManagement;
        this.contract = new ethers.Contract(this.contractAddress, this.ABI, wallet);
    }

    emitCredential(studentSIS, address) {
        return withContractErrors("emitCredential", async () => {
            const tx = await this.contract.emitCredential(studentSIS, address);
            await awaitReceipt(tx);
            return true;
        });
    }

    setIPFSHash(siscode, hash) {
        return withContractErrors("setIPFSHash", async () => {
            const tx = await this.contract.setIPFSHash(siscode, hash);
            await awaitReceipt(tx);
        });
    }

    getAddress(sisCode) {
        return withContractErrors("getStudentAddressBySISCode", async () => {
            return await this.contract.getStudentAddressBySISCode(sisCode);
        });
    }

    markKardexAsDelivered(sisCode) {
        return withContractErrors("markKardexAsDelivered", async () => {
            const tx = await this.contract.markKardexAsDelivered(sisCode);
            await awaitReceipt(tx);
            return true;
        });
    }

    verifyWalletToSIS(walletAddress) {
        return withContractErrors("verifyWalletToSIS", async () => {
            return await this.contract.verifyWalletToSIS(walletAddress);
        });
    }
}

export default new CredentialManagement();
