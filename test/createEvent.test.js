const CreateEvent = artifacts.require("./CreateEvent");

require("chai").use(require("chai-as-promised")).should();

contract("CreateEvent", ([deployer, user]) => {
  let createEvent;
  let event;

  describe("Creates event", () => {
    beforeEach(async () => {
      createEvent = await CreateEvent.new();
    });

    it("creates an event", async () => {
      const name = "jay";
      const symbol = "j";
      const uri = "fjdlksajflkas";
      const amount = 100;
      const price = 1;
      result = await createEvent.create(name, symbol, uri, amount, price);
      console.log(result);
    });
  });
});
