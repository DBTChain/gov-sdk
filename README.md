# @dbtchain/gov-sdk

Public SDK for simplified blockchain interactions with the Digital Bayanihan Transparency Chain (DBTC).

## Installation

```bash
npm install @dbtchain/gov-sdk
```

## Quick Start

### Option 1: Using Environment Variables (Recommended)

Set these environment variables:
```env
DBTC_CHAIN_MODE=testnet    # or 'mainnet'
DBTC_API_KEY=your-api-key  # Provided by DBTC
PRIVATE_KEY=your-wallet-private-key
```

Then use the SDK:
```typescript
import { getCurrentPhase, getPhaseName, submitProposal } from '@dbtchain/gov-sdk';

// SDK auto-configures from environment variables
const phase = await getCurrentPhase();
console.log('Current Phase:', getPhaseName(phase));
```

### Option 2: Programmatic Configuration

```typescript
import { configure, submitProposal } from '@dbtchain/gov-sdk';

configure({
  chainMode: 'testnet',  // 'testnet' (Polygon Amoy) or 'mainnet' (Polygon)
  apiKey: 'your-dbtc-api-key',
  privateKey: process.env.PRIVATE_KEY
});
```

## Networks

| Mode | Network | Chain ID | RPC Endpoint |
|------|---------|----------|--------------|
| `testnet` | Polygon Amoy | 80002 | https://amoy.dbtc.bayanichain.io |
| `mainnet` | Polygon | 137 | https://polygon.dbtc.bayanichain.io |

## Usage Examples

### Agency Actions

```typescript
import { 
  submitProposal, 
  reviseProposal, 
  addDocumentManager,
  getAgencyInfo 
} from '@dbtchain/gov-sdk';

// Submit a budget proposal
const result = await submitProposal(
  '0xAgencyAddress',
  'ipfs://metadata-uri',
  {
    prexcFpapId: 'PREXC-001',
    uacsObjCode: 'PS-001',
    amount: 1000000n
  }
  // privateKey optional if set in env/config
);
console.log('Token ID:', result.tokenId);

// Revise a proposal
const revision = await reviseProposal(
  '0xAgencyAddress',
  result.tokenId,
  'ipfs://new-metadata-uri',
  { prexcFpapId: 'PREXC-001', uacsObjCode: 'PS-001', amount: 1100000n },
  'Updated amount based on new requirements'
);

// Add document manager (requires agency owner key)
await addDocumentManager(
  '0xAgencyAddress',
  '0xManagerAddress',
  process.env.AGENCY_OWNER_KEY // explicit key if different from default
);

// Get agency info (read-only, no key needed)
const info = await getAgencyInfo('0xAgencyAddress');
console.log(info);
```

### Department Actions

```typescript
import { addAgency, getDepartmentInfo } from '@dbtchain/gov-sdk';

// Add a new agency
const result = await addAgency(
  '0xDepartmentAddress',
  '002',
  'Bureau of Treasury',
  '0xAgencyOwnerAddress'
);
console.log('New Agency:', result.agencyAddress);

// Get department info
const info = await getDepartmentInfo('0xDepartmentAddress');
console.log(info);
```

### DBTC Phase Management (DBM Only)

```typescript
import { 
  addDepartment, 
  assignPhaseResponsibility,
  startBudgetCall,
  advancePhase,
  BudgetPhase 
} from '@dbtchain/gov-sdk';

// Add a department
const result = await addDepartment(
  '02',
  'Department of Finance',
  'Office of the Secretary',
  '0xOwnerAddress',
  false, // not standalone
  true   // actual department
);

// Assign phase responsibility
await assignPhaseResponsibility(BudgetPhase.BUDGET_CALL, '02');

// Start budget call
await startBudgetCall();

// Advance phase
await advancePhase();
```

## API Reference

### Configuration
- `configure(config)` - Configure the SDK
- `getChainMode()` - Get current chain mode
- `isTestnet()` / `isMainnet()` - Check current network

### Agency Functions
- `submitProposal()` - Submit a budget proposal
- `reviseProposal()` - Revise an existing proposal
- `amendProposal()` - Amend a proposal during GAB phase
- `submitSeparateGAB()` - Submit separate House/Senate GAB
- `submitJointGAB()` - Submit joint bicameral GAB
- `addDocumentManager()` - Add a document manager
- `removeDocumentManager()` - Remove a document manager
- `transferAgencyOwnership()` - Transfer agency ownership
- `getAgencyInfo()` - Get agency information
- `isDocumentManager()` - Check if address is document manager
- `getDocumentManagers()` - Get all document managers

### Department Functions
- `addAgency()` - Add a new agency
- `setHouseAndSenate()` - Set Congress House/Senate agencies
- `getDepartmentInfo()` - Get department information
- `getAgency()` - Get agency by code
- `isAgencyRegistered()` - Check if agency is registered
- `getAgencyCodes()` - Get all agency codes
- `getMainAgency()` - Get main agency address
- `getHouseAgency()` / `getSenateAgency()` - Get Congress agencies
- `getDepartmentOwner()` - Get department owner

### DBTC Functions
- `addDepartment()` - Add a new department
- `addRegularDepartment()` - Add a regular department
- `assignPhaseResponsibility()` - Assign phase responsibility
- `startBudgetCall()` - Start budget call phase
- `advancePhase()` - Advance to next phase
- `getCurrentPhase()` - Get current budget phase
- `getCurrentFiscalYear()` - Get current fiscal year
- `getDepartment()` - Get department by code
- `isDepartmentRegistered()` - Check if department is registered
- `getDepartmentCodes()` - Get all department codes
- `getDepartmentCount()` - Get department count
- `getPhaseResponsibleDepartment()` - Get responsible department for phase
- `getBudgetProposalContract()` - Get BudgetProposal contract address
- `getDBTCOwner()` - Get DBTC owner

## Getting Your API Key

Contact DBTC to obtain your API key for accessing the blockchain network.

## License

MIT
