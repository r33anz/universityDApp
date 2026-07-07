import { ethers } from 'ethers';
import CredentialManagement from '../../infrastructure/blockchain/contracts/CredentialManagementContract.js';
import StudentService from './StudentService.js';
import wallet from '../../infrastructure/blockchain/blockchainConnection.js';

class CredentialManagementService{

    async emitCredential(studentSIS) {
        const { address, mnemonic } = this.#generateCredentials();

        const tx = await CredentialManagement.emitCredential(studentSIS, address);
        if (tx) {
            await StudentService.assignedCredential(studentSIS);
            await this.allocateBalance(address);
        }

        return { mnemonic };
    }

    #generateCredentials() {
        const walletGenerate = ethers.Wallet.createRandom();
        const address = walletGenerate.address;
        const mnemonic = walletGenerate.mnemonic.phrase;

        return {
            address,
            mnemonic
        }
    }

    async allocateBalance(studentAddress) {
        const amountInEther = "0.0008"

        const tx = await wallet.sendTransaction({
            to: studentAddress,
            value: ethers.parseEther(amountInEther)
        });

        await tx.wait();
        console.log(`Allocated ${amountInEther} ETH to ${studentAddress}`);
    }

    async getAddressBySIS(sisCode) {
        try {
            const address = await CredentialManagement.getAddress(sisCode);
            return address;
        } catch (error) {
            console.error("Error al obtener la dirección por SIS:", error);
            throw new Error("No se pudo obtener la dirección del estudiante");
        }
    }

    async getSISCodeByWallet(walletAddress) {
        try {
            const sisCode = await CredentialManagement.verifyWalletToSIS(walletAddress);
            return sisCode;
        } catch (error) {
            console.error("Error al obtener SIS por wallet:", error);
            // Si el contrato lanza error porque no existe, capturamos y retornamos null
            if (error.reason && error.reason.includes("El estudiante no existe")) {
                return null;
            }
            throw error;
        }
    }
}

export default new CredentialManagementService();