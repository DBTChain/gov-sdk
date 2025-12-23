import { ethers, Contract } from 'ethers';
import { getProvider, getSigner } from './config';
import { TransactionResult, DepartmentInfo } from './types';
import { waitForTransaction } from './utils';
import DepartmentABI from './abis/Department.json';

/**
 * Get Department contract instance
 */
function getDepartmentContract(departmentAddress: string, signer?: ethers.Wallet): Contract {
  const runner = signer || getProvider();
  return new Contract(departmentAddress, DepartmentABI.abi, runner);
}

// ============ Agency Management ============

/**
 * Add a new agency to the department
 * @param departmentAddress Address of the department contract
 * @param agencyCode Agency code (e.g., "002")
 * @param agencyName Agency name
 * @param ownerAddress Owner address for the new agency
 * @param privateKey Private key of department owner (main agency owner)
 * @returns Transaction result with agencyAddress
 */
export async function addAgency(
  departmentAddress: string,
  agencyCode: string,
  agencyName: string,
  ownerAddress: string,
  privateKey?: string
): Promise<TransactionResult & { agencyAddress: string }> {
  const signer = getSigner(privateKey);
  const contract = getDepartmentContract(departmentAddress, signer);
  
  const tx = await contract.addAgency(agencyCode, agencyName, ownerAddress);
  const result = await waitForTransaction(tx);
  
  // Extract agencyAddress from AgencyAdded event
  let agencyAddress = '';
  for (const log of result.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'AgencyAdded') {
        agencyAddress = parsed.args.agencyContract || parsed.args[1];
        break;
      }
    } catch { /* skip non-matching logs */ }
  }
  
  return { ...result, agencyAddress };
}

/**
 * Set House and Senate agencies (Congress department only)
 * @param departmentAddress Address of the Congress department
 * @param houseAddress House of Representatives agency address
 * @param senateAddress Senate agency address
 * @param privateKey Private key of main agency owner
 * @returns Transaction result
 */
export async function setHouseAndSenate(
  departmentAddress: string,
  houseAddress: string,
  senateAddress: string,
  privateKey?: string
): Promise<TransactionResult> {
  const signer = getSigner(privateKey);
  const contract = getDepartmentContract(departmentAddress, signer);
  
  const tx = await contract.setHouseAndSenate(houseAddress, senateAddress);
  return await waitForTransaction(tx);
}

// ============ Read Functions ============

/**
 * Get department information
 * @param departmentAddress Address of the department contract
 * @returns Department info
 */
export async function getDepartmentInfo(departmentAddress: string): Promise<DepartmentInfo> {
  const contract = getDepartmentContract(departmentAddress);
  
  const [code, name, dbtc, mainAgency, isStandalone, isActualDepartment, agencyCount] = await Promise.all([
    contract.getCode(),
    contract.getName(),
    contract.getDBTC(),
    contract.getMainAgency(),
    contract.isStandalone(),
    contract.getIsActualDepartment(),
    contract.getAgencyCount()
  ]);
  
  return {
    address: departmentAddress,
    code,
    name,
    dbtc,
    mainAgency,
    isStandalone,
    isActualDepartment,
    agencyCount: Number(agencyCount)
  };
}

/**
 * Get agency address by code
 * @param departmentAddress Address of the department contract
 * @param agencyCode Agency code
 * @returns Agency contract address
 */
export async function getAgency(
  departmentAddress: string,
  agencyCode: string
): Promise<string> {
  const contract = getDepartmentContract(departmentAddress);
  return await contract.getAgency(agencyCode);
}

/**
 * Check if agency is registered
 * @param departmentAddress Address of the department contract
 * @param agencyCode Agency code
 * @returns True if registered
 */
export async function isAgencyRegistered(
  departmentAddress: string,
  agencyCode: string
): Promise<boolean> {
  const contract = getDepartmentContract(departmentAddress);
  return await contract.isAgencyRegistered(agencyCode);
}

/**
 * Get all agency codes
 * @param departmentAddress Address of the department contract
 * @returns Array of agency codes
 */
export async function getAgencyCodes(departmentAddress: string): Promise<string[]> {
  const contract = getDepartmentContract(departmentAddress);
  return await contract.getAgencyCodes();
}

/**
 * Get main agency address
 * @param departmentAddress Address of the department contract
 * @returns Main agency address
 */
export async function getMainAgency(departmentAddress: string): Promise<string> {
  const contract = getDepartmentContract(departmentAddress);
  return await contract.getMainAgency();
}

/**
 * Get House agency address (Congress only)
 * @param departmentAddress Address of the Congress department
 * @returns House agency address
 */
export async function getHouseAgency(departmentAddress: string): Promise<string> {
  const contract = getDepartmentContract(departmentAddress);
  return await contract.getHouseAgency();
}

/**
 * Get Senate agency address (Congress only)
 * @param departmentAddress Address of the Congress department
 * @returns Senate agency address
 */
export async function getSenateAgency(departmentAddress: string): Promise<string> {
  const contract = getDepartmentContract(departmentAddress);
  return await contract.getSenateAgency();
}

/**
 * Get department owner address
 * @param departmentAddress Address of the department contract
 * @returns Owner address
 */
export async function getDepartmentOwner(departmentAddress: string): Promise<string> {
  const contract = getDepartmentContract(departmentAddress);
  return await contract.getDepartmentOwner();
}
