import { ethers } from "ethers";
import UseCaseKardexRequest from "../../application/usesCases/kardex/UseCaseKardexRequest.js";
import contract from "../../infraestructure/blockchain/contracts/contractManagementInstance.js";

class ListenBlockchainEvent{

    constructor(){
        this.contract = contract;
    }

    listening(){
        contract.on("RequestKardex", async (codSIS, address, timeRequested) => {
            const timestamp = Number(timeRequested);
            const requestDate = new Date(timestamp * 1000);
            UseCaseKardexRequest.listeningResquest(codSIS,requestDate)
        });

    }
}

export default new ListenBlockchainEvent();
