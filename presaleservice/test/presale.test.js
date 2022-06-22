const { expect } = require("chai");
const { network, waffle, ethers } = require("hardhat");
const { Contract } = require("ethers");
const UniswapV2Pair = require("../src/artifacts/@uniswap/v2-core/contracts/UniswapV2Pair.sol/UniswapV2Pair.json");
const { parseEther } = require("ethers/lib/utils");

describe("tests for presaleService contract: ", function () {
  let presaleService, admin, usr1, usr2;
  let mokTokenI, mokTokenII, mokTokenIII, weth, factory, router;
  this.timeout(40000);

  beforeEach(async () => {
    const PresaleService = await ethers.getContractFactory("PresaleService");
    const MokTokenI = await ethers.getContractFactory("MokTokenI");
    const Weth = await ethers.getContractFactory("WETH9");
    const Router = await ethers.getContractFactory("UniswapV2Router02");
    const Factory = await ethers.getContractFactory("UniswapV2Factory");

    [admin, usr1, usr2, usr3] = await ethers.getSigners();

    mokTokenI = await MokTokenI.connect(usr1).deploy(parseEther("500"));
    await mokTokenI.mint(admin.address, parseEther("500"));
    weth = await Weth.deploy();
    factory = await Factory.deploy(usr3.address);
    router = await Router.deploy(factory.address, weth.address);
    presaleService = await PresaleService.deploy(
      100,
      admin.address,
      router.address
    );
  });

  describe("start presale", function () {
    beforeEach(async () => {
      await mokTokenI
        .connect(usr1)
        .increaseAllowance(presaleService.address, parseEther("20"));
    });
    it("should fail because the length of the parameter is different", async () => {
      const start = Math.floor(Date.now() / 1000);
      const end = Math.floor(Date.now() / 1000) + 20 * 60;
      await mokTokenI.mint(usr1.address, 200);
      await expect(
        presaleService
          .connect(usr1)
          .startPresale(
            [start],
            [end, end, end],
            [5, 6, 7],
            [2 * Math.pow(10, 12), 2 * Math.pow(10, 12), 2 * Math.pow(10, 12)],
            [mokTokenI.address, mokTokenI.address, mokTokenI.address]
          )
      ).to.be.revertedWith("the entered inputs should have the same length");
    });

    it("should succeed and set the state correctly", async () => {
      const start = Math.floor(Date.now() / 1000);
      const end = Math.floor(Date.now() / 1000) + 20 * 60;
      await mokTokenI.mint(usr1.address, 200);
      await expect(
        presaleService
          .connect(usr1)
          .startPresale([start], [end], [5], [200], [mokTokenI.address])
      )
        .to.emit(presaleService, "StartPresale")
        .withArgs([start], [end], [5], [200], [mokTokenI.address]);
      const presaleAddress1 = await presaleService.presaleAddress(0);
      const presaleId = await presaleService.PresaleId();
      // check the state is correct
      expect(presaleAddress1.start).to.equal(start);
      expect(presaleAddress1.end).to.equal(end);
      expect(presaleAddress1.price).to.equal(5);
      expect(presaleAddress1.FirstAmount).to.equal(200);
      expect(presaleAddress1.tokenaddress).to.equal(mokTokenI.address);
      // check the counter to be correctly incremented
      expect(presaleId.toString()).to.equal("1");
    });

    it("should correctly reduce the balance of sender and increase the balance of presaleService contract", async () => {
      const start = Math.floor(Date.now() / 1000);
      const end = Math.floor(Date.now() / 1000) + 20 * 60;
      await mokTokenI.mint(usr1.address, 200);
      const OldMokTokenIBalance = await mokTokenI.balanceOf(usr1.address);
      await expect(
        presaleService
          .connect(usr1)
          .startPresale([start], [end], [5], [200], [mokTokenI.address])
      )
        .to.emit(presaleService, "StartPresale")
        .withArgs([start], [end], [5], [200], [mokTokenI.address]);
      const NewMokTokenIBalance = await mokTokenI.balanceOf(usr1.address);
      const presaleServiceBalance = await mokTokenI.balanceOf(
        presaleService.address
      );
      expect(presaleServiceBalance).to.equal(
        OldMokTokenIBalance.sub(NewMokTokenIBalance)
      );
    });
  });

  describe("buy", function () {
    beforeEach(async () => {
      const start = Math.floor(Date.now() / 1000) + 20 * 60;
      const end = Math.floor(Date.now() / 1000) + 60 * 60;
      await mokTokenI.mint(admin.address, parseEther("200"));
      await mokTokenI
        .connect(admin)
        .increaseAllowance(presaleService.address, parseEther("200"));
      await presaleService
        .connect(admin)
        .startPresale(
          [start],
          [end],
          [100000000],
          [parseEther("200")],
          [mokTokenI.address]
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
      await expect(
        presaleService
          .connect(usr1)
          .buy(0, parseEther("1"), { value: parseEther("1") })
      )
        .to.emit(presaleService, "Buy")
        .withArgs(usr1.address, 0, price, parseEther("1"));

      const TokenBalance = await mokTokenI.balanceOf(usr1.address);
      const newEthBalance = await provider.getBalance(presaleService.address);

      const diff = newEthBalance.sub(oldEthBalance);
      expect(TokenBalance).to.equal(parseEther("501"));
      expect(diff).to.equal(parseEther("1"));
    });

    it("should fail because end has been passed", async () => {
      await network.provider.send("evm_increaseTime", [31 * 60]);
      await network.provider.send("evm_mine");
      await expect(
        presaleService
          .connect(usr1)
          .buy(0, parseEther("1"), { value: parseEther("1") })
      ).to.be.revertedWith(
        "the current time has passed the end time of this presale"
      );
    });
  });

  describe("end presale", function () {
    beforeEach(async () => {
      const start = Math.floor(Date.now() / 1000) + 20 * 60;
      const end = Math.floor(Date.now() / 1000) + 60 * 60;
      await mokTokenI.mint(admin.address, parseEther("200"));
      await mokTokenI
        .connect(admin)
        .increaseAllowance(presaleService.address, parseEther("200"));
      await network.provider.send("evm_increaseTime", [25 * 60]);
      await network.provider.send("evm_mine");
      await presaleService
        .connect(admin)
        .startPresale(
          [start],
          [end],
          [100000000],
          [parseEther("200")],
          [mokTokenI.address]
        );
    });

    after(async () => {
      await network.provider.send("evm_increaseTime", [-100 * 60]);
      await network.provider.send("evm_mine");
    });

    it("should fail because the time has not ended", async () => {
      await mokTokenI.mint(admin.address, 2);
      await expect(presaleService.endPresale(0)).to.be.revertedWith(
        "The end timestamp has not been passed yet"
      );
    });

    it("should transfer the right amount to the pair address", async () => {
      const provider = waffle.provider;
      // const diff = ethers.utils.parseEther("20.0") - 1000000;
      // await mokTokenI.mint(admin.address, 2);
      const oldSenderBalance = await mokTokenI.balanceOf(admin.address);
      await presaleService
        .connect(usr1)
        .buy(0, parseEther("1"), { value: parseEther("1") });
      const oldContractBalance = await mokTokenI.balanceOf(
        presaleService.address
      );
      const oldContractWeth = await provider.getBalance(presaleService.address);
      await mokTokenI
        .connect(admin)
        .increaseAllowance(presaleService.address, parseEther("1"));
      await network.provider.send("evm_increaseTime", [50 * 60]);
      await network.provider.send("evm_mine");
      await expect(presaleService.endPresale(0))
        .to.emit(presaleService, "EndPresale")
        .withArgs(
          0,
          parseEther("1").sub(100),
          parseEther("1"),
          mokTokenI.address
        );
      const newContractWeth = await provider.getBalance(presaleService.address);
      const newSenderBalance = await mokTokenI.balanceOf(admin.address);
      const newContractBalance = await mokTokenI.balanceOf(
        presaleService.address
      );

      expect(oldSenderBalance.sub(newSenderBalance)).to.equal(parseEther("1"));
      expect(oldContractWeth.sub(newContractWeth)).to.equal(parseEther("1"));
      expect(oldContractBalance.sub(newContractBalance)).to.equal(0);

      const pairaddress = await factory.getPair(
        mokTokenI.address,
        weth.address
      );
      const pair = new Contract(pairaddress, UniswapV2Pair.abi, provider);

      const obj = await pair.getReserves();

      const reserve0 = obj._reserve0;
      const reserve1 = obj._reserve1;
      expect(reserve1).to.equal(parseEther("1").sub(100));
      expect(reserve0).to.equal(parseEther("1"));

      // console.log("oldContractWeth: ", oldContractWeth.toString());
      // console.log("diff: ", (oldContractWeth - newContractWeth).toString());
      // // change of the token balance of the one who calls this function
      // expect(oldSenderBalance - newSenderBalance).to.equal(2);
      // // change of the token and weth balance of the contract
      // expect(oldContractBalance).to.equal(198);
      // expect(newContractBalance).to.equal(198);

      // expect((oldContractWeth - newContractWeth).toString()).to.equal(
      //   ethers.utils.parseEther("20.0").toString()
      // );

      // expect(info.ended).to.equal(true);
      // expect(reserve0).to.equal(BigNumber.from("19999999999999000000"));
      // expect(reserve1).to.equal(2);
    });
  });

  describe("withdraw", function () {
    beforeEach(async () => {
      const start = Math.floor(Date.now() / 1000) + 20 * 60;
      const end = Math.floor(Date.now() / 1000) + 60 * 60;
      await mokTokenI.mint(admin.address, parseEther("200"));
      await mokTokenI
        .connect(admin)
        .increaseAllowance(presaleService.address, parseEther("200"));
      await presaleService
        .connect(admin)
        .startPresale(
          [start],
          [end],
          [100000000],
          [parseEther("200")],
          [mokTokenI.address]
        );
      await network.provider.send("evm_increaseTime", [25 * 60]);
      await network.provider.send("evm_mine");
      await presaleService
        .connect(usr1)
        .buy(0, parseEther("1"), { value: parseEther("1") });
    });

    after(async () => {
      await network.provider.send("evm_increaseTime", [-100 * 60]);
      await network.provider.send("evm_mine");
    });

    it("should fail because the presale has not been ended", async () => {
      await expect(
        presaleService.connect(admin).withdraw(0)
      ).to.be.revertedWith("This presale has not been ended");
    });

    it("should fail because the withdrawer is not the creator", async () => {
      await network.provider.send("evm_increaseTime", [70 * 60]);
      await network.provider.send("evm_mine");
      await mokTokenI
        .connect(admin)
        .increaseAllowance(presaleService.address, parseEther("1"));
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
      await mokTokenI
        .connect(admin)
        .increaseAllowance(presaleService.address, parseEther("1"));
      await presaleService.connect(admin).endPresale(0);
      const tokenAmount = await mokTokenI.balanceOf(presaleService.address);
      await expect(presaleService.connect(admin).withdraw(0))
        .to.emit(presaleService, "WithDraw")
        .withArgs(0, parseEther("199"));
      const balance = await mokTokenI.balanceOf(admin.address);
      expect(balance).to.equal(parseEther("698"));
      // change of the balance of the withdrawer
      expect(tokenAmount).to.equal(parseEther("199"));
    });
  });

  describe("changeUsageFee", function () {
    it("should fail because the setter is not the admin", async () => {
      await expect(
        presaleService.connect(usr1).changeUsageFee(20)
      ).to.be.revertedWith("Only the admin could change usage fee");
    });

    it("should succeed and change the usageFee", async () => {
      await expect(presaleService.connect(admin).changeUsageFee(20))
        .to.emit(presaleService, "ChangeUsageFee")
        .withArgs(100, 20);
      const newUsageFee = await presaleService.usageFee();
      expect(newUsageFee).to.equal(20);
    });
  });
});

// describe("test", function(){
//   beforeEach(async () => {

//     const start = Math.floor(Date.now() / 1000);
//     const end = Math.floor(Date.now() / 1000) + 5 * 60;

//     await mokTokenI.connect(admin).increaseAllowance(presaleService.address, parseEther("20"));
//     await presaleService.startPresale([start], [end], [1000000000], [parseEther("20")], [mokTokenI.address]);
//     console.log("after start presale");
//     await presaleService.buy(0, parseEther("0.001"), {value: parseEther("0.01")});
//     await mokTokenI.connect(admin).increaseAllowance(presaleService.address, parseEther("1"));
//     await network.provider.send("evm_increaseTime", [5 * 60]);
//     await network.provider.send("evm_mine");
//     await presaleService.endPresale(0);
//     await presaleService.withdraw(0);
//     const balance = await mokTokenI.balanceOf(presaleService.address);
//     console.log("withdraw balance: ", balance);

//   })

//   it("pass", async () => {
//     console.log("hi")
//   })
// })
