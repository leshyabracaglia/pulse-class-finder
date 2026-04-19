const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PulseBooking", function () {
  async function deploy() {
    const [owner, user1, user2] = await ethers.getSigners();
    const PulseBooking = await ethers.getContractFactory("PulseBooking");
    const contract = await PulseBooking.deploy();
    const classId = ethers.keccak256(ethers.toUtf8Bytes("class-uuid-123"));
    return { contract, classId, owner, user1, user2 };
  }

  it("registers a class and allows booking", async function () {
    const { contract, classId, user1 } = await deploy();
    await contract.registerClass(classId, 10);
    await contract.connect(user1).bookClass(classId);
    expect(await contract.hasBooked(classId, user1.address)).to.be.true;
    expect(await contract.getBookingCount(classId)).to.equal(1);
  });

  it("prevents double booking", async function () {
    const { contract, classId, user1 } = await deploy();
    await contract.registerClass(classId, 10);
    await contract.connect(user1).bookClass(classId);
    await expect(contract.connect(user1).bookClass(classId)).to.be.revertedWith(
      "Already booked"
    );
  });

  it("enforces max capacity", async function () {
    const { contract, classId, user1, user2 } = await deploy();
    await contract.registerClass(classId, 1);
    await contract.connect(user1).bookClass(classId);
    await expect(contract.connect(user2).bookClass(classId)).to.be.revertedWith(
      "Class full"
    );
  });

  it("allows cancellation and rebooking", async function () {
    const { contract, classId, user1, user2 } = await deploy();
    await contract.registerClass(classId, 1);
    await contract.connect(user1).bookClass(classId);
    await contract.connect(user1).cancelBooking(classId);
    await contract.connect(user2).bookClass(classId);
    expect(await contract.hasBooked(classId, user2.address)).to.be.true;
  });

  it("reverts booking for unregistered class", async function () {
    const { contract, classId, user1 } = await deploy();
    await expect(contract.connect(user1).bookClass(classId)).to.be.revertedWith(
      "Class not registered"
    );
  });
});
