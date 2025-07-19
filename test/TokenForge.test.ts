import { expect } from "chai";
import { ethers } from "hardhat";
import { TokenForge } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TokenForge", function () {
  let tokenForge: TokenForge;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let minter: SignerWithAddress;
  let burner: SignerWithAddress;
  let pauser: SignerWithAddress;

  const INITIAL_SUPPLY = ethers.parseEther("1000000000"); // 1 billion
  const MAX_SUPPLY = ethers.parseEther("10000000000"); // 10 billion
  const MINT_AMOUNT = ethers.parseEther("1000");
  const BURN_AMOUNT = ethers.parseEther("100");

  beforeEach(async function () {
    [owner, user1, user2, minter, burner, pauser] = await ethers.getSigners();

    const TokenForge = await ethers.getContractFactory("TokenForge");
    tokenForge = await TokenForge.deploy(owner.address);
    await tokenForge.waitForDeployment();

    // Grant roles to different accounts for testing
    await tokenForge.grantRole(await tokenForge.MINTER_ROLE(), minter.address);
    await tokenForge.grantRole(await tokenForge.BURNER_ROLE(), burner.address);
    await tokenForge.grantRole(await tokenForge.PAUSER_ROLE(), pauser.address);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await tokenForge.hasRole(await tokenForge.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should assign the initial supply to the owner", async function () {
      expect(await tokenForge.totalSupply()).to.equal(INITIAL_SUPPLY);
      expect(await tokenForge.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
    });

    it("Should set the correct token name and symbol", async function () {
      expect(await tokenForge.name()).to.equal("TokenForge");
      expect(await tokenForge.symbol()).to.equal("TFG");
    });

    it("Should set the correct decimals", async function () {
      expect(await tokenForge.decimals()).to.equal(18);
    });

    it("Should set the correct max supply", async function () {
      expect(await tokenForge.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
    });

    it("Should calculate remaining supply correctly", async function () {
      const remaining = await tokenForge.remainingSupply();
      expect(remaining).to.equal(MAX_SUPPLY - INITIAL_SUPPLY);
    });
  });

  describe("Role Management", function () {
    it("Should grant minter role correctly", async function () {
      expect(await tokenForge.hasRole(await tokenForge.MINTER_ROLE(), minter.address)).to.be.true;
    });

    it("Should grant burner role correctly", async function () {
      expect(await tokenForge.hasRole(await tokenForge.BURNER_ROLE(), burner.address)).to.be.true;
    });

    it("Should grant pauser role correctly", async function () {
      expect(await tokenForge.hasRole(await tokenForge.PAUSER_ROLE(), pauser.address)).to.be.true;
    });

    it("Should allow admin to revoke roles", async function () {
      await tokenForge.revokeRole(await tokenForge.MINTER_ROLE(), minter.address);
      expect(await tokenForge.hasRole(await tokenForge.MINTER_ROLE(), minter.address)).to.be.false;
    });
  });

  describe("Minting", function () {
    it("Should allow minter to mint tokens", async function () {
      const initialBalance = await tokenForge.balanceOf(user1.address);
      await tokenForge.connect(minter).mint(user1.address, MINT_AMOUNT, "Test mint");
      
      expect(await tokenForge.balanceOf(user1.address)).to.equal(initialBalance + MINT_AMOUNT);
    });

    it("Should emit TokensMinted event", async function () {
      await expect(tokenForge.connect(minter).mint(user1.address, MINT_AMOUNT, "Test mint"))
        .to.emit(tokenForge, "TokensMinted")
        .withArgs(user1.address, MINT_AMOUNT, "Test mint");
    });

    it("Should fail if non-minter tries to mint", async function () {
      await expect(
        tokenForge.connect(user1).mint(user2.address, MINT_AMOUNT, "Test mint")
      ).to.be.revertedWith("TokenForge: must have minter role");
    });

    it("Should fail if minting to zero address", async function () {
      await expect(
        tokenForge.connect(minter).mint(ethers.ZeroAddress, MINT_AMOUNT, "Test mint")
      ).to.be.revertedWith("TokenForge: cannot mint to zero address");
    });

    it("Should fail if minting zero amount", async function () {
      await expect(
        tokenForge.connect(minter).mint(user1.address, 0, "Test mint")
      ).to.be.revertedWith("TokenForge: amount must be greater than 0");
    });

    it("Should fail if minting would exceed max supply", async function () {
      const maxMintable = await tokenForge.remainingSupply();
      const tooMuch = maxMintable + ethers.parseEther("1");
      
      await expect(
        tokenForge.connect(minter).mint(user1.address, tooMuch, "Test mint")
      ).to.be.revertedWith("TokenForge: would exceed max supply");
    });
  });

  describe("Burning", function () {
    beforeEach(async function () {
      // Give user1 some tokens to burn
      await tokenForge.connect(minter).mint(user1.address, MINT_AMOUNT, "Setup");
    });

    it("Should allow user to burn their own tokens", async function () {
      const initialBalance = await tokenForge.balanceOf(user1.address);
      await tokenForge.connect(user1)["burn(uint256,string)"](BURN_AMOUNT, "Test burn");
      
      expect(await tokenForge.balanceOf(user1.address)).to.equal(initialBalance - BURN_AMOUNT);
    });

    it("Should emit TokensBurned event", async function () {
      await expect(tokenForge.connect(user1)["burn(uint256,string)"](BURN_AMOUNT, "Test burn"))
        .to.emit(tokenForge, "TokensBurned")
        .withArgs(user1.address, BURN_AMOUNT, "Test burn");
    });

    it("Should allow burner to burn from any address", async function () {
      const initialBalance = await tokenForge.balanceOf(user1.address);
      await tokenForge.connect(burner)["burnFrom(address,uint256,string)"](user1.address, BURN_AMOUNT, "Test burn from");
      
      expect(await tokenForge.balanceOf(user1.address)).to.equal(initialBalance - BURN_AMOUNT);
    });

    it("Should fail if burning more than balance", async function () {
      const balance = await tokenForge.balanceOf(user1.address);
      const tooMuch = balance + ethers.parseEther("1");
      
      await expect(
        tokenForge.connect(user1)["burn(uint256,string)"](tooMuch, "Test burn")
      ).to.be.revertedWith("TokenForge: insufficient balance");
    });

    it("Should fail if non-burner tries to burn from other address", async function () {
      await expect(
        tokenForge.connect(user2)["burnFrom(address,uint256,string)"](user1.address, BURN_AMOUNT, "Test burn from")
      ).to.be.revertedWith("TokenForge: must have burner role");
    });
  });

  describe("Pausing", function () {
    it("Should allow pauser to pause", async function () {
      await tokenForge.connect(pauser).pause("Emergency pause");
      expect(await tokenForge.paused()).to.be.true;
    });

    it("Should emit EmergencyPause event", async function () {
      await expect(tokenForge.connect(pauser).pause("Emergency pause"))
        .to.emit(tokenForge, "EmergencyPause")
        .withArgs(pauser.address, "Emergency pause");
    });

    it("Should allow pauser to unpause", async function () {
      await tokenForge.connect(pauser).pause("Emergency pause");
      await tokenForge.connect(pauser).unpause();
      expect(await tokenForge.paused()).to.be.false;
    });

    it("Should emit EmergencyUnpause event", async function () {
      await tokenForge.connect(pauser).pause("Emergency pause");
      await expect(tokenForge.connect(pauser).unpause())
        .to.emit(tokenForge, "EmergencyUnpause")
        .withArgs(pauser.address);
    });

    it("Should fail if non-pauser tries to pause", async function () {
      await expect(
        tokenForge.connect(user1).pause("Emergency pause")
      ).to.be.revertedWith("TokenForge: must have pauser role");
    });

    it("Should prevent transfers when paused", async function () {
      await tokenForge.connect(minter).mint(user1.address, MINT_AMOUNT, "Setup");
      await tokenForge.connect(pauser).pause("Emergency pause");
      
      await expect(
        tokenForge.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(tokenForge, "EnforcedPause");
    });
  });

  describe("Transfers", function () {
    beforeEach(async function () {
      await tokenForge.connect(minter).mint(user1.address, MINT_AMOUNT, "Setup");
    });

    it("Should allow normal transfers when not paused", async function () {
      const transferAmount = ethers.parseEther("100");
      const initialBalance1 = await tokenForge.balanceOf(user1.address);
      const initialBalance2 = await tokenForge.balanceOf(user2.address);
      
      await tokenForge.connect(user1).transfer(user2.address, transferAmount);
      
      expect(await tokenForge.balanceOf(user1.address)).to.equal(initialBalance1 - transferAmount);
      expect(await tokenForge.balanceOf(user2.address)).to.equal(initialBalance2 + transferAmount);
    });

    it("Should prevent transfers when paused", async function () {
      await tokenForge.connect(pauser).pause("Emergency pause");
      
      await expect(
        tokenForge.connect(user1).transfer(user2.address, ethers.parseEther("100"))
      ).to.be.revertedWithCustomError(tokenForge, "EnforcedPause");
    });
  });

  describe("Supply Management", function () {
    it("Should track total supply correctly after minting", async function () {
      const initialSupply = await tokenForge.totalSupply();
      await tokenForge.connect(minter).mint(user1.address, MINT_AMOUNT, "Test mint");
      
      expect(await tokenForge.totalSupply()).to.equal(initialSupply + MINT_AMOUNT);
    });

    it("Should track total supply correctly after burning", async function () {
      await tokenForge.connect(minter).mint(user1.address, MINT_AMOUNT, "Setup");
      const initialSupply = await tokenForge.totalSupply();
      await tokenForge.connect(user1)["burn(uint256,string)"](BURN_AMOUNT, "Test burn");
      
      expect(await tokenForge.totalSupply()).to.equal(initialSupply - BURN_AMOUNT);
    });

    it("Should update remaining supply correctly", async function () {
      const initialRemaining = await tokenForge.remainingSupply();
      await tokenForge.connect(minter).mint(user1.address, MINT_AMOUNT, "Test mint");
      const newRemaining = await tokenForge.remainingSupply();
      
      expect(newRemaining).to.equal(initialRemaining - MINT_AMOUNT);
    });
  });
}); 