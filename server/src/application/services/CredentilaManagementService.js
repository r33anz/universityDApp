import { ethers } from 'ethers';
import CredentialManagement from '../../infraestructure/blockchain/contracts/CredentialManagementContract.js';
import StudentService from './StudentService.js';

class CredentialManagementService{

    async emmitCredential(studentSIS) {
         const {address, menomic, publicKey } 
            = this.#generateCredentials();

        try{
            const tx = await CredentialManagement.emmitCredential(studentSIS,address, publicKey);
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
        const publicKey = walletGenerate.publicKey;

        return {
            address,
            menomic,
            publicKey
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
}

export default new CredentialManagementService();