// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PulseBooking {
    mapping(bytes32 => uint256) public classMaxCapacity;
    mapping(bytes32 => uint256) public activeBookingCount;
    mapping(bytes32 => mapping(address => bool)) public hasBooked;

    event ClassRegistered(bytes32 indexed classId, uint256 maxCapacity);
    event ClassBooked(bytes32 indexed classId, address indexed user);
    event BookingCancelled(bytes32 indexed classId, address indexed user);

    /// Called by org admin when creating a class (permissionless for simplicity)
    function registerClass(bytes32 classId, uint256 maxCapacity) external {
        require(maxCapacity > 0, "Capacity must be > 0");
        classMaxCapacity[classId] = maxCapacity;
        emit ClassRegistered(classId, maxCapacity);
    }

    /// Called by a user to book a spot
    function bookClass(bytes32 classId) external {
        require(classMaxCapacity[classId] > 0, "Class not registered");
        require(!hasBooked[classId][msg.sender], "Already booked");
        require(activeBookingCount[classId] < classMaxCapacity[classId], "Class full");
        hasBooked[classId][msg.sender] = true;
        activeBookingCount[classId]++;
        emit ClassBooked(classId, msg.sender);
    }

    /// Called by a user to cancel their booking
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
