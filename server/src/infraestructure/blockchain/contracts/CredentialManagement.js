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
        const {address, menomic, publicKey } 
            = this.#generateCredentials();
        
            try {
                const tx = await this.contract.emmitCredential(studentSIS, address, publicKey);
                await tx.wait();

                this.studentService.assignedCredential(studentSIS);
                await this.alocateBalance(address);

                return {mnemonic: menomic};
            } catch (error) {
                console.error(error);z
                throw new Error("Error emitiendo credencial");
            }
    }

    async setIPFSHash(siscode,hash){
        try {
            const tx = await this.contract.setIPFSHash(siscode,hash);
            await tx.wait();

        } catch (error) {
            console.error(error);z
            throw new Error("Error seteando el hash");
        }
    }

    async alocateBalance(studentAddress) {
        const amountInEther = "0.01"

        const tx = await wallet.sendTransaction({
            to: studentAddress,
            value: ethers.parseEther(amountInEther)
        });

        await tx.wait();
        console.log("Balance alocated");
    }

    #generateCredentials() {
        const walletGenerate = ethers.Wallet.createRandom();
        const address = walletGenerate.address;
        const menomic = walletGenerate.mnemonic.phrase;
        const publicKey = walletGenerate.publicKey;

        return {
            address,
            menomic,
            publicKey
        }
    }
}

export default new CredentialManagement();