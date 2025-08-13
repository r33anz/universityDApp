import wallet from "../blockchainConnetion.js";
import abiCredentialManagement from "../abi/abiCredentialManagement.js";
import { ethers } from "ethers";
import envConfig from "../../../envConfig.js";
import ContractError from "../../../interface/error/contractErrors.js";

class CredentialManagement {
    constructor() {
        this.contractAddress = envConfig.CONTRACT_ADDRESS_STUDENT_MANAGEMENT_CREDENTIALS || "";
        this.ABI = abiCredentialManagement
        this.contract = new ethers.Contract(this.contractAddress, this.ABI, wallet);
    }

    async emmitCredential(studentSIS,address) {
            try {
                const tx = await this.contract.emmitCredential(studentSIS, address);
                const receipt = await tx.wait();

                if (receipt.status === 0) {
                    throw new ContractError(
                        "Transacción revertida",
                        "TX_REVERTED",
                        { transactionHash: receipt.transactionHash }
                    );
                }

                console.log(`Credencial emitida para el estudiante ${studentSIS}`);
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

    async setIPFSHash(siscode,hash){
        try {
            const tx = await this.contract.setIPFSHash(siscode,hash);
            const receipt = await tx.wait();

            if (receipt.status === 0) {
                throw new ContractError(
                    "Transacción revertida",
                    "TX_REVERTED",
                    { transactionHash: receipt.transactionHash }
                );
            }
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
    
    async getAddress(sisCode){
        try{
            const address = await this.contract.getAddress(sisCode);
            return address;
        }catch(error) {
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
            } else if (error.code === 'NETWORK_ERROR') {
                throw new ContractError(
                    "Error de red al interactuar con la blockchain",
                    "NETWORK_ERROR",
                    { network: wallet.provider.network }
                );
            } else {
                throw new ContractError(
                    "Error desconocido al obtener la dirección del estudiante",
                    "UNKNOWN_CONTRACT_ERROR",
                    { originalError: error.message }
                );
            }
        }
    }
}

export default new CredentialManagement();