class ContractError extends Error {
    constructor(message, errorCode, details = null) {
        super(message);
        this.name = "ContractError";
        this.errorCode = errorCode;
        this.details = details;
        this.isContractError = true;
    }

    static transactionReverted(reason, txHash) {
        return new ContractError(
            `Transacción revertida: ${reason}`,
            "TX_REVERTED",
            { transactionHash: txHash }
        );
    }

    static insufficientFunds(requiredGas) {
        return new ContractError(
            "Fondos insuficientes para la transacción",
            "INSUFFICIENT_FUNDS",
            { requiredGas }
        );
    }
}

export default ContractError;