const { expect } = require("chai");
const { network, waffle } = require("hardhat");
const { Contract } = require("ethers");
const UniswapV2Pair = require("../src/artifacts/@uniswap/v2-core/contracts/UniswapV2Pair.sol/UniswapV2Pair.json");

describe("tests for presaleService contract: ", function () {
  let presaleService, admin, usr1, usr2;
  let mokTokenI, mokTokenII, mokTokenIII, weth, factory, router;
  this.timeout(40000);

  beforeEach(async () => {
    const PresaleService = await ethers.getContractFactory("PresaleService");
    const MokTokenI = await ethers.getContractFactory("MokTokenI");
    const MokTokenII = await ethers.getContractFactory("MokTokenII");
    const MokTokenIII = await ethers.getContractFactory("MokTokenIII");
    const Weth = await ethers.getContractFactory("WETH9");
    const Router = await ethers.getContractFactory("UniswapV2Router02");
    const Factory = await ethers.getContractFactory("UniswapV2Factory");

    [admin, usr1, usr2, usr3] = await ethers.getSigners();

    mokTokenI = await MokTokenI.deploy(500);
    mokTokenII = await MokTokenII.deploy(500);
    mokTokenIII = await MokTokenIII.deploy(500);
    weth = await Weth.deploy();
    factory = await Factory.deploy(usr3.address);
    router = await Router.deploy(factory.address, weth.address);
    presaleService = await PresaleService.deploy(
      1000000,
      admin.address,
      router.address
    );
  });

  describe("start presale", function () {
    it("should fail because the length of the parameter is different", async () => {
      const start = Date.now();
      const end = Date.now() + 20 * 60 * 1000;
      await mokTokenI.transferFrom(mokTokenI.address, usr1.address, 200);
      await expect(
        presaleService
          .connect(usr1)
          .startPresale(
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
      await mokTokenI.transferFrom(mokTokenI.address, usr1.address, 200);
      await expect(presaleService
        .connect(usr1)
        .startPresale(
          [start],
          [end],
          [5],
          [2 * Math.pow(10, 12)],
          [mokTokenI.address]
        )).to.emit(presaleService, "StartPresale").withArgs([start], [end], [5], [2 * Math.pow(10, 12)], [mokTokenI.address]);
      const presaleAddress1 = await presaleService.presaleAddress(0);
      const presaleId = await presaleService.PresaleId();
      // check the state is correct
      expect(presaleAddress1.start).to.equal(start);
      expect(presaleAddress1.end).to.equal(end);
      expect(presaleAddress1.price).to.equal(5);
      expect(presaleAddress1.amount).to.equal(2 * Math.pow(10, 12));
      expect(presaleAddress1.tokenaddress).to.equal(mokTokenI.address);
      // check the counter to be correctly incremented
      expect(presaleId.toString()).to.equal("1");
    });

    it("should correctly reduce the balance of sender and increase the balance of presaleService contract", async () => {
      const start = Date.now();
      const end = Date.now() + 20 * 60 * 1000;
      await mokTokenII.transferFrom(mokTokenII.address, usr1.address, 200);
      const OldMokTokenIIBalance = await mokTokenII.balanceOf(usr1.address);
      await expect(presaleService
        .connect(usr1)
        .startPresale(
          [start],
          [end],
          [5],
          [2 * Math.pow(10, 12)],
          [mokTokenI.address]
        )).to.emit(presaleService, "StartPresale").withArgs([start], [end], [5], [2 * Math.pow(10, 12)], [mokTokenI.address]);
      const NewMokTokenIIBalance = await mokTokenII.balanceOf(usr1.address);
      const presaleServiceBalance = await mokTokenII.balanceOf(
        presaleService.address
      );
      expect(presaleServiceBalance).to.equal(
        OldMokTokenIIBalance - NewMokTokenIIBalance
      );
    });
  });

  describe("buy", function () {
    beforeEach(async () => {
      const start = Math.floor(Date.now() / 1000) + 20 * 60;
      const end = Math.floor(Date.now() / 1000) + 60 * 60;
      await mokTokenII.transferFrom(mokTokenII.address, usr1.address, 200);
      await presaleService
        .connect(usr1)
        .startPresale(
          [start],
          [end],
          [5],
          [2 * Math.pow(10, 12)],
          [mokTokenII.address]
        );
    });

    after(async () => {
      await network.provider.send("evm_increaseTime", [-61 * 60]);
      await network.provider.send("evm_mine");
    });

    it("should fail because start has not been passed", async () => {
      await expect(presaleService.connect(usr1).buy(0, 1)).to.be.revertedWith(
        "the current time has not passed the start time of this presale"
      );
    });

    it("should succeed and the sender and contract should receive right amount of token and eth", async () => {
      const provider = waffle.provider;
      const oldEthBalance = await provider.getBalance(presaleService.address);
      const oldUsrBalance = await provider.getBalance(usr1.address);
      await network.provider.send("evm_increaseTime", [30 * 60]);
      await network.provider.send("evm_mine");
      const info = await presaleService.presaleAddress(0);
      const price = info.price;
      await expect(presaleService.connect(usr1).buy(0, 1, { value: 5 })).to.emit(presaleService, "Buy").withArgs(usr1.address, 0, price, 1);

      const TokenBalance = await mokTokenII.balanceOf(usr1.address);
      const newEthBalance = await provider.getBalance(presaleService.address);
      const newUsrBalance = await provider.getBalance(usr1.address);

      const diff = newEthBalance - oldEthBalance;
      expect(TokenBalance).to.equal(1);
      expect(diff).to.equal(5);
      expect(oldUsrBalance - newUsrBalance).to.greaterThanOrEqual(
        newEthBalance - oldEthBalance
      );
    });

    it("should fail because end has been passed", async () => {
      await network.provider.send("evm_increaseTime", [31 * 60]);
      await network.provider.send("evm_mine");
      await expect(presaleService.connect(usr1).buy(0, 1)).to.be.revertedWith(
        "the current time has passed the end time of this presale"
      );
    });
  });

  describe("end presale", function () {
    beforeEach(async () => {
      const start = Math.floor(Date.now() / 1000) + 20 * 60;
      const end = Math.floor(Date.now() / 1000) + 60 * 60;
      await mokTokenIII.transferFrom(mokTokenIII.address, usr1.address, 200);
      await presaleService
        .connect(usr1)
        .startPresale(
          [start],
          [end],
          [10000000],
          [2 * Math.pow(10, 12)],
          [mokTokenIII.address]
        );
      await network.provider.send("evm_increaseTime", [25 * 60]);
      await network.provider.send("evm_mine");
      await presaleService.connect(usr1).buy(0, 2, { value: 20000000 });
    });

    after(async () => {
      await network.provider.send("evm_increaseTime", [-100 * 60]);
      await network.provider.send("evm_mine");
    });

    it("should fail because the time has not ended", async () => {
      await expect(presaleService.endPresale(0)).to.be.revertedWith(
        "The end timestamp has not been passed yet"
      );
    });

    it("should transfer the right amount to the pair address", async () => {
      await network.provider.send("evm_increaseTime", [50 * 60]);
      await network.provider.send("evm_mine");
      const provider = waffle.provider;
      await expect(presaleService.endPresale(0)).to.emit(presaleService, "EndPresale").withArgs(0, 19000000, 2, mokTokenIII.address)
      const pairaddress = await factory.getPair(
        mokTokenIII.address,
        weth.address
      );
      const pair = new Contract(pairaddress, UniswapV2Pair.abi, provider);

      const obj = await pair.getReserves();
      const info = await presaleService.presaleAddress(0);

      const reserve0 = obj._reserve0;
      const reserve1 = obj._reserve1;

      expect(info.ended).to.equal(true);
      expect(reserve0).to.equal(19000000);
      expect(reserve1).to.equal(2);
    });
  });

  describe("withdraw", function () {
    beforeEach(async () => {
      const start = Math.floor(Date.now() / 1000) + 20 * 60;
      const end = Math.floor(Date.now() / 1000) + 60 * 60;
      await mokTokenIII.transferFrom(mokTokenIII.address, usr2.address, 200);
      await presaleService
        .connect(usr2)
        .startPresale(
          [start],
          [end],
          [10000000],
          [2 * Math.pow(10, 12)],
          [mokTokenIII.address]
        );
      await network.provider.send("evm_increaseTime", [25 * 60]);
      await network.provider.send("evm_mine");
      await presaleService.connect(usr1).buy(0, 2, { value: 20000000 });
    });

    after(async () => {
      await network.provider.send("evm_increaseTime", [-100 * 60]);
      await network.provider.send("evm_mine");
    });

    it("should fail because the presale has not been ended", async () => {
      await expect(presaleService.connect(usr2).withdraw(0)).to.be.revertedWith(
        "This presale has not been ended"
      );
    });

    it("should fail because the withdrawer is not the creator", async () => {
      await network.provider.send("evm_increaseTime", [70 * 60]);
      await network.provider.send("evm_mine");
      await presaleService.endPresale(0);
      await expect(presaleService.connect(usr1).withdraw(0)).to.be.revertedWith(
        "Only the creator could withdraw"
      );
      await network.provider.send("evm_increaseTime", [-95 * 60]);
      await network.provider.send("evm_mine");
    });

    it("should succeed and correctly transfer the token", async () => {
      await network.provider.send("evm_increaseTime", [70 * 60]);
      await network.provider.send("evm_mine");
      await presaleService.connect(admin).endPresale(0);
      const tokenAmount = await mokTokenIII.balanceOf(presaleService.address);
      await expect(presaleService.connect(usr2).withdraw(0)).to.emit(presaleService, "WithDraw").withArgs(0, 198);
      const balance = await mokTokenIII.balanceOf(usr1.address);
      expect(balance).to.equal(2);
      expect(tokenAmount).to.equal(198);
    });
  });

  describe("changeUsageFee", function () {
    it("should fail because the setter is not the admin", async () => {
      await expect(
        presaleService.connect(usr1).changeUsageFee(20)
      ).to.be.revertedWith("Only the admin could change usage fee");
    });

    it("should succeed and change the usageFee", async () => {
      await expect(presaleService.connect(admin).changeUsageFee(20)).to.emit(presaleService, "ChangeUsageFee").withArgs(0, 1000000, 20);
      const newUsageFee = await presaleService.usageFee();
      expect(newUsageFee).to.equal(20);
    });
  });
});
