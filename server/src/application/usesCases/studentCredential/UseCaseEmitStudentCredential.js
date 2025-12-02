import StudentService from "../../services/StudentService.js"
import StudentSerror from "../../../interface/error/studentErrors.js";
import CredentilaManagementService from "../../services/CredentilaManagementService.js";
import { ethers } from "ethers";
import envConfig from "../../../envConfig.js";
class UseCaseEmitStudentCredential{

    async emitCredential(sisCode){
        const student = await StudentService.veryfyStudentInDB(sisCode);
        if(!student){
            throw StudentSerror.notFound(
                    "Código SIS no encontrado",
                    { sisCode }, 
                    "STUDENT_NOT_FOUND");
        }

        const hasCredential = await StudentService.hasCredential(sisCode);
        if (hasCredential) {
            throw StudentSerror.conflict(
                    "Ya se le asignó una credencial", 
                    { sisCode }, 
                    "CREDENTIAL_ALREADY_EXISTS")
        }
        
        try {
            const {mnemonic} = 
                await CredentilaManagementService.emitCredential(student.codSIS);
                
                return {
                id: student.id,
                codSIS: student.codSIS,
                mnemonic: mnemonic
            };
        } catch (error) {
                console.error(error);
                throw StudentSerror.internal(
                    "Error emitiendo credencial", 
                    { sisCode }, 
                    "CREDENTIAL_EMISSION_ERROR");
            }
        
    }

     async verifyByWallet(walletAddress) {

        if (!this.isValidEthereumAddress(walletAddress)) {
            throw StudentSerror.invalidInput(
                "Dirección de wallet inválida",
                { walletAddress },
                "INVALID_WALLET_ADDRESS"
            );
        }
        try {
            const sisCode = await CredentilaManagementService.getSISCodeByWallet(walletAddress);
            
            if (!sisCode || sisCode === "") {
                return {
                    isValid: false,
                    walletAddress: walletAddress,
                    message: "La dirección de wallet no pertenece a ningún estudiante de la Universidad San Simón"
                };
            }

            const studentAddress = await CredentilaManagementService.getAddressBySIS(sisCode);
            return {
                isValid: true,
                walletAddress: walletAddress,
                sisCode: sisCode,
                studentAddress: studentAddress,
                message: "Estudiante verificado correctamente",
                links: {
                    nftTransfers: `https://testnet.bscscan.com/address/${walletAddress}#nfttransfers`,
                    contractVerification: `https://testnet.bscscan.com/readContract?m=light&a=${envConfig.CONTRACT_ADDRESS_NFT}&n=bsc&v=${envConfig.CONTRACT_ADDRESS_NFT}#`
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
            
            throw StudentSerror.internal(
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