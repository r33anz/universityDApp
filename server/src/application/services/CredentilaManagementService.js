import { ethers } from 'ethers';
import CredentialManagement from '../../infraestructure/blockchain/contracts/CredentialManagementContract.js';
import StudentService from './StudentService.js';
import wallet from '../../infraestructure/blockchain/blockchainConnetion.js';

class CredentialManagementService{

    async emitCredential(studentSIS) {
         const {address, menomic } 
            = this.#generateCredentials();

        try{
            const tx = await CredentialManagement.emitCredential(studentSIS,address);
            if(tx){
                StudentService.assignedCredential(studentSIS);
                await this.alocateBalance(address);
            }
        }catch(error){

        }

        return {mnemonic: menomic};
    }

    #generateCredentials() {
        const walletGenerate = ethers.Wallet.createRandom();
        const address = walletGenerate.address;
        const menomic = walletGenerate.mnemonic.phrase;

        return {
            address,
            menomic
        }
    }

    async alocateBalance(studentAddress) {
        const amountInEther = "0.01"

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
}

export default new CredentialManagementService();