const Event = artifacts.require("CreateEvent");

module.exports = async function (deployer) {
  await deployer.deploy(Event);
};
