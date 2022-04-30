const { expect } = require('chai');
const { deploy } = require('../scripts/deploy.js')
const { takeSnapshot, revertToSnapshot } = require("./utils/snapshot");

let user,user2,owner;
let userAddress, ownerAddress, user2Address;

const THREE_CURVE = "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7";
const BEAN_3_CURVE = "0x3a70DfA7d2262988064A2D051dd47521E43c9BdD";
const LUSD_3_CURVE = "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA";
const BEAN_LUSD_CURVE = "0xD652c40fBb3f06d6B58Cb9aa9CFF063eE63d465D";

const BN_ZERO = ethers.utils.parseEther('0');

let lastTimestamp = 1700000000;
let timestamp;
let snapshotId;

async function resetTime() {
  timestamp = lastTimestamp + 100000000
  lastTimestamp = timestamp
  await hre.network.provider.request({
    method: "evm_setNextBlockTimestamp",
    params: [timestamp],
  });
}

async function advanceTime(time) {
  timestamp += time
  await hre.network.provider.request({
    method: "evm_setNextBlockTimestamp",
    params: [timestamp],
  });
}

describe('BDV', function () {
  before(async function () {
    [owner,user,user2] = await ethers.getSigners();
    userAddress = user.address;
    user2Address = user2.address;
    const contracts = await deploy("Test", false, true);
    ownerAddress = contracts.account;
    this.diamond = contracts.beanstalkDiamond;
    this.season = await ethers.getContractAt('MockSeasonFacet', this.diamond.address);
    this.diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', this.diamond.address)
    this.oracle = await ethers.getContractAt('MockOracleFacet', this.diamond.address);
    this.silo = await ethers.getContractAt('MockSiloFacet', this.diamond.address);
    this.convert = await ethers.getContractAt('ConvertFacet', this.diamond.address);
    this.bean = await ethers.getContractAt('MockToken', contracts.bean);

    this.siloToken = await ethers.getContractFactory("MockToken");
    this.siloToken = await this.siloToken.deploy("Silo", "SILO")
    await this.siloToken.deployed()

    await this.silo.mockWhitelistToken(
      this.siloToken.address, 
      this.silo.interface.getSighash("mockBDV(uint256 amount)"), 
      '10000', 
      '1');

    await this.season.siloSunrise(0);
    await this.bean.mint(userAddress, '1000000000');
    await this.bean.mint(user2Address, '1000000000');
    await this.siloToken.connect(user).approve(this.silo.address, '100000000000');
    await this.siloToken.connect(user2).approve(this.silo.address, '100000000000');
    await this.bean.connect(user).approve(this.silo.address, '100000000000');
    await this.bean.connect(user2).approve(this.silo.address, '100000000000'); 
    await this.siloToken.mint(userAddress, '10000');
    await this.siloToken.mint(user2Address, '10000');
  });

  beforeEach(async function () {
    snapshotId = await takeSnapshot();
  });

  afterEach(async function () {
    await revertToSnapshot(snapshotId);
  });

  describe("Bean Metapool BDV", async function () {
    before(async function () {
      this.threeCurve = await ethers.getContractAt('Mock3Curve', THREE_CURVE);
      await this.threeCurve.set_virtual_price(ethers.utils.parseEther('1'));
      this.beanThreeCurve = await ethers.getContractAt('MockMeta3Curve', BEAN_3_CURVE);
      await this.beanThreeCurve.set_supply(ethers.utils.parseEther('2000000'));
      await this.beanThreeCurve.set_A_precise('1000');
      await this.beanThreeCurve.set_virtual_price(ethers.utils.parseEther('1'));
      await this.beanThreeCurve.set_balances([
        ethers.utils.parseUnits('1000000',6),
        ethers.utils.parseEther('1000000')
      ]);
      await this.beanThreeCurve.set_balances([
        ethers.utils.parseUnits('1200000',6),
        ethers.utils.parseEther('1000000')
      ]);
    });

    it("properly checks bdv", async function () {
      this.bdv = await ethers.getContractAt('BDVFacet', this.diamond.address);
      expect(await this.bdv.bdv(BEAN_3_CURVE, ethers.utils.parseEther('200'))).to.equal(ethers.utils.parseUnits('200',6));
    })

    it("properly checks bdv", async function () {
      await this.threeCurve.set_virtual_price(ethers.utils.parseEther('1.02'));
      this.bdv = await ethers.getContractAt('BDVFacet', this.diamond.address);
      expect(await this.bdv.bdv(BEAN_3_CURVE, ethers.utils.parseEther('2'))).to.equal('1998191');
    })
  })

  // describe("Bean LUSD BDV", async function () {
  //   beforeEach(async function () {
  //     this.threeCurve = await ethers.getContractAt('Mock3Curve', THREE_CURVE);
  //     await this.threeCurve.set_virtual_price(ethers.utils.parseEther('1'));
  //     this.beanThreeCurve = await ethers.getContractAt('MockMeta3Curve', BEAN_3_CURVE);
  //     await this.beanThreeCurve.set_supply(ethers.utils.parseEther('2000000'));
  //     await this.beanThreeCurve.set_A_precise('1000');
  //     await this.beanThreeCurve.set_virtual_price(ethers.utils.parseEther('1'));
  //     await this.beanThreeCurve.set_balances([
  //       ethers.utils.parseUnits('1000000',6),
  //       ethers.utils.parseEther('1000000')
  //     ]);'
  //     await this.beanThreeCurve.set_balances([
  //       ethers.utils.parseUnits('1200000',6),
  //       ethers.utils.parseEther('1000000')
  //     ]);

  //     this.lusdThreeCurve = await ethers.getContractAt('MockMeta3Curve', LUSD_3_CURVE);
  //     await this.lusdThreeCurve.set_supply(ethers.utils.parseEther('2000000'));
  //     await this.lusdThreeCurve.set_A_precise('1000');
  //     await this.lusdThreeCurve.set_virtual_price(ethers.utils.parseEther('1'));
  //     await this.lusdThreeCurve.set_balances([
  //       ethers.utils.parseEther('1000000000'),
  //       ethers.utils.parseEther('1000000000')
  //     ]);
  //     await this.lusdThreeCurve.set_balances([
  //       ethers.utils.parseEther('1200000'),
  //       ethers.utils.parseEther('1000000')
  //     ]);

  //     this.lusdBeanCurve = await ethers.getContractAt('MockPlainCurve', BEAN_LUSD_CURVE);
  //     await this.lusdBeanCurve.set_virtual_price(ethers.utils.parseEther('1'));
  //   });

  //   it("properly checks bdv", async function () {
  //     this.bdv = await ethers.getContractAt('BDVFacet', this.diamond.address);
  //     expect(await this.bdv.bdv(BEAN_LUSD_CURVE, ethers.utils.parseEther('200'))).to.equal(ethers.utils.parseUnits('200',6));
  //   })

  //   it("properly checks bdv", async function () {
  //     await this.lusdThreeCurve.set_balances([
  //       ethers.utils.parseEther('1200000'),
  //       ethers.utils.parseEther('1000000')
  //     ]);
  //     this.bdv = await ethers.getContractAt('BDVFacet', this.diamond.address);
  //     expect(await this.bdv.bdv(BEAN_LUSD_CURVE, ethers.utils.parseEther('200'))).to.equal('196675497');
  //   })
  // })
});