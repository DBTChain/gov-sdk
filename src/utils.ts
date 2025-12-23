import { ethers } from 'ethers';

/**
 * Convert a string to bytes32
 * @param str String to convert (max 31 chars)
 * @returns bytes32 hex string
 */
export function stringToBytes32(str: string): string {
  if (str.length > 31) {
    throw new Error('String too long for bytes32 (max 31 characters)');
  }
  return ethers.encodeBytes32String(str);
}

/**
 * Convert bytes32 to string
 * @param bytes32 bytes32 hex string
 * @returns Decoded string
 */
export function bytes32ToString(bytes32: string): string {
  return ethers.decodeBytes32String(bytes32);
}

/**
 * Wait for transaction and return result
 * @param tx Transaction response
 * @returns Transaction result with receipt data
 */
export async function waitForTransaction(
  tx: ethers.ContractTransactionResponse
): Promise<{
  txHash: string;
  blockNumber: number;
  gasUsed: bigint;
  success: boolean;
  logs: ethers.Log[];
}> {
  const receipt = await tx.wait();
  
  if (!receipt) {
    throw new Error('Transaction failed - no receipt');
  }
  
  return {
    txHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    success: receipt.status === 1,
    logs: receipt.logs as ethers.Log[]
  };
}

/**
 * Parse proposal data for contract call
 */
export function prepareProposalData(data: {
  prexcFpapId: string;
  uacsObjCode: string;
  amount: bigint | string | number;
}): {
  fiscalYear: number;
  departmentCode: string;
  agencyCode: string;
  prexcFpapId: string;
  uacsObjCode: string;
  amount: bigint;
} {
  return {
    fiscalYear: 0, // Will be enriched by contract
    departmentCode: ethers.ZeroHash, // Will be enriched by contract
    agencyCode: ethers.ZeroHash, // Will be enriched by contract
    prexcFpapId: stringToBytes32(data.prexcFpapId),
    uacsObjCode: stringToBytes32(data.uacsObjCode),
    amount: BigInt(data.amount)
  };
}
