const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery Unit Test", async function () {
          let lottery, vrfCoordinatorV2Mock, lotteryEntranceFee, deployer

          const chainId = network.config.chainId

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer

              await deployments.fixture(["all"])
              lottery = await ethers.getContract("Lottery", deployer)
              vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
              lotteryEntranceFee = await lottery.getEntranceFee()
          })

          describe("constructor", async function () {
              it("initiaizes the Lottery correctly", async function () {
                  const lotteryState = await lottery.getLotteryState()
                  const interval = await lottery.getInterval()
                  const entranceFee = await lottery.getEntranceFee()

                  assert.equal(lotteryState.toString(), "0")
                  assert.equal(interval.toString(), networkConfig[chainId]["interval"])
                  assert.equal(entranceFee.toString(), networkConfig[chainId]["entranceFee"])
              })
          })

          describe("enterLottery", async function () {
              it("reverts when you don't pay enough", async () => {
                  await expect(lottery.enterLottery()).to.be.revertedWith(
                      // is reverted when not paid enough or Lottery is not open
                      "Lottery__NotEnoughETHEntered"
                  )
              })
              it("records players when they enter", async () => {
                  await lottery.enterLottery({ value: lotteryEntranceFee })
                  const playerFromContract = await lottery.getPlayer(0)
                  //   console.log(playerFromContract, deployer)
                  assert.equal(playerFromContract, deployer)
              })
              it("emits event", async () => {
                  await expect(lottery.enterLottery({ value: lotteryEntranceFee })).to.emit(
                      lottery,
                      "LotteryEnter"
                  )
              })
          })
      })
