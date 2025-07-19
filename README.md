# 🪙 TokenForge

A comprehensive Web3 token project built with modern tools and best practices. TokenForge provides a complete ERC-20 token implementation with advanced features, a beautiful React frontend, and comprehensive testing.

## ✨ Features

### Smart Contract Features
- **ERC-20 Standard**: Full ERC-20 compliance with extensions
- **Role-Based Access Control**: Secure role management for minting, burning, and pausing
- **Mintable & Burnable**: Controlled token supply management
- **Pausable**: Emergency pause functionality for security
- **Anti-Reentrancy Protection**: Secure against reentrancy attacks
- **Supply Limits**: Maximum supply cap with remaining supply tracking
- **Event Logging**: Comprehensive event emission for transparency

### Frontend Features
- **Modern UI**: Beautiful, responsive design with dark theme
- **Wallet Integration**: MetaMask connection with account switching
- **Real-time Updates**: Live token balance and supply information
- **Admin Functions**: Role-based admin operations (mint, pause, burn)
- **Transaction Management**: Send, burn, and manage tokens
- **Error Handling**: User-friendly error messages and loading states

### Development Features
- **TypeScript**: Full TypeScript support for type safety
- **Comprehensive Testing**: 100% test coverage for all functionality
- **Gas Optimization**: Optimized contract for cost efficiency
- **Multi-Network Support**: Deploy to Ethereum, Polygon, and testnets
- **Contract Verification**: Automated contract verification on block explorers

## 🛠 Tech Stack

### Smart Contracts
- **Solidity 0.8.20**: Latest stable version with security features
- **OpenZeppelin**: Battle-tested smart contract libraries
- **Hardhat**: Development environment and testing framework
- **Ethers.js v6**: Modern Ethereum library

### Frontend
- **React 18**: Latest React with hooks and modern patterns
- **Vite**: Fast build tool (modern alternative to Create React App)
- **TypeScript**: Type-safe development
- **Ethers.js v6**: Web3 integration
- **Modern CSS**: CSS variables, flexbox, and responsive design

### Development Tools
- **Hardhat**: Smart contract development and testing
- **TypeScript**: Type safety across the stack
- **ESLint & Prettier**: Code quality and formatting
- **Git**: Version control

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask wallet extension

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TokenForge
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run install:frontend
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Compile contracts**
   ```bash
   npm run compile
   ```

5. **Run tests**
   ```bash
   npm test
   ```

### Local Development

1. **Start local blockchain**
   ```bash
   npm run node
   ```

2. **Deploy contracts locally**
   ```bash
   npm run deploy:local
   ```

3. **Start frontend**
   ```bash
   npm run frontend:dev
   ```

4. **Open browser**
   Navigate to `http://localhost:5173`

### Deployment

#### To Sepolia Testnet
```bash
npm run deploy:sepolia
```

#### To Polygon Mainnet
```bash
npm run deploy:polygon
```

#### To Polygon Mumbai Testnet
```bash
npm run deploy:polygonMumbai
```

## 📋 Contract Functions

### Public Functions
- `name()` - Returns token name
- `symbol()` - Returns token symbol
- `decimals()` - Returns token decimals (18)
- `totalSupply()` - Returns total token supply
- `balanceOf(address)` - Returns balance of specified address
- `transfer(address, uint256)` - Transfer tokens to address
- `remainingSupply()` - Returns remaining mintable supply
- `paused()` - Returns contract pause status

### Role-Based Functions
- `mint(address, uint256, string)` - Mint new tokens (MINTER_ROLE)
- `burn(uint256, string)` - Burn own tokens
- `burnFrom(address, uint256, string)` - Burn tokens from address (BURNER_ROLE)
- `pause(string)` - Pause contract (PAUSER_ROLE)
- `unpause()` - Unpause contract (PAUSER_ROLE)

### Role Management
- `grantRole(bytes32, address)` - Grant role to address (ADMIN_ROLE)
- `revokeRole(bytes32, address)` - Revoke role from address (ADMIN_ROLE)
- `hasRole(bytes32, address)` - Check if address has role

## 🎨 Frontend Usage

### Connecting Wallet
1. Click "Connect Wallet" button
2. Approve MetaMask connection
3. Switch to correct network if needed

### Token Operations
- **Transfer**: Send tokens to any address
- **Burn**: Destroy your own tokens
- **Mint**: Create new tokens (requires MINTER_ROLE)
- **Pause/Unpause**: Emergency contract control (requires PAUSER_ROLE)

### Admin Functions
- **Mint Tokens**: Create new tokens for any address
- **Pause Contract**: Emergency stop all transfers
- **Unpause Contract**: Resume normal operations

## 🔧 Configuration

### Environment Variables
```bash
# Network RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
POLYGON_RPC_URL=https://polygon-rpc.com
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com

# Deployment
PRIVATE_KEY=your_private_key_here

# Verification
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key

# Gas reporting
REPORT_GAS=true
```

### Contract Configuration
- **Initial Supply**: 1,000,000,000 TFG (1 billion)
- **Max Supply**: 10,000,000,000 TFG (10 billion)
- **Decimals**: 18
- **Symbol**: TFG
- **Name**: TokenForge

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Test Coverage
- Contract deployment and initialization
- Role management and access control
- Token minting and burning
- Transfer functionality
- Pause/unpause operations
- Supply management
- Error handling and edge cases

## 📦 Project Structure

```
TokenForge/
├── contracts/
│   └── TokenForge.sol          # Main token contract
├── scripts/
│   └── deploy.ts              # Deployment script
├── test/
│   └── TokenForge.test.ts     # Comprehensive tests
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── App.css           # Modern styling
│   │   └── config/
│   │       └── contracts.ts  # Contract configuration
│   └── package.json
├── hardhat.config.ts         # Hardhat configuration
├── package.json              # Project dependencies
└── README.md                 # This file
```

## 🔒 Security Features

- **OpenZeppelin Contracts**: Battle-tested security
- **Role-Based Access Control**: Granular permissions
- **Reentrancy Protection**: Prevents reentrancy attacks
- **Supply Limits**: Prevents infinite minting
- **Pausable**: Emergency stop functionality
- **Input Validation**: Comprehensive parameter checking
- **Event Logging**: Transparent operation tracking

## 🌐 Network Support

- **Ethereum Mainnet**: Production deployment
- **Sepolia Testnet**: Ethereum testnet
- **Polygon Mainnet**: Low-cost L2 deployment
- **Polygon Mumbai**: Polygon testnet
- **Localhost**: Development and testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the test files for usage examples

## 🎯 Roadmap

- [ ] Token vesting contracts
- [ ] Staking functionality
- [ ] Governance integration
- [ ] Mobile app
- [ ] Advanced analytics dashboard
- [ ] Multi-chain deployment scripts
- [ ] Gas optimization improvements

---

**Built with ❤️ using modern Web3 technologies**
