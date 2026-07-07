import AppError from './AppError.js';

/**
 * Specialized AppError for on-chain failures. The middleware treats it the
 * same as any other AppError, but the `isContractError` flag lets the
 * useCase layer (UseCaseKardexRequest) re-wrap it as a KardexError.
 */
export default class ContractError extends AppError {
    constructor(message, errorCode, details = null) {
        super(message, 500, details, errorCode);
        this.isContractError = true;
    }

    static transactionReverted(reason, txHash) {
        return new this(
            `Transacción revertida: ${reason}`,
            "TX_REVERTED",
            { transactionHash: txHash }
        );
    }

    static insufficientFunds(requiredGas) {
        return new this(
            "Fondos insuficientes para la transacción",
            "INSUFFICIENT_FUNDS",
            { requiredGas }
        );
    }
}
