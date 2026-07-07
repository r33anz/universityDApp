import UseCaseKardexRequest from "../../application/useCases/kardex/UseCaseKardexRequest.js";
import CredentialManagement from "../../infrastructure/blockchain/contracts/CredentialManagementContract.js";

class ListenBlockchainEvent {
    listening() {
        CredentialManagement.contract.on("RequestKardex", async (codSIS, _address, timeRequested) => {
            const requestDate = new Date(Number(timeRequested) * 1000);
            UseCaseKardexRequest.listeningRequest(codSIS, requestDate);
        });
    }
}

export default new ListenBlockchainEvent();
