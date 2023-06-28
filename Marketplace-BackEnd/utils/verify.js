const { run } = require("hardhat");

async function verify(contractAddress, args) {
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
  } catch (error) {
    if (error.message.toLowerCase().includes("Already Verified!")) {
      console.log("Already Verified!");
    } else {
      console.log(error);
    }
  }
}

module.exports = {
  verify,
};
