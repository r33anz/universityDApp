import { ethers } from 'ethers';
import CredentialManagement from '../../infraestructure/blockchain/contracts/CredentialManagementContract.js';
import StudentService from './StudentService.js';

class CredentialManagementService{

    async emmitCredential(studentSIS) {
         const {address, menomic } 
            = this.#generateCredentials();

        try{
            const tx = await CredentialManagement.emmitCredential(studentSIS,address);
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
    }

    async getAddressBySIS(sisCode) {

    }
}

export default new CredentialManagementService();