const { expect } = require("chai");
const { network } = require("hardhat");
const { ChainId, Token } = require("@uniswap/sdk");
const { ethers } = require("ethers");

describe("start presale", function () {
  let presaleService, admin, usr1, usr2;
  let mokTokenI, mokTokenII, mokTokenIII;
  this.timeout(40000);

  beforeEach(async () => {
    const PresaleService = await ethers.getContractFactory("PresaleService");
    const MokTokenI = await ethers.getContractFactory("MokTokenI");
    const MokTokenII = await ethers.getContractFactory("MokTokenII");
    const MokTokenIII = await ethers.getContractFactory("MokTokenIII");

    [admin, usr1, usr2] = await ethers.getSigners();

    const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    mokTokenI = await MokTokenI.deploy(500 * Math.pow(10, 18));
    mokTokenII = await MokTokenII.deploy(500 * Math.pow(10, 18));
    mokTokenIII = await MokTokenIII.deploy(500 * Math.pow(10, 18));
    presaleService = await PresaleService.deploy(
      1000000,
      admin.address,
      weth,
      router
    );
  });

  it("should fail because the length of the parameter is different", async () => {
    const start = Date.now();
    const end = Date.now() + 20 * 60 * 1000;
    await expect(
      presaleService.startPresale(
        [start],
        [end, end, end],
        [5, 6, 7],
        [2 * Math.pow(10, 12), 2 * Math.pow(10, 12), 2 * Math.pow(10, 12)],
        [mokTokenI.address, mokTokenII.address, mokTokenIII.address]
      )
    ).to.be.revertedWith("the entered inputs should have the same length");
  });

  it("should succeed and set the state correctly", async () => {
    const start = Date.now();
    const end = Date.now() + 20 * 60 * 1000;
    await resaleService.startPresale(
      [start],
      [end],
      [5],
      [2 * Math.pow(10, 12)],
      [mokTokenI.address]
    );
    const presaleAddress1 = await presaleService.presaleAddress(0);
    const presaleId = await PresaleService.presaleId().current();

    // check the state is correct
    expect(presaleAddress1.start).to.equal(start);
    expect(presaleAddress1.end).to.equal(end);
    expect(presaleAddress1.price).to.equal(5);
    expect(presaleAddress1.tokenAmount).to.equal(2 * Math.pow(10, 12));
    expect(presaleAddress1.tokenAddress).to.equal(mokTokenI.address);

    // check the counter to be correctly incremented
    expect(presaleId).to.equal(1);
  });

  it("should correctly reduce the balance of sender and increase the balance of presaleService contract", async () => {
    const OldMokTokenIIBalance = await mokTokenII.balanceOf(mokTokenII.address);
    await presaleService.startPresale(
      [start],
      [end],
      [5],
      [2 * Math.pow(10, 12)],
      [mokTokenII.address]
    );
    const NewMokTokenIIBalance = await mokTokenII.balanceOf(mokTokenII.address);
    const presaleServiceBalance = await mokTokenII.balanceOf(
      presaleService.address
    );
    expect(presaleService).to.equal(
      NewMokTokenIIBalance - OldMokTokenIIBalance
    );
  });
});

describe("buy", function () {
  let presaleService, admin, usr1, usr2;
  let mokTokenI, mokTokenII, mokTokenIII;
  this.timeout(40000);

  beforeEach(async () => {
    const PresaleService = await ethers.getContractFactory("PresaleService");
    const MokTokenI = await ethers.getContractFactory("MokTokenI");
    const MokTokenII = await ethers.getContractFactory("MokTokenII");
    const MokTokenIII = await ethers.getContractFactory("MokTokenIII");

    [admin, usr1, usr2] = await ethers.getSigners();

    const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    mokTokenI = await MokTokenI.deploy(500 * Math.pow(10, 18));
    mokTokenII = await MokTokenII.deploy(500 * Math.pow(10, 18));
    mokTokenIII = await MokTokenIII.deploy(500 * Math.pow(10, 18));
    presaleService = await PresaleService.deploy(
      1000000,
      admin.address,
      weth,
      router
    );
    const start = Date.now() + 20 * 60 * 1000;
    const end = Date.now() + 60 * 60 * 1000;
    await presaleService.startPresale(
      [start],
      [end],
      [5],
      [2 * Math.pow(10, 12)],
      [mokTokenII.address]
    );
  });

  it("should fail because start has not been passed", async () => {
    await expect(presaleService.connect(usr1).buy(0, 1)).to.be.revertedWith(
      "the current time has not passed the start time of this presale"
    );
  });

  it("should fail because end has been passed", async () => {
    await network.provider.send("evm_increaseTime", [70 * 60]);
    await network.provider.send("evm_mine");
    await expect(presaleService.connect(usr1).buy(0, 1)).to.be.revertedWith(
      "the current time has passed the end time of this presale"
    );
  });

  it("should succeed and the sender and contract should receive right amount of token and eth", async () => {
    const provider = ethers.getDefaultProvider("rinkeby");
    const oldEthBalance = await provider.getBalance(presaleService.address);
    const oldUsrBalance = await provider.getBalance(usr1.address);
    await network.provider.send("evm_increaseTime", [30 * 60]);
    await network.provider.send("evm_mine");
    await presaleService.connect(usr1).buy(0, 1);

    const TokenBalance = await mokTokenII.balanceOf(usr1.address);
    const newEthBalance = await provider.getBalance(presaleService.address);
    const newUsrBalance = await provider.getBalance(usr1.address);

    expect(TokenBalance).to.equal(1);
    expect(newEthBalance - oldEthBalance).to.equal(5);
    expect(newUsrBalance - oldUsrBalance).to.greaterThanOrEqual(
      newEthBalance - oldEthBalance
    );
  });
});

describe("end presale", function () {
  let presaleService, admin, usr1, usr2;
  let mokTokenI, mokTokenII, mokTokenIII;
  this.timeout(40000);

  beforeEach(async () => {
    const PresaleService = await ethers.getContractFactory("PresaleService");
    const MokTokenI = await ethers.getContractFactory("MokTokenI");
    const MokTokenII = await ethers.getContractFactory("MokTokenII");
    const MokTokenIII = await ethers.getContractFactory("MokTokenIII");

    [admin, usr1, usr2] = await ethers.getSigners();

    const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
    const router = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

    mokTokenI = await MokTokenI.deploy(500 * Math.pow(10, 18));
    mokTokenII = await MokTokenII.deploy(500 * Math.pow(10, 18));
    mokTokenIII = await MokTokenIII.deploy(500 * Math.pow(10, 18));
    presaleService = await PresaleService.deploy(
      1000000,
      admin.address,
      weth,
      router
    );
    const start = Date.now() + 20 * 60 * 1000;
    const end = Date.now() + 60 * 60 * 1000;
    await presaleService.startPresale(
      [start],
      [end],
      [5],
      [2 * Math.pow(10, 12)],
      [mokTokenIII.address]
    );
  });

  it("should fail because the time has not ended", async () => {
    await expect(presaleService.endPresale(0)).to.be.revertedWith(
      "The end timestamp has not been passed yet"
    );
  });

  it("should successfully set the state to be true", async () => {
    await network.provider.send("evm_increaseTime", [30 * 60]);
    await network.provider.send("evm_mine");
    await presaleService.endPresale(0);
    const info = await presaleService.presaleInfo(0);
    expect(info.ended).to.equal(true);
  });

  it("should transfer the right amount to the pair address", async () => {
    const provider = ethers.getDefaultProvider("rinkeby");
    const oldAdminEthBalance = await provider.getBalance(admin.address);
    await network.provider.send("evm_increaseTime", [30 * 60]);
    await network.provider.send("evm_mine");
    await presaleService.endPresale(0);
    const newAdminEthBalance = await provider.getBalance(admin.address);
    const pair = new Pair(new tokenAmount(), new TokenAmount());

    const reserve0 = await pair.reserve0();
    const reserve1 = await pair.reserve1();

    expect(newAdminEthBalance - oldAdminEthBalance).to.equal(1000000);
    expect(reserve0).to.equal(1);
    expect(reserve1).to.equal(5);
  });
});
