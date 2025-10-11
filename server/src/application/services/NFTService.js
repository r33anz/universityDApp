import NFTContract from "../../infraestructure/blockchain/contracts/NFTContract.js";
import CredentialManagement from "../../infraestructure/blockchain/contracts/CredentialManagementContract.js";
import { createURINFTTemplate } from "../../interface/uriNFTtemplate/URINFTTemplate.js";
import IpfsService from "./IpfsService.js";
import envConfig from "../../envConfig.js";

class NFTService{
    async manageNFT(siscode, mfsCID) {
        try {
            const address = await CredentialManagement.getAddress(siscode);
            const newURI = createURINFTTemplate(siscode, mfsCID);
            const cidJSON = await IpfsService.metadataJSON(newURI);
            const hasExistingKardex = await NFTContract.hasKardex(address);
            
            if (hasExistingKardex) {
                await NFTContract.updateProgress(address, mfsCID, `${envConfig.IPFS_GATEWAY}${cidJSON}`);
            } else {
                await NFTContract.mintStudentKardex(
                    address, 
                    siscode, 
                    mfsCID, 
                    `${`ipfs://`}${cidJSON}`
                );
            }
            
            return {
                success: true
            };
            
        } catch (error) {
            console.error("Error managing NFT:", error);
            throw new Error(`Failed to manage NFT: ${error.message}`);
        }
    }

    async hasKardex (studentAddress){
        try {
            return await NFTContract.hasKardex(studentAddress);
        } catch (error) {
            console.error("Error checking if student has kardex:", error);
            throw new Error(`Failed to check kardex: ${error.message}`);
        }   
    }
}

export default new NFTService();