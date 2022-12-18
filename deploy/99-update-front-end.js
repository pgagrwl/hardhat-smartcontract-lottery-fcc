const { ethers, network } = require("hardhat")
const { frontEndContractsFile, frontEndAbiFile } = require("../helper-hardhat-config")
const fs = require("fs")

// const FRONT_END_ADDRESS_FILE = require("../../frontend-template/constants/contractAddress.json")
// const FRONT_END_ABI_FILE = "../../frontend-template/constants/abi.json"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating front end...")
        updateContractAddress()
        updateAbi()
    }
}

async function updateAbi() {
    const lottery = await ethers.getContract("Lottery")
    fs.writeFileSync(frontEndAbiFile, lottery.interface.format(ethers.utils.FormatTypes.json))
}

async function updateContractAddress() {
    const lottery = await ethers.getContract("Lottery")
    // const currentAddresses = fs.readFileSync(frontEndContractsFile, "utf-8")
    // currentAddresses = JSON.parse(currentAddresses)
    const ll = fs.readFileSync(frontEndContractsFile, "utf8")
    const currentAddresses = JSON.parse(ll)
    const chainId = network.config.chainId.toString()
    if (chainId in currentAddresses) {
        if (!currentAddresses[chainId].includes(lottery.address)) {
            currentAddresses[chainId].push(lottery.address)
        }
    } else {
        currentAddresses[chainId] = [lottery.address]
    }

    fs.writeFileSync(frontEndContractsFile, JSON.stringify(currentAddresses))
}

module.exports.tags = ["all", "frontend"]
