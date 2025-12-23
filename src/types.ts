/**
 * Budget phases in the Philippine budget cycle
 */
export enum BudgetPhase {
  PRE_BUDGET = 0,        // Setup phase - configure departments, agencies
  BUDGET_CALL = 1,       // Agencies submit budget proposals
  TECHNICAL_REVIEW = 2,  // DBM reviews proposals
  NEP_CONSOLIDATION = 3, // DBM consolidates into NEP
  GAB_SEPARATE = 4,      // House & Senate separate review
  GAB_BICAM = 5,         // Bicameral conference
  GAA_ENACTMENT = 6      // President signs into law
}

/**
 * Status of a budget proposal
 */
export enum ProposalStatus {
  DRAFT = 0,
  SUBMITTED = 1,
  UNDER_REVIEW = 2,
  APPROVED = 3,
  REVISED = 4,
  AMENDED = 5,
  REJECTED = 6,
  ENACTED = 7
}

/**
 * Types of budget entities
 */
export enum EntityType {
  REGULAR = 0,   // Regular department with agencies
  STANDALONE = 1 // Standalone entity (SUCs, etc.)
}

/**
 * On-chain proposal data structure
 */
export interface ProposalData {
  /** PREXC/FPAP identifier */
  prexcFpapId: string;
  /** UACS Object Code */
  uacsObjCode: string;
  /** Amount in smallest unit (wei-equivalent) */
  amount: bigint | string | number;
}

/**
 * Full on-chain proposal data (includes auto-filled fields)
 */
export interface OnChainProposalData extends ProposalData {
  fiscalYear: number;
  departmentCode: string;
  agencyCode: string;
}

/**
 * Transaction result
 */
export interface TransactionResult {
  /** Transaction hash */
  txHash: string;
  /** Block number */
  blockNumber: number;
  /** Gas used */
  gasUsed: bigint;
  /** Success status */
  success: boolean;
  /** Event data (if applicable) */
  events?: Record<string, any>;
}

/**
 * Agency information
 */
export interface AgencyInfo {
  address: string;
  code: string;
  name: string;
  department: string;
  owner: string;
}

/**
 * Department information
 */
export interface DepartmentInfo {
  address: string;
  code: string;
  name: string;
  dbtc: string;
  mainAgency: string;
  isStandalone: boolean;
  isActualDepartment: boolean;
  agencyCount: number;
}

/**
 * Get human-readable phase name
 */
export function getPhaseName(phase: BudgetPhase): string {
  const names: Record<BudgetPhase, string> = {
    [BudgetPhase.PRE_BUDGET]: 'Pre-Budget',
    [BudgetPhase.BUDGET_CALL]: 'Budget Call',
    [BudgetPhase.TECHNICAL_REVIEW]: 'Technical Review',
    [BudgetPhase.NEP_CONSOLIDATION]: 'NEP Consolidation',
    [BudgetPhase.GAB_SEPARATE]: 'GAB Separate (House & Senate)',
    [BudgetPhase.GAB_BICAM]: 'GAB Bicameral',
    [BudgetPhase.GAA_ENACTMENT]: 'GAA Enactment'
  };
  return names[phase] ?? 'Unknown';
}

/**
 * Get human-readable status name
 */
export function getStatusName(status: ProposalStatus): string {
  const names: Record<ProposalStatus, string> = {
    [ProposalStatus.DRAFT]: 'Draft',
    [ProposalStatus.SUBMITTED]: 'Submitted',
    [ProposalStatus.UNDER_REVIEW]: 'Under Review',
    [ProposalStatus.APPROVED]: 'Approved',
    [ProposalStatus.REVISED]: 'Revised',
    [ProposalStatus.AMENDED]: 'Amended',
    [ProposalStatus.REJECTED]: 'Rejected',
    [ProposalStatus.ENACTED]: 'Enacted'
  };
  return names[status] ?? 'Unknown';
}
