import wallet from "../blockchainConnetion.js";
import abiCredentialManagement from "../abi/abiCredentialManagement.js";
import { ethers } from "ethers";
import envConfig from "../../../envConfig.js";
import StudentService from "../../../application/services/StudentService.js";

class CredentialManagement {
    constructor() {
        this.contractAddress = envConfig.CONTRACT_ADDRESS_STUDENT_MANAGEMENT_CREDENTIALS || "";
        this.ABI = abiCredentialManagement
        this.contract = new ethers.Contract(this.contractAddress, this.ABI, wallet);
        this.studentService = StudentService;
    }

    async emmitCredential(studentSIS) {
        const { address, menomic, publicKey } 
            = this.#generateCredentials();
        
            try {
                const tx = await this.contract.emmitCredential(studentSIS, address, 
                    publicKey);
                this.studentService.assignedCredential(studentSIS);
                await tx.wait();

                return {mnemonic: menomic};
            } catch (error) {
                console.error(error);
                throw new Error("Error emitiendo credencial");
            }
    }

    #generateCredentials() {
        const wallet = ethers.Wallet.createRandom();
        const address = wallet.address;
        const menomic = wallet.mnemonic.phrase;
        const publicKey = wallet.publicKey;

        return {
            address,
            menomic,
            publicKey
        }
    }
}

export default new CredentialManagement();