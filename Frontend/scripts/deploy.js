

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account: ", deployer.address);

    const ChainCertify = await ethers.getContractFactory("ChainCertifyNFT");
    const chaincertify = await ChainCertify.deploy(100000000, "http:localhost:3000");

    console.log("ChainCertify address: ", chaincertify.target);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });