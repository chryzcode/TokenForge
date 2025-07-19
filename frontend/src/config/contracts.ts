// Contract configuration for TokenForge frontend
export interface ContractConfig {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  network: string;
}

// Use Vite environment variables for contract address and network
export const CONTRACT_CONFIG: ContractConfig = {
  address: import.meta.env.VITE_CONTRACT_ADDRESS || "",
  name: "TokenForge",
  symbol: "TFG",
  decimals: 18,
  network: import.meta.env.VITE_NETWORK || "localhost"
};

// Network configurations
export const NETWORKS = {
  localhost: {
    name: "Localhost",
    chainId: 1337,
    rpcUrl: "http://127.0.0.1:8545",
    explorer: "",
  },
  sepolia: {
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/",
    explorer: "https://sepolia.etherscan.io",
  },
  polygon: {
    name: "Polygon",
    chainId: 137,
    rpcUrl: "https://polygon-rpc.com",
    explorer: "https://polygonscan.com",
  },
  polygonMumbai: {
    name: "Polygon Mumbai",
    chainId: 80001,
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    explorer: "https://mumbai.polygonscan.com",
  },
};

// Contract ABI (minimal version for frontend)
export const TOKEN_ABI = [
  // ERC-20 Standard Functions
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  
  // TokenForge Specific Functions
  "function mint(address to, uint256 amount, string reason)",
  "function burn(uint256 amount, string reason)",
  "function burnFrom(address from, uint256 amount, string reason)",
  "function pause(string reason)",
  "function unpause()",
  "function paused() view returns (bool)",
  "function remainingSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
  "function INITIAL_SUPPLY() view returns (uint256)",
  
  // Role Management
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function getRoleAdmin(bytes32 role) view returns (bytes32)",
  "function grantRole(bytes32 role, address account)",
  "function revokeRole(bytes32 role, address account)",
  
  // Role Constants
  "function DEFAULT_ADMIN_ROLE() view returns (bytes32)",
  "function PAUSER_ROLE() view returns (bytes32)",
  "function MINTER_ROLE() view returns (bytes32)",
  "function BURNER_ROLE() view returns (bytes32)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event TokensMinted(address indexed to, uint256 amount, string reason)",
  "event TokensBurned(address indexed from, uint256 amount, string reason)",
  "event EmergencyPause(address indexed pauser, string reason)",
  "event EmergencyUnpause(address indexed unpauser)",
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)",
] as const;

// Update contract address after deployment
export function updateContractAddress(address: string, network: string) {
  CONTRACT_CONFIG.address = address;
  CONTRACT_CONFIG.network = network;
  console.log(`Contract address updated: ${address} on ${network}`);
} 