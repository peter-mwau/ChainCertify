/* eslint-env mocha */

import pkg from "hardhat";
import { expect } from "chai";

const { ethers } = pkg;

describe("ChainCertify", function () {
    let ChainCertify, owner, addr1, addr2;

    beforeEach("Run before all the other", async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const ChainCertify = await ethers.getContractFactory("ChainCertifyNFT");

        this.chaincertify = await ChainCertify.deploy(100000000, "http:localhost:3000");
    })

    describe("Deployment", async function () {
        it("Should set the right owner", async function () {
            expect(await this.chaincertify.owner()).to.equal(owner.address);
        })

        it("Should set the right name", async function () {
            expect(await this.chaincertify.name()).to.equal("Institution Name");
        })

        it("Should set the right symbol", async function () {
            expect(await this.chaincertify.symbol()).to.equal("ITKN");
        })
    })
})