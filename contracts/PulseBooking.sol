// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PulseBooking {
    mapping(bytes32 => uint256) public classMaxCapacity;
    mapping(bytes32 => uint256) public activeBookingCount;
    mapping(bytes32 => mapping(address => bool)) public hasBooked;
    mapping(bytes32 => uint256) public classPrice; // in wei
    mapping(bytes32 => address payable) public studioWallet;

    event ClassRegistered(bytes32 indexed classId, uint256 maxCapacity, uint256 priceWei);
    event ClassBooked(bytes32 indexed classId, address indexed user, uint256 paid);
    event BookingCancelled(bytes32 indexed classId, address indexed user);

    function registerClass(
        bytes32 classId,
        uint256 maxCapacity,
        uint256 priceWei,
        address payable wallet
    ) external {
        require(maxCapacity > 0, "Capacity must be > 0");
        classMaxCapacity[classId] = maxCapacity;
        classPrice[classId] = priceWei;
        studioWallet[classId] = wallet;
        emit ClassRegistered(classId, maxCapacity, priceWei);
    }

    function bookClass(bytes32 classId) external payable {
        require(classMaxCapacity[classId] > 0, "Class not registered");
        require(!hasBooked[classId][msg.sender], "Already booked");
        require(activeBookingCount[classId] < classMaxCapacity[classId], "Class full");
        require(msg.value >= classPrice[classId], "Insufficient payment");

        hasBooked[classId][msg.sender] = true;
        activeBookingCount[classId]++;

        // Instant settlement: forward payment directly to the studio
        if (msg.value > 0 && studioWallet[classId] != address(0)) {
            studioWallet[classId].transfer(msg.value);
        }

        emit ClassBooked(classId, msg.sender, msg.value);
    }

    function cancelBooking(bytes32 classId) external {
        require(hasBooked[classId][msg.sender], "No booking found");
        hasBooked[classId][msg.sender] = false;
        activeBookingCount[classId]--;
        emit BookingCancelled(classId, msg.sender);
    }

    function getBookingCount(bytes32 classId) external view returns (uint256) {
        return activeBookingCount[classId];
    }
}
