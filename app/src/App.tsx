import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_CONFIG, TOKEN_ABI } from './config/contracts'
import './App.css'

import { FaWallet, FaCoins, FaCheckCircle, FaPauseCircle, FaUserShield, FaArrowRight, FaFire, FaPlusCircle } from 'react-icons/fa';

interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  balance: string;
  remainingSupply: string;
  maxSupply: string;
  paused: boolean;
}

interface WalletInfo {
  address: string;
  balance: string;
  connected: boolean;
  networkName: string;
}

function App() {
  const [wallet, setWallet] = useState<WalletInfo>({
    address: '',
    balance: '0',
    connected: false,
    networkName: ''
  });
  
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>({
    name: '',
    symbol: '',
    decimals: 18,
    totalSupply: '0',
    balance: '0',
    remainingSupply: '0',
    maxSupply: '0',
    paused: false
  });

  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [owner, setOwner] = useState<string>('');
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [burnAmount, setBurnAmount] = useState('');
  const [mintAmount, setMintAmount] = useState('');
  const [mintRecipient, setMintRecipient] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Connect wallet
  const connectWallet = async () => {
    try {
      setError('');
      // Prefer MetaMask if multiple providers are present
      let ethereum = (window as any).ethereum;
      if (ethereum && ethereum.providers) {
        // Find MetaMask in the list of providers
        ethereum = ethereum.providers.find((p: any) => p.isMetaMask) || ethereum;
      }
      if (!ethereum || !ethereum.isMetaMask) {
        throw new Error('MetaMask is not installed or not the default wallet. Please install or enable MetaMask.');
      }

      const provider = new ethers.BrowserProvider(ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const network = await provider.getNetwork();
      setWallet({
        address,
        balance: ethers.formatEther(balance),
        connected: true,
        networkName: network.name
      });

      // Initialize contract
      if (CONTRACT_CONFIG.address) {
        const contract = new ethers.Contract(CONTRACT_CONFIG.address, TOKEN_ABI, signer);
        setContract(contract);
        await loadTokenInfo(contract, address);
        // Get the actual owner address from the contract
        try {
          const DEFAULT_ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000';
          // Get the first (and only) member of DEFAULT_ADMIN_ROLE
          const ownerAddress = await contract.getRoleMember(DEFAULT_ADMIN_ROLE, 0);
          setOwner(ownerAddress.toLowerCase());
        } catch (err) {
          console.log('Error getting owner address:', err);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet({
      address: '',
      balance: '0',
      connected: false,
      networkName: ''
    });
    setTokenInfo({
      name: '',
      symbol: '',
      decimals: 18,
      totalSupply: '0',
      balance: '0',
      remainingSupply: '0',
      maxSupply: '0',
      paused: false
    });
    setContract(null);
    setError('');
  };

  // Load token information
  const loadTokenInfo = async (contractInstance: ethers.Contract, userAddress: string) => {
    try {
      const [
        name,
        symbol,
        decimals,
        totalSupply,
        balance,
        remainingSupply,
        maxSupply,
        paused
      ] = await Promise.all([
        contractInstance.name(),
        contractInstance.symbol(),
        contractInstance.decimals(),
        contractInstance.totalSupply(),
        contractInstance.balanceOf(userAddress),
        contractInstance.remainingSupply(),
        contractInstance.MAX_SUPPLY(),
        contractInstance.paused()
      ]);

      setTokenInfo({
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatEther(totalSupply),
        balance: ethers.formatEther(balance),
        remainingSupply: ethers.formatEther(remainingSupply),
        maxSupply: ethers.formatEther(maxSupply),
        paused
      });
    } catch (err) {
      console.error('Error loading token info:', err);
    }
  };

  // Transfer tokens
  const transferTokens = async () => {
    if (!contract || !recipient || !amount) return;
    
    try {
      setLoading(true);
      setError('');
      
      const amountWei = ethers.parseEther(amount);
      const tx = await contract.transfer(recipient, amountWei);
      await tx.wait();
      
      // Refresh data
      await loadTokenInfo(contract, wallet.address);
      setAmount('');
      setRecipient('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed');
    } finally {
      setLoading(false);
    }
  };

  // Burn tokens
  const burnTokens = async () => {
    if (!contract || !burnAmount) return;
    
    try {
      setLoading(true);
      setError('');
      
      const amountWei = ethers.parseEther(burnAmount);
      const tx = await contract.burn(amountWei, reason || 'User burn');
      await tx.wait();
      
      // Refresh data
      await loadTokenInfo(contract, wallet.address);
      setBurnAmount('');
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Burn failed');
    } finally {
      setLoading(false);
    }
  };

  // Mint tokens (requires minter role)
  const mintTokens = async () => {
    if (!contract || !mintAmount || !mintRecipient) return;
    
    try {
      setLoading(true);
      setError('');
      
      const amountWei = ethers.parseEther(mintAmount);
      const tx = await contract.mint(mintRecipient, amountWei, reason || 'Admin mint');
      await tx.wait();
      
      // Refresh data
      await loadTokenInfo(contract, wallet.address);
      setMintAmount('');
      setMintRecipient('');
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mint failed');
    } finally {
      setLoading(false);
    }
  };

  // Pause/Unpause contract (requires pauser role)
  const togglePause = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      setError('');
      
      const tx = tokenInfo.paused 
        ? await contract.unpause()
        : await contract.pause(reason || 'Emergency pause');
      
      await tx.wait();
      
      // Refresh data
      await loadTokenInfo(contract, wallet.address);
      setReason('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Pause operation failed');
    } finally {
      setLoading(false);
    }
  };

  // Auto-connect on page load
  useEffect(() => {
    if ((window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', () => {
        window.location.reload();
      });
      
      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="app">
      {wallet.connected && wallet.networkName !== 'sepolia' && (
        <div className="wrong-network-bar">
          Wrong Network! Please switch to the Sepolia Testnet.
        </div>
      )}

      {wallet.connected && wallet.networkName === 'sepolia' && (
        <div className="network-indicator-bar">
          You are connected to the Sepolia Testnet
        </div>
      )}

      <header className="header">
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '2.2rem', color: '#fff' }}>🟣</span> TokenForge
        </h1>
        <p style={{ fontSize: '1.15rem', color: '#e0e7ff', marginTop: '0.5rem' }}>
          A comprehensive Web3 token management platform
        </p>
      </header>

      {/* Sepolia Testnet Notice */}
      <div className="sepolia-notice">
        <div className="notice-content">
          <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🔗</span>
          <strong>TokenForge is currently available on Sepolia Testnet only</strong>
          <span style={{ marginLeft: '0.5rem', opacity: 0.8 }}>
            - Connect your wallet to Sepolia testnet to interact with the token
          </span>
        </div>
      </div>

      <main className="main">
        {!wallet.connected ? (
          <div className="connect-section card">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaWallet /> Connect Your Wallet
            </h2>
            <p>Connect your MetaMask wallet to interact with TokenForge</p>
            <button type="button" onClick={connectWallet} className="connect-btn">
              🔗 Connect Wallet
            </button>
          </div>
        ) : (
          <div className="dashboard">
            {/* Wallet Info */}
            <div className="card wallet-info">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaWallet /> Wallet Information
                {wallet.address && owner && wallet.address.toLowerCase() === owner && (
                  <span style={{ background: '#10b981', color: 'white', borderRadius: '0.5rem', padding: '0.2rem 0.7rem', fontSize: '0.85rem', marginLeft: '0.5rem' }}>Owner</span>
                )}
              </h3>
              <p><strong>Address:</strong> <span style={{ color: '#818cf8', wordBreak: 'break-all' }}>{wallet.address}</span></p>
              <p><strong>ETH Balance:</strong> {parseFloat(wallet.balance).toFixed(4)} ETH</p>
              <button onClick={disconnectWallet}>Disconnect</button>
            </div>

            {/* Token Info */}
            <div className="card token-info">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaCoins /> Token Information
              </h3>
              <div className="token-stats">
                <div className="stat"><span className="label">Name:</span><span className="value">{tokenInfo.name || <span style={{ color: '#64748b' }}>—</span>}</span></div>
                <div className="stat"><span className="label">Symbol:</span><span className="value">{tokenInfo.symbol || <span style={{ color: '#64748b' }}>—</span>}</span></div>
                <div className="stat"><span className="label">Your Balance:</span><span className="value">{parseFloat(tokenInfo.balance).toLocaleString()} {tokenInfo.symbol}</span></div>
                <div className="stat"><span className="label">Total Supply:</span><span className="value">{parseFloat(tokenInfo.totalSupply).toLocaleString()} {tokenInfo.symbol}</span></div>
                <div className="stat"><span className="label">Max Supply:</span><span className="value">{parseFloat(tokenInfo.maxSupply).toLocaleString()} {tokenInfo.symbol}</span></div>
                <div className="stat"><span className="label">Remaining:</span><span className="value">{parseFloat(tokenInfo.remainingSupply).toLocaleString()} {tokenInfo.symbol}</span></div>
                <div className="stat">
                  <span className="label">Status:</span>
                  <span className={`value ${tokenInfo.paused ? 'paused' : 'active'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {tokenInfo.paused ? <FaPauseCircle color="#ef4444" /> : <FaCheckCircle color="#10b981" />} {tokenInfo.paused ? 'Paused' : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="card error">
                <h3>❌ Error</h3>
                <p>{error}</p>
              </div>
            )}

            {/* Transfer Section */}
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaArrowRight /> Transfer Tokens</h3>
              <div className="form-group">
                <input type="text" placeholder="Recipient Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} className="input" />
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
                <button onClick={transferTokens} disabled={loading || !recipient || !amount} className="btn primary">
                  {loading ? '⏳ Processing...' : 'Send Tokens'}
                </button>
              </div>
            </div>

            {/* Burn Section */}
            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaFire color="#ef4444" /> Burn Tokens</h3>
              <div className="form-group">
                <input type="number" placeholder="Amount to Burn" value={burnAmount} onChange={(e) => setBurnAmount(e.target.value)} className="input" />
                <input type="text" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="input" />
                <button onClick={burnTokens} disabled={loading || !burnAmount} className="btn danger">
                  {loading ? '⏳ Processing...' : 'Burn Tokens'}
                </button>
              </div>
            </div>

            {/* Admin Section */}
            {wallet.address && owner && wallet.address.toLowerCase() === owner && (
              <div className="card admin-section">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaUserShield /> Admin Functions</h3>
                {/* Mint Section */}
                <div className="admin-function">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaPlusCircle color="#10b981" /> Mint Tokens</h4>
                  <div className="form-group">
                    <input type="text" placeholder="Recipient Address" value={mintRecipient} onChange={(e) => setMintRecipient(e.target.value)} className="input" />
                    <input type="number" placeholder="Amount to Mint" value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} className="input" />
                    <button onClick={mintTokens} disabled={loading || !mintAmount || !mintRecipient} className="btn success">
                      {loading ? '⏳ Processing...' : 'Mint Tokens'}
                    </button>
                  </div>
                </div>
                {/* Pause/Unpause Section */}
                <div className="admin-function">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaPauseCircle color="#f59e0b" /> Pause/Unpause Contract</h4>
                  <div className="form-group">
                    <input type="text" placeholder="Reason (optional)" value={reason} onChange={(e) => setReason(e.target.value)} className="input" />
                    <button onClick={togglePause} disabled={loading} className={`btn ${tokenInfo.paused ? 'success' : 'warning'}`}>
                      {loading ? '⏳ Processing...' : (tokenInfo.paused ? 'Unpause Contract' : 'Pause Contract')}
                    </button>
                  </div>
                </div>
                {/* Burn From Any Address (optional, if you want to expose) */}
                {/*
                <div className="admin-function">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaFire color="#ef4444" /> Burn From Any Address</h4>
                  <div className="form-group">
                    <input type="text" placeholder="Address to Burn From" value={burnFromAddress} onChange={(e) => setBurnFromAddress(e.target.value)} className="input" />
                    <input type="number" placeholder="Amount to Burn" value={burnFromAmount} onChange={(e) => setBurnFromAmount(e.target.value)} className="input" />
                    <button onClick={burnFromAny} disabled={loading || !burnFromAddress || !burnFromAmount} className="btn danger">
                      {loading ? '⏳ Processing...' : 'Burn From Address'}
                    </button>
                  </div>
                </div>
                */}
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Built with ❤️ using Hardhat, React, and Ethers.js</p>
      </footer>
    </div>
  )
}

export default App
