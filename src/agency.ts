import { ethers, Contract } from 'ethers';
import { getProvider, getSigner } from './config';
import { ProposalData, TransactionResult, AgencyInfo } from './types';
import { prepareProposalData, waitForTransaction } from './utils';
import AgencyABI from './abis/Agency.json';

/**
 * Get Agency contract instance
 */
function getAgencyContract(agencyAddress: string, signer?: ethers.Wallet): Contract {
  const runner = signer || getProvider();
  return new Contract(agencyAddress, AgencyABI.abi, runner);
}

// ============ Proposal Management ============

/**
 * Submit a budget proposal
 * @param agencyAddress Address of the agency contract
 * @param uri Metadata URI (IPFS or other)
 * @param data Proposal data (prexcFpapId, uacsObjCode, amount)
 * @param privateKey Private key of agency owner or document manager
 * @returns Transaction result with tokenId
 */
export async function submitProposal(
  agencyAddress: string,
  uri: string,
  data: ProposalData,
  privateKey?: string
): Promise<TransactionResult & { tokenId: bigint }> {
  const signer = getSigner(privateKey);
  const contract = getAgencyContract(agencyAddress, signer);
  
  const proposalData = prepareProposalData(data);
  const tx = await contract.submitProposal(uri, proposalData);
  const result = await waitForTransaction(tx);
  
  // Extract tokenId from ProposalSubmitted event
  let tokenId = BigInt(0);
  for (const log of result.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'ProposalSubmitted') {
        tokenId = parsed.args.tokenId;
        break;
      }
    } catch { /* skip non-matching logs */ }
  }
  
  return { ...result, tokenId };
}

/**
 * Revise an existing proposal
 * @param agencyAddress Address of the agency contract
 * @param originalTokenId Token ID of the original proposal
 * @param newUri New metadata URI
 * @param newData New proposal data
 * @param reason Reason for revision
 * @param privateKey Private key of agency owner or document manager
 * @returns Transaction result with newTokenId
 */
export async function reviseProposal(
  agencyAddress: string,
  originalTokenId: bigint | number,
  newUri: string,
  newData: ProposalData,
  reason: string,
  privateKey?: string
): Promise<TransactionResult & { newTokenId: bigint }> {
  const signer = getSigner(privateKey);
  const contract = getAgencyContract(agencyAddress, signer);
  
  const proposalData = prepareProposalData(newData);
  const tx = await contract.reviseProposal(originalTokenId, newUri, proposalData, reason);
  const result = await waitForTransaction(tx);
  
  // Extract newTokenId from ProposalRevised event
  let newTokenId = BigInt(0);
  for (const log of result.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'ProposalRevised') {
        newTokenId = parsed.args.newTokenId;
        break;
      }
    } catch { /* skip non-matching logs */ }
  }
  
  return { ...result, newTokenId };
}

/**
 * Amend a proposal during GAB phase
 * @param agencyAddress Address of the agency contract
 * @param originalTokenId Token ID of the original proposal
 * @param newUri New metadata URI
 * @param newData New proposal data
 * @param reason Reason for amendment
 * @param privateKey Private key of agency owner or document manager
 * @returns Transaction result with newTokenId
 */
export async function amendProposal(
  agencyAddress: string,
  originalTokenId: bigint | number,
  newUri: string,
  newData: ProposalData,
  reason: string,
  privateKey?: string
): Promise<TransactionResult & { newTokenId: bigint }> {
  const signer = getSigner(privateKey);
  const contract = getAgencyContract(agencyAddress, signer);
  
  const proposalData = prepareProposalData(newData);
  const tx = await contract.amendProposal(originalTokenId, newUri, proposalData, reason);
  const result = await waitForTransaction(tx);
  
  // Extract newTokenId from ProposalAmended event
  let newTokenId = BigInt(0);
  for (const log of result.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'ProposalAmended') {
        newTokenId = parsed.args.newTokenId;
        break;
      }
    } catch { /* skip non-matching logs */ }
  }
  
  return { ...result, newTokenId };
}

/**
 * Submit a separate GAB (House or Senate)
 * @param agencyAddress Address of the House or Senate agency
 * @param uri Metadata URI
 * @param data Proposal data
 * @param privateKey Private key of agency owner or document manager
 * @returns Transaction result with tokenId
 */
export async function submitSeparateGAB(
  agencyAddress: string,
  uri: string,
  data: ProposalData,
  privateKey?: string
): Promise<TransactionResult & { tokenId: bigint }> {
  const signer = getSigner(privateKey);
  const contract = getAgencyContract(agencyAddress, signer);
  
  const proposalData = prepareProposalData(data);
  const tx = await contract.submitSeparateGAB(uri, proposalData);
  const result = await waitForTransaction(tx);
  
  let tokenId = BigInt(0);
  for (const log of result.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'ProposalSubmitted') {
        tokenId = parsed.args.tokenId;
        break;
      }
    } catch { /* skip non-matching logs */ }
  }
  
  return { ...result, tokenId };
}

/**
 * Submit a joint GAB (Bicameral)
 * @param agencyAddress Address of the Congress main agency
 * @param houseProposalId House proposal token ID
 * @param senateProposalId Senate proposal token ID
 * @param uri Metadata URI
 * @param data Proposal data
 * @param privateKey Private key of Congress main agency owner
 * @returns Transaction result with tokenId
 */
export async function submitJointGAB(
  agencyAddress: string,
  houseProposalId: bigint | number,
  senateProposalId: bigint | number,
  uri: string,
  data: ProposalData,
  privateKey?: string
): Promise<TransactionResult & { tokenId: bigint }> {
  const signer = getSigner(privateKey);
  const contract = getAgencyContract(agencyAddress, signer);
  
  const proposalData = prepareProposalData(data);
  const tx = await contract.submitJointGAB(houseProposalId, senateProposalId, uri, proposalData);
  const result = await waitForTransaction(tx);
  
  let tokenId = BigInt(0);
  for (const log of result.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'ProposalSubmitted') {
        tokenId = parsed.args.tokenId;
        break;
      }
    } catch { /* skip non-matching logs */ }
  }
  
  return { ...result, tokenId };
}

// ============ Role Management ============

/**
 * Add a document manager to the agency
 * @param agencyAddress Address of the agency contract
 * @param managerAddress Address to add as document manager
 * @param privateKey Private key of agency owner
 * @returns Transaction result
 */
export async function addDocumentManager(
  agencyAddress: string,
  managerAddress: string,
  privateKey?: string
): Promise<TransactionResult> {
  const signer = getSigner(privateKey);
  const contract = getAgencyContract(agencyAddress, signer);
  
  const tx = await contract.addDocumentManager(managerAddress);
  return await waitForTransaction(tx);
}

/**
 * Remove a document manager from the agency
 * @param agencyAddress Address of the agency contract
 * @param managerAddress Address to remove
 * @param privateKey Private key of agency owner
 * @returns Transaction result
 */
export async function removeDocumentManager(
  agencyAddress: string,
  managerAddress: string,
  privateKey?: string
): Promise<TransactionResult> {
  const signer = getSigner(privateKey);
  const contract = getAgencyContract(agencyAddress, signer);
  
  const tx = await contract.removeDocumentManager(managerAddress);
  return await waitForTransaction(tx);
}

/**
 * Transfer agency ownership
 * @param agencyAddress Address of the agency contract
 * @param newOwner Address of the new owner
 * @param privateKey Private key of current agency owner
 * @returns Transaction result
 */
export async function transferAgencyOwnership(
  agencyAddress: string,
  newOwner: string,
  privateKey?: string
): Promise<TransactionResult> {
  const signer = getSigner(privateKey);
  const contract = getAgencyContract(agencyAddress, signer);
  
  const tx = await contract.transferOwnership(newOwner);
  return await waitForTransaction(tx);
}

// ============ Read Functions ============

/**
 * Get agency information
 * @param agencyAddress Address of the agency contract
 * @returns Agency info
 */
export async function getAgencyInfo(agencyAddress: string): Promise<AgencyInfo> {
  const contract = getAgencyContract(agencyAddress);
  
  const [code, name, department, owner] = await Promise.all([
    contract.getCode(),
    contract.getName(),
    contract.getDepartment(),
    contract.getOwner()
  ]);
  
  return {
    address: agencyAddress,
    code,
    name,
    department,
    owner
  };
}

/**
 * Check if an address is a document manager
 * @param agencyAddress Address of the agency contract
 * @param address Address to check
 * @returns True if document manager
 */
export async function isDocumentManager(
  agencyAddress: string,
  address: string
): Promise<boolean> {
  const contract = getAgencyContract(agencyAddress);
  return await contract.isDocumentManager(address);
}

/**
 * Get all document managers
 * @param agencyAddress Address of the agency contract
 * @returns Array of document manager addresses
 */
export async function getDocumentManagers(agencyAddress: string): Promise<string[]> {
  const contract = getAgencyContract(agencyAddress);
  return await contract.getDocumentManagers();
}
