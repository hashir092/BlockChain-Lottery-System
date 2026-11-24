const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying Lottery with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Ticket price: 0.01 ETH
  const ticketPrice = hre.ethers.parseEther("0.01");

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(ticketPrice);
  await lottery.waitForDeployment();

  const address = await lottery.getAddress();
  console.log("Lottery deployed to:", address);

  // Start first round (24 hours)
  const duration = 24 * 60 * 60; // 24h
  const tx = await lottery.startRound(duration);
  await tx.wait();
  console.log("First round started. Duration: 24 hours");

  // Save deployment info
  const network = await hre.ethers.provider.getNetwork();
  const deployment = {
    address,
    network: network.name,
    chainId: Number(network.chainId),
    ticketPrice: "0.01",
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Write address
  fs.writeFileSync(
    path.join(outDir, "deployment.json"),
    JSON.stringify(deployment, null, 2)
  );
  console.log("Deployment info saved to frontend/src/contracts/deployment.json");

  // Also copy ABI
  const artifact = await hre.artifacts.readArtifact("Lottery");
  fs.writeFileSync(
    path.join(outDir, "LotteryABI.json"),
    JSON.stringify(artifact.abi, null, 2)
  );
  console.log("ABI saved to frontend/src/contracts/LotteryABI.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
