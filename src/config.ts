import { ethers } from 'ethers';

/**
 * Chain mode - determines which network to connect to
 */
export type ChainMode = 'testnet' | 'mainnet';

/**
 * Network configuration
 */
interface NetworkConfig {
  rpcUrl: string;
  chainId: number;
  chainName: string;
}

/**
 * Network configurations for DBTC
 */
const NETWORKS: Record<ChainMode, NetworkConfig> = {
  testnet: {
    rpcUrl: 'https://amoy.dbtc.bayanichain.io',
    chainId: 80002, // Polygon Amoy Testnet
    chainName: 'Polygon Amoy'
  },
  mainnet: {
    rpcUrl: 'https://polygon.dbtc.bayanichain.io',
    chainId: 137, // Polygon Mainnet
    chainName: 'Polygon'
  }
};

/**
 * Bundled contract addresses (managed by DBTC team)
 */
export const CONTRACT_ADDRESSES = {
  testnet: {
    dbtc: '0x8972bc4dea1d2760E3f5b0a90675Dde15506aA8E',
    budgetProposal: '0xf73aB0E2069029c881EFB825f74aC602472d3ace'
  },
  mainnet: {
    dbtc: '',
    budgetProposal: ''
  }
} as const;

/**
 * SDK Configuration
 */
export interface SDKConfig {
  /** Chain mode: 'testnet' or 'mainnet' */
  chainMode: ChainMode;
  /** API key provided by DBTC */
  apiKey: string;
  /** Default private key for transactions (optional) */
  privateKey?: string;
}

let _config: SDKConfig | null = null;
let _provider: ethers.JsonRpcProvider | null = null;

/**
 * Configure the SDK
 * @param config SDK configuration options
 * 
 * @example
 * ```typescript
 * configure({
 *   chainMode: 'testnet',
 *   apiKey: 'your-dbtc-api-key',
 *   privateKey: process.env.PRIVATE_KEY
 * });
 * ```
 */
export function configure(config: SDKConfig): void {
  if (!config.chainMode || !['testnet', 'mainnet'].includes(config.chainMode)) {
    throw new Error("chainMode must be 'testnet' or 'mainnet'");
  }
  if (!config.apiKey) {
    throw new Error('apiKey is required. Contact DBTC to obtain your API key.');
  }
  
  _config = {
    chainMode: config.chainMode,
    apiKey: config.apiKey,
    privateKey: config.privateKey
  };
  
  // Reset provider when config changes
  _provider = null;
}

/**
 * Get current SDK configuration
 * @returns Current configuration or throws if not configured
 */
export function getConfig(): SDKConfig {
  if (!_config) {
    // Try to auto-configure from environment variables
    const chainMode = process.env.DBTC_CHAIN_MODE as ChainMode;
    const apiKey = process.env.DBTC_API_KEY;
    const privateKey = process.env.PRIVATE_KEY;
    
    if (chainMode && apiKey) {
      configure({
        chainMode,
        apiKey,
        privateKey
      });
    } else {
      throw new Error(
        'SDK not configured. Call configure() first or set environment variables:\n' +
        '  DBTC_CHAIN_MODE=testnet|mainnet\n' +
        '  DBTC_API_KEY=your-api-key\n' +
        '  PRIVATE_KEY=your-wallet-private-key (optional)'
      );
    }
  }
  return _config!;
}

/**
 * Get network configuration for current chain mode
 */
export function getNetworkConfig(): NetworkConfig {
  const config = getConfig();
  return NETWORKS[config.chainMode];
}

/**
 * Get the full RPC URL with API key
 */
function getRpcUrl(): string {
  const config = getConfig();
  const network = NETWORKS[config.chainMode];
  // Append API key as query parameter or header depending on your RPC setup
  return `${network.rpcUrl}?apiKey=${config.apiKey}`;
}

/**
 * Get ethers provider
 * @returns JsonRpcProvider instance
 */
export function getProvider(): ethers.JsonRpcProvider {
  if (!_provider) {
    const network = getNetworkConfig();
    const rpcUrl = getRpcUrl();
    _provider = new ethers.JsonRpcProvider(rpcUrl, network.chainId);
  }
  return _provider;
}

/**
 * Create a signer from private key
 * @param privateKey Private key (uses default from config if not provided)
 * @returns Wallet signer
 */
export function getSigner(privateKey?: string): ethers.Wallet {
  const key = privateKey || getConfig().privateKey;
  if (!key) {
    throw new Error(
      'No private key provided. Pass privateKey parameter or configure SDK with privateKey, ' +
      'or set PRIVATE_KEY environment variable.'
    );
  }
  return new ethers.Wallet(key, getProvider());
}

/**
 * Get contract addresses for the current chain mode
 * @returns Contract addresses
 */
export function getContractAddresses() {
  const config = getConfig();
  return CONTRACT_ADDRESSES[config.chainMode];
}

/**
 * Set custom contract addresses (for custom deployments)
 * @param addresses Custom contract addresses
 * @param chainMode Chain mode to update (uses current if not specified)
 */
export function setContractAddresses(
  addresses: { dbtc?: string; budgetProposal?: string },
  chainMode?: ChainMode
): void {
  const mode = chainMode || getConfig().chainMode;
  if (addresses.dbtc) {
    (CONTRACT_ADDRESSES[mode] as any).dbtc = addresses.dbtc;
  }
  if (addresses.budgetProposal) {
    (CONTRACT_ADDRESSES[mode] as any).budgetProposal = addresses.budgetProposal;
  }
}

/**
 * Get current chain mode
 */
export function getChainMode(): ChainMode {
  return getConfig().chainMode;
}

/**
 * Check if connected to testnet
 */
export function isTestnet(): boolean {
  return getConfig().chainMode === 'testnet';
}

/**
 * Check if connected to mainnet
 */
export function isMainnet(): boolean {
  return getConfig().chainMode === 'mainnet';
}
