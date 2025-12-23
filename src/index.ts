/**
 * @dbtchain/gov-sdk
 * 
 * Public SDK for simplified blockchain interactions
 * with the Digital Bayanihan Transparency Chain (DBTC)
 */

// Configuration
export { 
  configure, 
  getConfig, 
  getChainMode,
  isTestnet,
  isMainnet,
  setContractAddresses,
  SDKConfig,
  ChainMode 
} from './config';

// Types
export * from './types';

// Agency functions
export * from './agency';

// Department functions
export * from './department';

// DBTC functions
export * from './dbtc';

// Utilities
export { stringToBytes32, bytes32ToString } from './utils';
