import { ethers } from 'ethers';
import {DTF_ABI} from '../abi/DTF';
import {DTFFACTORY_ABI} from '../abi/DTFFactory';
import { ContractErrorHandler } from './contract-error-handler';

const DTF_FACTORY_ADDRESS = process.env.NEXT_PUBLIC_DTF_FACTORY_ADDRESS!;

// =============================================================================
// DTF FACTORY CONTRACT SERVICE
// =============================================================================
export class DTFFactoryService {
  private factoryContract: any;
  private signer: ethers.Signer | null = null;
  private provider: any;

  constructor(provider: any, signer?: ethers.Signer) {
    // Use custom RPC provider as fallback if no provider provided
    if (!provider && typeof window !== 'undefined') {
      const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://sepolia.unichain.org';
      console.log('Creating fallback provider with RPC:', rpcUrl);
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
    } else {
      this.provider = provider;
    }
    
    this.factoryContract = new ethers.Contract(DTF_FACTORY_ADDRESS, DTFFACTORY_ABI, this.provider);
    
    if (signer) {
      this.signer = signer;
      this.factoryContract = this.factoryContract.connect(signer);
    }
  }

  // =============================================================================
  // FACTORY TRANSACTION FUNCTIONS
  // =============================================================================

  /**
   * Create a new DTF contract
   * @param name - DTF name
   * @param symbol - DTF symbol  
   * @param tokens - Array of token addresses
   * @param weights - Array of weights in basis points (100 = 1%)
   */
  async createDTF(name: string, symbol: string, tokens: string[], weights: number[]) {
    if (!this.signer) throw new Error("Signer required for transactions");
    
    try {
      // Convert weights to basis points (multiply by 100)
      const weightsInBps = weights.map(weight => Math.floor(weight * 100));
      
      const tx = await this.factoryContract.createDTF(name, symbol, tokens, weightsInBps);
      const receipt = await tx.wait();
      
      // Extract DTF address from the DTFCreated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.factoryContract.interface.parseLog(log);
          return parsed?.name === 'DTFCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsed = this.factoryContract.interface.parseLog(event);
        return {
          txHash: receipt.transactionHash,
          dtfAddress: parsed?.args.dtfAddress,
          name: parsed?.args.name,
          symbol: parsed?.args.symbol,
          creator: parsed?.args.creator,
          tokens: parsed?.args.tokens,
          weights: parsed?.args.weights.map((w: any) => Number(w) / 100), // Convert back to percentage
          createdAt: Number(parsed?.args.createdAt)
        };
      }
      
      return { txHash: receipt.transactionHash };
    } catch (error) {
      console.error('Error creating DTF:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  // =============================================================================
  // FACTORY VIEW FUNCTIONS
  // =============================================================================

  /**
   * Get all DTFs created by the factory
   */
  async getAllDTFs() {
    try {
      const readOnlyFactoryContract = new ethers.Contract(this.factoryContract.target, this.factoryContract.interface, this.provider);
      const dtfs = await readOnlyFactoryContract.getAllDTFs();
      return dtfs.map((dtf: any) => ({
        dtfAddress: dtf.dtfAddress,
        creator: dtf.creator,
        name: dtf.name,
        symbol: dtf.symbol,
        tokens: dtf.tokens,
        weights: dtf.weights.map((weight: any) => Number(weight) / 100), // Convert from basis points to percentage
        createdAt: Number(dtf.createdAt),
        active: dtf.active
      }));
    } catch (error) {
      console.error('Error getting all DTFs:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get DTF information by address
   * @param dtfAddress - Address of the DTF contract
   */
  async getDTFByAddress(dtfAddress: string) {
    try {
      const readOnlyFactoryContract = new ethers.Contract(this.factoryContract.target, this.factoryContract.interface, this.provider);
      const dtf = await readOnlyFactoryContract.getDTFbyAddress(dtfAddress);
      return {
        dtfAddress: dtf.dtfAddress,
        creator: dtf.creator,
        name: dtf.name,
        symbol: dtf.symbol,
        tokens: dtf.tokens,
        weights: dtf.weights.map((weight: any) => Number(weight) / 100), // Convert from basis points to percentage
        createdAt: Number(dtf.createdAt),
        active: dtf.active
      };
    } catch (error) {
      console.error('Error getting DTF by address:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get DTF info from the dtfInfo mapping
   * @param dtfAddress - Address of the DTF contract
   */
  async getDTFInfo(dtfAddress: string) {
    try {
      const readOnlyFactoryContract = new ethers.Contract(this.factoryContract.target, this.factoryContract.interface, this.provider);
      const info = await readOnlyFactoryContract.dtfInfo(dtfAddress);
      return {
        dtfAddress: info.dtfAddress,
        creator: info.creator,
        name: info.name,
        symbol: info.symbol,
        tokens: info.tokens,
        weights: info.weights.map((weight: any) => Number(weight) / 100),
        createdAt: Number(info.createdAt),
        active: info.active
      };
    } catch (error) {
      console.error('Error getting DTF info:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Check if a DTF address is active
   * @param dtfAddress - Address of the DTF contract
   */
  async isActiveDTF(dtfAddress: string) {
    try {
      const readOnlyFactoryContract = new ethers.Contract(this.factoryContract.target, this.factoryContract.interface, this.provider);
      return await readOnlyFactoryContract.isActiveDTF(dtfAddress);
    } catch (error) {
      console.error('Error checking if DTF is active:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get Uniswap V4 configuration from factory
   */
  async getUniswapConfig() {
    try {
      const readOnlyFactoryContract = new ethers.Contract(this.factoryContract.target, this.factoryContract.interface, this.provider);
      return await readOnlyFactoryContract.uniswapConfig();
    } catch (error) {
      console.error('Error getting Uniswap config:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  // =============================================================================
  // FACTORY EVENT LISTENERS
  // =============================================================================

  /**
   * Listen for DTFCreated events
   */
  onDTFCreated(callback: (event: any) => void) {
    this.factoryContract.on("DTFCreated", (dtfAddress: any, creator: any, name: any, symbol: any, tokens: any, weights: any, createdAt: any, event: any) => {
      callback({
        type: "created",
        dtfAddress,
        creator,
        name,
        symbol,
        tokens,
        weights: weights.map((weight: any) => Number(weight) / 100),
        createdAt: Number(createdAt),
        txHash: event.transactionHash
      });
    });
  }

  /**
   * Remove all factory event listeners
   */
  removeAllListeners() {
    this.factoryContract.removeAllListeners();
  }
}

// =============================================================================
// DTF CONTRACT SERVICE
// =============================================================================
export class DTFContractService {
  private contract: any;
  private signer: ethers.Signer | null = null;
  private provider: any;

  constructor(provider: any, signer?: ethers.Signer, dtfAddress?: string) {
    this.provider = provider;
    
    if (!dtfAddress) {
      throw new Error("DTF address is required. Get it from the factory contract.");
    }
    
    this.contract = new ethers.Contract(dtfAddress, DTF_ABI, provider);
    
    if (signer) {
      this.signer = signer;
      this.contract = this.contract.connect(signer);
    }
  }

  // =============================================================================
  // DTF TRANSACTION FUNCTIONS
  // =============================================================================

  /**
   * Mint DTF tokens by investing ETH
   * @param ethAmount - Amount of ETH to invest
   * @param slippageBps - Slippage tolerance in basis points (default 200 = 2%)
   */
  async mintWithEth(ethAmount: string, slippageBps: number = 200) {
    if (!this.signer) throw new Error("Signer required for transactions");
    
    try {
      const tx = await this.contract.mintWithEth(slippageBps, {
        value: ethers.parseEther(ethAmount)
      });
      
      return await tx.wait();
    } catch (error) {
      console.error('Error minting with ETH:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Redeem DTF tokens for ETH
   * @param dtfAmount - Amount of DTF tokens to redeem
   * @param slippageBps - Slippage tolerance in basis points (default 200 = 2%)
   */
  async redeemForEth(dtfAmount: string, slippageBps: number = 200) {
    if (!this.signer) throw new Error("Signer required for transactions");
    
    try {
      const dtfAmountWei = ethers.parseUnits(dtfAmount, 18);
      const tx = await this.contract.redeemforEth(dtfAmountWei, slippageBps);
      
      return await tx.wait();
    } catch (error) {
      console.error('Error redeeming for ETH:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Withdraw fees (owner only)
   */
  async withdrawFees() {
    if (!this.signer) throw new Error("Signer required for transactions");
    
    try {
      const tx = await this.contract.withdrawFees();
      return await tx.wait();
    } catch (error) {
      console.error('Error withdrawing fees:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  // =============================================================================
  // DTF VIEW FUNCTIONS
  // =============================================================================

  /**
   * Get current total portfolio value in ETH
   */
  async getCurrentPortfolioValue() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const totalValue = await readOnlyContract.getCurrentPortfolioValue();
      return ethers.formatEther(totalValue);
    } catch (error) {
      console.error('Error getting portfolio value:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get array of token addresses in this DTF
   */
  async getTokens() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      return await readOnlyContract.getTokens();
    } catch (error) {
      console.error('Error getting tokens:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get array of token weights (in basis points, converted to percentages)
   */
  async getWeights() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const weights = await readOnlyContract.getWeights();
      return weights.map((weight: any) => Number(weight) / 100);
    } catch (error) {
      console.error('Error getting weights:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get balance of a specific token held by the DTF
   * @param tokenAddress - Address of the token
   */
  async getTokenBalance(tokenAddress: string) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const balance = await readOnlyContract.getTokenBalance(tokenAddress);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get token allowance for Universal Router
   * @param tokenAddress - Address of the token
   */
  async getTokenAllowance(tokenAddress: string) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const allowance = await readOnlyContract.getTokenAllowance(tokenAddress);
      return ethers.formatUnits(allowance, 18);
    } catch (error) {
      console.error('Error getting token allowance:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get detailed portfolio information
   */
  async getDetailedPortfolio() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const [tokenAddresses, balances, ethValues] = await readOnlyContract.getDetailedPortfolio();
      
      return {
        tokenAddresses,
        balances: balances.map((b: any) => ethers.formatUnits(b, 18)),
        ethValues: ethValues.map((v: any) => ethers.formatEther(v))
      };
    } catch (error) {
      console.error('Error getting detailed portfolio:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  // =============================================================================
  // DTF PREVIEW & QUOTE FUNCTIONS
  // =============================================================================

  /**
   * Get redemption preview showing ETH amount, fees, and net amount
   * @param dtfAmount - Amount of DTF tokens to redeem
   * @param slippageBps - Slippage tolerance in basis points
   */
  async getRedemptionPreview(dtfAmount: string, slippageBps: number = 200) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const dtfAmountWei = ethers.parseUnits(dtfAmount, 18);
      const [ethAmount, feeAmount, netAmount] = await readOnlyContract.getRedemptionPreview(
        dtfAmountWei, 
        slippageBps
      );
      
      return {
        ethAmount: ethers.formatEther(ethAmount),
        feeAmount: ethers.formatEther(feeAmount),
        netAmount: ethers.formatEther(netAmount)
      };
    } catch (error) {
      console.error('Error getting redemption preview:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get swap quote for token to ETH
   * @param tokenAddress - Address of the token to swap
   * @param tokenAmount - Amount of tokens to swap
   * @param slippageBps - Slippage tolerance in basis points
   */
  async getSwapQuote(tokenAddress: string, tokenAmount: string, slippageBps: number = 200) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const tokenAmountWei = ethers.parseUnits(tokenAmount, 18);
      const [expectedOut, minAmountOut] = await readOnlyContract.getSwapQuote(
        tokenAddress, 
        tokenAmountWei, 
        slippageBps
      );
      
      return {
        expectedOut: ethers.formatEther(expectedOut),
        minAmountOut: ethers.formatEther(minAmountOut)
      };
    } catch (error) {
      console.error('Error getting swap quote:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  // =============================================================================
  // DTF VALIDATION FUNCTIONS
  // =============================================================================

  /**
   * Check if a user can redeem DTF tokens
   * @param userAddress - User's address
   * @param dtfAmount - Amount of DTF tokens to redeem
   */
  async checkRedemption(userAddress: string, dtfAmount: string) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const dtfAmountWei = ethers.parseUnits(dtfAmount, 18);
      const [canRedeem, reason] = await readOnlyContract.checkRedemption(userAddress, dtfAmountWei);
      
      return { canRedeem, reason };
    } catch (error) {
      console.error('Error checking redemption:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  // =============================================================================
  // DTF ERC20 FUNCTIONS
  // =============================================================================

  /**
   * Get DTF token balance for a user
   * @param userAddress - User's address
   */
  async getDTFBalance(userAddress: string) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const balance = await readOnlyContract.balanceOf(userAddress);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting DTF balance:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get total supply of DTF tokens
   */
  async getTotalSupply() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const supply = await readOnlyContract.totalSupply();
      return ethers.formatUnits(supply, 18);
    } catch (error) {
      console.error('Error getting total supply:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get pending fees amount
   */
  async getPendingFees() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const fees = await readOnlyContract.pendingFees();
      return ethers.formatEther(fees);
    } catch (error) {
      console.error('Error getting pending fees:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get contract creation timestamp
   */
  async getCreatedAt() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const createdAt = await readOnlyContract.createdAt();
      return Number(createdAt);
    } catch (error) {
      console.error('Error getting creation timestamp:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get total value locked in the DTF
   */
  async getTotalValueLocked() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const totalValue = await readOnlyContract.getTotalValueLocked();
      return ethers.formatEther(totalValue);
    } catch (error) {
      console.error('Error getting total value locked:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get user's DTF balance (alias for balanceOf)
   * @param userAddress - User's address
   */
  async getUserDTFBalance(userAddress: string) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const balance = await readOnlyContract.getUserDTFBalance(userAddress);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting user DTF balance:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get user's pending redemption value
   * @param userAddress - User's address
   * @param dtfAmount - Amount of DTF tokens
   */
  async getUserPendingRedemptionValue(userAddress: string, dtfAmount: string) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const dtfAmountWei = ethers.parseUnits(dtfAmount, 18);
      const [ethValue, fee] = await readOnlyContract.getUserPendingRedemptionValue(userAddress, dtfAmountWei);
      
      return {
        ethValue: ethers.formatEther(ethValue),
        fee: ethers.formatEther(fee)
      };
    } catch (error) {
      console.error('Error getting user pending redemption value:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get token details including balance, weight, and ETH value
   * @param tokenAddress - Address of the token
   */
  async getTokenDetails(tokenAddress: string) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const [balance, weight, ethValue] = await readOnlyContract.getTokenDetails(tokenAddress);
      
      return {
        balance: ethers.formatUnits(balance, 18),
        weight: Number(weight) / 100, // Convert from basis points to percentage
        ethValue: ethers.formatEther(ethValue)
      };
    } catch (error) {
      console.error('Error getting token details:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get portfolio composition including addresses, balances, weights, and ETH values
   */
  async getPortfolioComposition() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const [tokenAddresses, balances, weights, ethValues] = await readOnlyContract.getPortfolioComposition();
      
      return {
        tokenAddresses,
        balances: balances.map((b: any) => ethers.formatUnits(b, 18)),
        weights: weights.map((w: any) => Number(w) / 100), // Convert from basis points to percentage
        ethValues: ethValues.map((v: any) => ethers.formatEther(v))
      };
    } catch (error) {
      console.error('Error getting portfolio composition:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get contract age in seconds
   */
  async getContractAge() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const age = await readOnlyContract.getContractAge();
      return Number(age);
    } catch (error) {
      console.error('Error getting contract age:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get fee status (pending fees amount)
   */
  async getFeeStatus() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const fees = await readOnlyContract.getFeeStatus();
      return ethers.formatEther(fees);
    } catch (error) {
      console.error('Error getting fee status:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get mint preview showing DTF tokens to be minted and fees
   * @param ethAmount - Amount of ETH to invest
   * @param slippageBps - Slippage tolerance in basis points
   */
  async getMintPreview(ethAmount: string, slippageBps: number = 200) {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const ethAmountWei = ethers.parseEther(ethAmount);
      const [dtfTokens, fee] = await readOnlyContract.getMintPreview(ethAmountWei, slippageBps);
      
      return {
        dtfTokens: ethers.formatUnits(dtfTokens, 18),
        fee: ethers.formatEther(fee)
      };
    } catch (error) {
      console.error('Error getting mint preview:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get active status of the DTF
   */
  async getActiveStatus() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      return await readOnlyContract.getActiveStatus();
    } catch (error) {
      console.error('Error getting active status:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  /**
   * Get total ETH locked in the contract
   */
  async getTotalEthLocked() {
    try {
      const readOnlyContract = new ethers.Contract(this.contract.target, this.contract.interface, this.provider);
      const totalEth = await readOnlyContract.getTotalEthLocked();
      return ethers.formatEther(totalEth);
    } catch (error) {
      console.error('Error getting total ETH locked:', error);
      throw new Error(ContractErrorHandler.handleContractError(error));
    }
  }

  // =============================================================================
  // DTF EVENT LISTENERS
  // =============================================================================

  /**
   * Listen for DTFTokensMinted events
   */
  onDTFTokensMinted(callback: (event: any) => void) {
    this.contract.on("DTFTokensMinted", (investedETH: any, dtfTokensMinted: any, to: any, event: any) => {
      callback({
        type: "minted",
        investedETH: ethers.formatEther(investedETH),
        dtfTokensMinted: ethers.formatUnits(dtfTokensMinted, 18),
        to,
        txHash: event.transactionHash
      });
    });
  }

  /**
   * Listen for TokensRedeemed events
   */
  onTokensRedeemed(callback: (event: any) => void) {
    this.contract.on("TokensRedeemed", (user: any, dtfTokensBurned: any, ethRedeemed: any, event: any) => {
      callback({
        type: "redeemed",
        user,
        dtfTokensBurned: ethers.formatUnits(dtfTokensBurned, 18),
        ethRedeemed: ethers.formatEther(ethRedeemed),
        txHash: event.transactionHash
      });
    });
  }

  /**
   * Listen for TokenSwapped events
   */
  onTokenSwapped(callback: (event: any) => void) {
    this.contract.on("TokenSwapped", (token: any, ethSpent: any, tokensReceived: any, event: any) => {
      callback({
        type: "swapped",
        token,
        ethSpent: ethers.formatEther(ethSpent),
        tokensReceived: ethers.formatUnits(tokensReceived, 18),
        txHash: event.transactionHash
      });
    });
  }

  /**
   * Listen for FeeWithdrawn events
   */
  onFeeWithdrawn(callback: (event: any) => void) {
    this.contract.on("FeeWithdrawn", (owner: any, feeAmount: any, event: any) => {
      callback({
        type: "feeWithdrawn",
        owner,
        feeAmount: ethers.formatEther(feeAmount),
        txHash: event.transactionHash
      });
    });
  }

  /**
   * Remove all DTF event listeners
   */
  removeAllListeners() {
    this.contract.removeAllListeners();
  }
}

// =============================================================================
// HOOK FUNCTIONS FOR REACT COMPONENTS
// =============================================================================

/**
 * Hook for DTF Factory operations
 */
export function useDTFFactory(provider: any, signer?: ethers.Signer) {
  return new DTFFactoryService(provider, signer);
}

/**
 * Hook for individual DTF contract operations
 * @param provider - Web3 provider
 * @param signer - Web3 signer (optional)
 * @param dtfAddress - DTF contract address (required - get from factory)
 */
export function useDTFContract(provider: any, signer: ethers.Signer | undefined, dtfAddress: string) {
  return new DTFContractService(provider, signer, dtfAddress);
}
