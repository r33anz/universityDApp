import { ethers } from "ethers";
import UseCaseKardexRequest from "../../application/usesCases/kardex/UseCaseKardexRequest.js";
import contract from "../../infraestructure/blockchain/contracts/contractManagementInstance.js";

class ListenBlockchainEvent{

    constructor(){
        this.contract = contract;
    }

    listening(){
        contract.on("RequestKardex", async (codSIS, address, timeRequested) => {

            console.log("SisCode que solicito kardex", codSIS);
         
            const timestamp = Number(timeRequested);
            const requestDate = new Date(timestamp * 1000);
            
            console.log(`El  ${codSIS} solicito kardex en estas fechas ${requestDate}`);

            UseCaseKardexRequest.listeningResquest(codSIS,requestDate)
        });

        contract.on("CredentialIssued",async(codSIS, address, timeRequested) => {
            console.log("Se emitio credencial para", codSIS)
        });
        console.log("Listening to RequestKardex events from blockchain...");
    }
}

export default new ListenBlockchainEvent();
