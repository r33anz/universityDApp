import StudentService from "../../services/StudentService.js"
import StudentError from "../../../interface/error/studentErrors.js";
import CredentialManagementService from "../../services/CredentialManagementService.js";
import { ethers } from "ethers";
import config from "../../../infrastructure/config/env.js";
class UseCaseEmitStudentCredential{

    async emitCredential(sisCode){
        const student = await StudentService.verifyStudentInDB(sisCode);
        if(!student){
            throw StudentError.notFound(
                    "Código SIS no encontrado",
                    { sisCode },
                    "STUDENT_NOT_FOUND");
        }

        const hasCredential = await StudentService.hasCredential(sisCode);
        if (hasCredential) {
            throw StudentError.conflict(
                    "Ya se le asignó una credencial",
                    { sisCode },
                    "CREDENTIAL_ALREADY_EXISTS")
        }

        try {
            const {mnemonic} =
                await CredentialManagementService.emitCredential(student.codSIS);

                return {
                id: student.id,
                codSIS: student.codSIS,
                mnemonic: mnemonic
            };
        } catch (error) {
                console.error(error);
                throw StudentError.internal(
                    "Error emitiendo credencial",
                    { sisCode },
                    "CREDENTIAL_EMISSION_ERROR");
            }

    }

     async verifyByWallet(walletAddress) {

        if (!this.isValidEthereumAddress(walletAddress)) {
            throw StudentError.invalidInput(
                "Dirección de wallet inválida",
                { walletAddress },
                "INVALID_WALLET_ADDRESS"
            );
        }
        try {
            const sisCode = await CredentialManagementService.getSISCodeByWallet(walletAddress);
            
            if (!sisCode || sisCode === "") {
                return {
                    isValid: false,
                    walletAddress: walletAddress,
                    message: "La dirección de wallet no pertenece a ningún estudiante de la Universidad San Simón"
                };
            }

            const studentAddress = await CredentialManagementService.getAddressBySIS(sisCode);
            return {
                isValid: true,
                walletAddress: walletAddress,
                sisCode: sisCode,
                studentAddress: studentAddress,
                message: "Estudiante verificado correctamente",
                links: {
                    nftTransfers: `${config.blockchain.scannerBaseUrl}/address/${walletAddress}#nfttransfers`,
                    contractVerification: `${config.blockchain.scannerBaseUrl}/readContract?m=light&a=${config.blockchain.contractNFT}&n=bsc&v=${config.blockchain.contractNFT}#`,
                }
            };

        } catch (error) {
            console.error("Error en verificación por wallet:", error);
            
            if (error.message.includes("El estudiante no existe")) {
                return {
                    isValid: false,
                    walletAddress: walletAddress,
                    message: "La dirección de wallet no pertenece a ningún estudiante registrado"
                };
            }
            
            throw StudentError.internal(
                "Error al verificar la dirección de wallet",
                { walletAddress },
                "WALLET_VERIFICATION_ERROR"
            );
        }
    }

    isValidEthereumAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch (error) {
            console.error("Error validando dirección Ethereum:", error);
            return false;
        }
    }
}

export default new UseCaseEmitStudentCredential();