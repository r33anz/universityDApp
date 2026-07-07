import ContractError from "../../../interface/error/contractErrors.js";

/**
 * Wraps any contract interaction so all ethers errors map to ContractError
 * with stable, well-known errorCodes. The 7 methods across
 * CredentialManagementContract and NFTContract used to duplicate this same
 * 30-line try/catch — this helper is the single source of truth.
 *
 * @param {string} operation - human-readable label of the contract method
 *                             being invoked (e.g., "emitCredential").
 * @param {() => Promise<T>} fn - the actual contract call.
 * @returns {Promise<T>}
 * @throws {ContractError}
 */
export async function withContractErrors(operation, fn) {
    try {
        return await fn();
    } catch (error) {
        if (error instanceof ContractError) throw error;

        switch (error.code) {
            case 'CALL_EXCEPTION':
                throw new ContractError(
                    `${operation}: error en la llamada al contrato`,
                    "CALL_EXCEPTION",
                    { reason: error.reason, method: error.method, args: error.args }
                );
            case 'INSUFFICIENT_FUNDS':
                throw new ContractError(
                    `${operation}: fondos insuficientes para la transacción`,
                    "INSUFFICIENT_FUNDS",
                    { requiredGas: error.error?.gas }
                );
            case 'NETWORK_ERROR':
                throw new ContractError(
                    `${operation}: error de red al interactuar con la blockchain`,
                    "NETWORK_ERROR",
                    {}
                );
            default:
                throw new ContractError(
                    `${operation}: error desconocido al interactuar con el contrato`,
                    "UNKNOWN_CONTRACT_ERROR",
                    { originalError: error.message }
                );
        }
    }
}

/**
 * Convenience: awaits a transaction and asserts the receipt succeeded.
 * Throws ContractError.transactionReverted on receipt.status === 0.
 */
export async function awaitReceipt(tx) {
    const receipt = await tx.wait();
    if (receipt.status === 0) {
        throw ContractError.transactionReverted("", receipt.transactionHash);
    }
    return receipt;
}
