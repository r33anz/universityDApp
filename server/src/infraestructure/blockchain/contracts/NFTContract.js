import wallet from "../blockchainConnetion.js";
import abiNFT from "../abi/abiNFT.js";
import { ethers } from "ethers";
import envConfig from "../../../envConfig.js";
import ContractError from "../../../interface/error/contractErrors.js";

class NFTContract {
    constructor() {
        this.contractAddress = envConfig.CONTRACT_ADDRESS_NFT || "";
        this.ABI = abiNFT;
        this.contract = new ethers.Contract(this.contractAddress, this.ABI, wallet);
    }

    async mintStudentKardex(studentAddress,sisCode,mfsCid,metadataURI){
       
        if (!ethers.isAddress(studentAddress)) throw new Error("Dirección estudiante inválida");
        if (!sisCode || sisCode.length === 0) throw new Error("Student ID vacío");
        if (!metadataURI || metadataURI.length === 0) throw new Error("Metadata URI vacío");
        if (!mfsCid || mfsCid.length === 0) throw new Error("IPFS CID vacío");
        
        try {
            const tx = await this.contract.mintStudentKardex(
                studentAddress,
                sisCode,
                mfsCid,
                metadataURI
            );
            console.log("TX:", tx);
            const receipt = await tx.wait();
            console.log("Receipt:", receipt);

            if(receipt.status === 0) {
                    throw new ContractError(
                        "Transacción revertida",
                        "TX_REVERTED",
                        { transactionHash: receipt.transactionHash }
                    );
            }

            console.log(`NFT minted for student ${sisCode}`);
            return true;
        } catch (error) {
            if (error.code === 'CALL_EXCEPTION') {
                throw new ContractError(
                    "Error en la llamada al contrato",
                    "CALL_EXCEPTION",
                    {
                        reason: error.reason,
                        method: error.method,
                        args: error.args
                    }
                );
            } else if (error.code === 'INSUFFICIENT_FUNDS') {
                throw new ContractError(
                    "Fondos insuficientes para la transacción",
                    "INSUFFICIENT_FUNDS",
                    { requiredGas: error.error?.gas }
                );
            } else if (error.code === 'NETWORK_ERROR') {
                throw new ContractError(
                    "Error de red al interactuar con la blockchain",
                    "NETWORK_ERROR",
                    { network: wallet.provider.network }
                );
            } else if (error instanceof ContractError) {
                throw error;
            } else {
                throw new ContractError(
                    "Error desconocido al interactuar con el contrato",
                    "UNKNOWN_CONTRACT_ERROR",
                    { originalError: error.message }
                );
            }
        }
    }

    async updateProgress(studentAddress,newMfsCid,newMetadataURI) {
        try {
            const tx = await this.contract.updateStudentProgress(
                studentAddress,
                newMfsCid,
                newMetadataURI
            );
            const receipt = await tx.wait();

            if (receipt.status === 0) {
                throw new ContractError(
                    "Transacción revertida",
                    "TX_REVERTED",
                    { transactionHash: receipt.transactionHash }
                );
            }

            console.log(`Progress updated for student ${studentAddress}`);
            return true;
        } catch (error) {
            if (error.code === 'CALL_EXCEPTION') {
                throw new ContractError(
                    "Error en la llamada al contrato",
                    "CALL_EXCEPTION",
                    {
                        reason: error.reason,
                        method: error.method,
                        args: error.args
                    }
                );
            } else if (error.code === 'INSUFFICIENT_FUNDS') {
                throw new ContractError(
                    "Fondos insuficientes para la transacción",
                    "INSUFFICIENT_FUNDS",
                    { requiredGas: error.error?.gas }
                );
            } else if (error.code === 'NETWORK_ERROR') {
                throw new ContractError(
                    "Error de red al interactuar con la blockchain",
                    "NETWORK_ERROR",
                    { network: wallet.provider.network }
                );
            } else if (error instanceof ContractError) {
                throw error;
            } else {
                throw new ContractError(
                    "Error desconocido al interactuar con el contrato",
                    "UNKNOWN_CONTRACT_ERROR",
                    { originalError: error.message }
                );
            }
        }

    }

    async hasKardex(studentAddress) {
        try {
            const hasKardex = await this.contract.hasKardex(studentAddress);
            return hasKardex;
        } catch (error) {
            if (error.code === 'CALL_EXCEPTION') {
                throw new ContractError(
                    "Error en la llamada al contrato",
                    "CALL_EXCEPTION",
                    {
                        reason: error.reason,
                        method: error.method,
                        args: error.args
                    }
                );
            } else if (error instanceof ContractError) {
                throw error;
            } else {
                throw new ContractError(
                    "Error desconocido al interactuar con el contrato",
                    "UNKNOWN_CONTRACT_ERROR",
                    { originalError: error.message }
                );
            }
        }
    }
}

export default new NFTContract();