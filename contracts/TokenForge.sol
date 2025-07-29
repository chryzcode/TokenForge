// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/extensions/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TokenForge
 * @dev A comprehensive ERC-20 token with advanced features
 * - Mintable and burnable
 * - Pausable for emergency stops
 * - Role-based access control
 * - Anti-reentrancy protection
 * - Initial supply distribution
 */
contract TokenForge is ERC20, ERC20Burnable, ERC20Pausable, AccessControlEnumerable, ReentrancyGuard {
    // Role definitions
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    
    // Token configuration
    uint256 public constant INITIAL_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10 billion max supply
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event EmergencyPause(address indexed pauser, string reason);
    event EmergencyUnpause(address indexed unpauser);
    
    // Modifiers
    modifier onlyMinter() {
        require(hasRole(MINTER_ROLE, msg.sender), "TokenForge: must have minter role");
        _;
    }
    
    modifier onlyBurner() {
        require(hasRole(BURNER_ROLE, msg.sender), "TokenForge: must have burner role");
        _;
    }
    
    modifier onlyPauser() {
        require(hasRole(PAUSER_ROLE, msg.sender), "TokenForge: must have pauser role");
        _;
    }
    
    modifier supplyLimit(uint256 amount) {
        require(totalSupply() + amount <= MAX_SUPPLY, "TokenForge: would exceed max supply");
        _;
    }
    
    /**
     * @dev Constructor sets up initial roles and mints initial supply
     * @param owner The address that will receive initial supply and admin roles
     */
    constructor(address owner) ERC20("TokenForge", "TFG") {
        require(owner != address(0), "TokenForge: owner cannot be zero address");
        
        // Grant roles
        _grantRole(DEFAULT_ADMIN_ROLE, owner);
        _grantRole(PAUSER_ROLE, owner);
        _grantRole(MINTER_ROLE, owner);
        _grantRole(BURNER_ROLE, owner);
        
        // Mint initial supply to owner
        _mint(owner, INITIAL_SUPPLY);
        
        emit TokensMinted(owner, INITIAL_SUPPLY, "Initial supply");
    }
    
    /**
     * @dev Mints new tokens
     * @param to The address to mint tokens to
     * @param amount The amount of tokens to mint
     * @param reason Optional reason for minting
     */
    function mint(address to, uint256 amount, string memory reason) 
        external 
        onlyMinter 
        supplyLimit(amount) 
        nonReentrant 
    {
        require(to != address(0), "TokenForge: cannot mint to zero address");
        require(amount > 0, "TokenForge: amount must be greater than 0");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Burns tokens from caller
     * @param amount The amount of tokens to burn
     * @param reason Optional reason for burning
     */
    function burn(uint256 amount, string memory reason) 
        external 
        nonReentrant 
    {
        require(amount > 0, "TokenForge: amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "TokenForge: insufficient balance");
        
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, reason);
    }
    
    /**
     * @dev Burns tokens from a specific address (requires burner role)
     * @param from The address to burn tokens from
     * @param amount The amount of tokens to burn
     * @param reason Optional reason for burning
     */
    function burnFrom(address from, uint256 amount, string memory reason) 
        external 
        onlyBurner 
        nonReentrant 
    {
        require(from != address(0), "TokenForge: cannot burn from zero address");
        require(amount > 0, "TokenForge: amount must be greater than 0");
        require(balanceOf(from) >= amount, "TokenForge: insufficient balance");
        
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }
    
    /**
     * @dev Pauses all token transfers
     * @param reason Optional reason for pausing
     */
    function pause(string memory reason) external onlyPauser {
        _pause();
        emit EmergencyPause(msg.sender, reason);
    }
    
    /**
     * @dev Unpauses all token transfers
     */
    function unpause() external onlyPauser {
        _unpause();
        emit EmergencyUnpause(msg.sender);
    }
    
    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Returns the remaining supply that can be minted
     */
    function remainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }
    
    /**
     * @dev Override required by OpenZeppelin v5 for ERC20Pausable
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
} 