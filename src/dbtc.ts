import { ethers, Contract } from 'ethers';
import { getProvider, getSigner, getContractAddresses } from './config';
import { BudgetPhase, TransactionResult } from './types';
import { waitForTransaction } from './utils';
import DBTCABI from './abis/DBTC.json';

/**
 * Get DBTC contract instance
 * @param dbtcAddress Optional address (uses bundled address if not provided)
 */
function getDBTCContract(dbtcAddress?: string, signer?: ethers.Wallet): Contract {
  const address = dbtcAddress || getContractAddresses().dbtc;
  if (!address) {
    throw new Error('DBTC contract address not configured. Use setContractAddresses() or provide address.');
  }
  const runner = signer || getProvider();
  return new Contract(address, DBTCABI.abi, runner);
}

// ============ Department Management (DBM Owner Only) ============

/**
 * Add a new department
 * @param deptCode Department code (e.g., "01")
 * @param deptName Department name
 * @param mainAgencyName Main agency name (empty for standalone)
 * @param mainAgencyOwner Owner address for main agency or standalone
 * @param isStandalone Whether this is a standalone entity
 * @param isActualDept Whether this is an actual department (false for BSGC/ALGU)
 * @param privateKey Private key of DBTC owner (DBM)
 * @param dbtcAddress Optional DBTC contract address
 * @returns Transaction result with departmentAddress
 */
export async function addDepartment(
  deptCode: string,
  deptName: string,
  mainAgencyName: string,
  mainAgencyOwner: string,
  isStandalone: boolean,
  isActualDept: boolean,
  privateKey?: string,
  dbtcAddress?: string
): Promise<TransactionResult & { departmentAddress: string }> {
  const signer = getSigner(privateKey);
  const contract = getDBTCContract(dbtcAddress, signer);
  
  const tx = await contract.addDepartment(
    deptCode,
    deptName,
    mainAgencyName,
    mainAgencyOwner,
    isStandalone,
    isActualDept
  );
  const result = await waitForTransaction(tx);
  
  // Extract departmentAddress from DepartmentAdded event
  let departmentAddress = '';
  for (const log of result.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'DepartmentAdded') {
        departmentAddress = parsed.args.deptContract || parsed.args[1];
        break;
      }
    } catch { /* skip non-matching logs */ }
  }
  
  return { ...result, departmentAddress };
}

/**
 * Add a regular department (convenience function)
 * @param deptCode Department code
 * @param deptName Department name
 * @param mainAgencyName Main agency name
 * @param mainAgencyOwner Owner address for main agency
 * @param privateKey Private key of DBTC owner (DBM)
 * @param dbtcAddress Optional DBTC contract address
 * @returns Transaction result with departmentAddress
 */
export async function addRegularDepartment(
  deptCode: string,
  deptName: string,
  mainAgencyName: string,
  mainAgencyOwner: string,
  privateKey?: string,
  dbtcAddress?: string
): Promise<TransactionResult & { departmentAddress: string }> {
  const signer = getSigner(privateKey);
  const contract = getDBTCContract(dbtcAddress, signer);
  
  const tx = await contract.addRegularDepartment(deptCode, deptName, mainAgencyName, mainAgencyOwner);
  const result = await waitForTransaction(tx);
  
  let departmentAddress = '';
  for (const log of result.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics as string[], data: log.data });
      if (parsed?.name === 'DepartmentAdded') {
        departmentAddress = parsed.args.deptContract || parsed.args[1];
        break;
      }
    } catch { /* skip non-matching logs */ }
  }
  
  return { ...result, departmentAddress };
}

// ============ Phase Management ============

/**
 * Assign phase responsibility to a department
 * @param phase Budget phase
 * @param deptCode Department code
 * @param privateKey Private key of DBTC owner (DBM)
 * @param dbtcAddress Optional DBTC contract address
 * @returns Transaction result
 */
export async function assignPhaseResponsibility(
  phase: BudgetPhase,
  deptCode: string,
  privateKey?: string,
  dbtcAddress?: string
): Promise<TransactionResult> {
  const signer = getSigner(privateKey);
  const contract = getDBTCContract(dbtcAddress, signer);
  
  const tx = await contract.assignPhaseResponsibility(phase, deptCode);
  return await waitForTransaction(tx);
}

/**
 * Start the budget call phase
 * @param privateKey Private key of responsible department owner
 * @param dbtcAddress Optional DBTC contract address
 * @returns Transaction result
 */
export async function startBudgetCall(
  privateKey?: string,
  dbtcAddress?: string
): Promise<TransactionResult> {
  const signer = getSigner(privateKey);
  const contract = getDBTCContract(dbtcAddress, signer);
  
  const tx = await contract.startBudgetCall();
  return await waitForTransaction(tx);
}

/**
 * Advance to the next phase
 * @param privateKey Private key of responsible department owner
 * @param dbtcAddress Optional DBTC contract address
 * @returns Transaction result
 */
export async function advancePhase(
  privateKey?: string,
  dbtcAddress?: string
): Promise<TransactionResult> {
  const signer = getSigner(privateKey);
  const contract = getDBTCContract(dbtcAddress, signer);
  
  const tx = await contract.advancePhase();
  return await waitForTransaction(tx);
}

// ============ Read Functions ============

/**
 * Get current budget phase
 * @param dbtcAddress Optional DBTC contract address
 * @returns Current phase
 */
export async function getCurrentPhase(dbtcAddress?: string): Promise<BudgetPhase> {
  const contract = getDBTCContract(dbtcAddress);
  const phase = await contract.getCurrentPhase();
  return Number(phase) as BudgetPhase;
}

/**
 * Get current fiscal year
 * @param dbtcAddress Optional DBTC contract address
 * @returns Fiscal year
 */
export async function getCurrentFiscalYear(dbtcAddress?: string): Promise<number> {
  const contract = getDBTCContract(dbtcAddress);
  const year = await contract.getCurrentFiscalYear();
  return Number(year);
}

/**
 * Get department address by code
 * @param deptCode Department code
 * @param dbtcAddress Optional DBTC contract address
 * @returns Department contract address
 */
export async function getDepartment(deptCode: string, dbtcAddress?: string): Promise<string> {
  const contract = getDBTCContract(dbtcAddress);
  return await contract.getDepartment(deptCode);
}

/**
 * Check if department is registered
 * @param deptCode Department code
 * @param dbtcAddress Optional DBTC contract address
 * @returns True if registered
 */
export async function isDepartmentRegistered(deptCode: string, dbtcAddress?: string): Promise<boolean> {
  const contract = getDBTCContract(dbtcAddress);
  return await contract.isDepartmentRegistered(deptCode);
}

/**
 * Get all department codes
 * @param dbtcAddress Optional DBTC contract address
 * @returns Array of department codes
 */
export async function getDepartmentCodes(dbtcAddress?: string): Promise<string[]> {
  const contract = getDBTCContract(dbtcAddress);
  return await contract.getDepartmentCodes();
}

/**
 * Get department count
 * @param dbtcAddress Optional DBTC contract address
 * @returns Number of departments
 */
export async function getDepartmentCount(dbtcAddress?: string): Promise<number> {
  const contract = getDBTCContract(dbtcAddress);
  const count = await contract.getDepartmentCount();
  return Number(count);
}

/**
 * Get responsible department for a phase
 * @param phase Budget phase
 * @param dbtcAddress Optional DBTC contract address
 * @returns Department code
 */
export async function getPhaseResponsibleDepartment(
  phase: BudgetPhase,
  dbtcAddress?: string
): Promise<string> {
  const contract = getDBTCContract(dbtcAddress);
  return await contract.getPhaseResponsibleDepartment(phase);
}

/**
 * Get budget proposal contract address
 * @param dbtcAddress Optional DBTC contract address
 * @returns BudgetProposal contract address
 */
export async function getBudgetProposalContract(dbtcAddress?: string): Promise<string> {
  const contract = getDBTCContract(dbtcAddress);
  return await contract.getBudgetProposalContract();
}

/**
 * Get DBTC owner address
 * @param dbtcAddress Optional DBTC contract address
 * @returns Owner address
 */
export async function getDBTCOwner(dbtcAddress?: string): Promise<string> {
  const contract = getDBTCContract(dbtcAddress);
  return await contract.owner();
}
