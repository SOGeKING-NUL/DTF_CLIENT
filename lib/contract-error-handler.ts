// Error handling utilities for contract interactions

export class ContractErrorHandler {
  static handleContractError(error: any): string {
    if (error?.code === 'UNSUPPORTED_OPERATION') {
      return 'This operation is not supported. Please ensure you are connected to the correct network.';
    }
    
    if (error?.code === 'ACTION_REJECTED') {
      return 'Transaction was rejected by user.';
    }
    
    if (error?.code === 'INSUFFICIENT_FUNDS') {
      return 'Insufficient funds for this transaction.';
    }
    
    if (error?.code === 'NETWORK_ERROR') {
      return 'Network error. Please check your connection and try again.';
    }
    
    if (error?.message?.includes('Signer required')) {
      return 'Please connect your wallet to perform this action.';
    }
    
    if (error?.message?.includes('execution reverted')) {
      return 'Transaction failed. Please check the transaction details and try again.';
    }
    
    if (error?.message?.includes('gas required exceeds allowance')) {
      return 'Transaction requires more gas than allowed. Please increase gas limit.';
    }
    
    if (error?.message?.includes('nonce too low')) {
      return 'Transaction nonce is too low. Please try again.';
    }
    
    // Default error message
    return error?.message || 'An unexpected error occurred. Please try again.';
  }
  
  static isReadOnlyError(error: any): boolean {
    return error?.code === 'UNSUPPORTED_OPERATION' && 
           error?.message?.includes('does not support calling');
  }
  
  static isSignerError(error: any): boolean {
    return error?.message?.includes('Signer required') ||
           error?.code === 'UNSUPPORTED_OPERATION' && 
           error?.message?.includes('sending transactions');
  }
  
  static shouldRetry(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' ||
           error?.message?.includes('timeout') ||
           error?.message?.includes('connection');
  }
}
