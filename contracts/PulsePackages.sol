// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract PulsePackages {
    // Base mainnet USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
    // Base Sepolia USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e
    IERC20 public immutable usdc;

    event PackagePurchased(
        bytes32 indexed packageId,
        address indexed buyer,
        address indexed orgWallet,
        uint256 amountUsdc
    );

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    /// User must approve USDC spend before calling this.
    /// amountUsdc is in USDC's 6-decimal units (e.g. 10_000_000 = $10.00)
    function purchasePackage(
        bytes32 packageId,
        address orgWallet,
        uint256 amountUsdc
    ) external {
        require(orgWallet != address(0), "Invalid org wallet");
        require(amountUsdc > 0, "Amount must be > 0");
        bool ok = usdc.transferFrom(msg.sender, orgWallet, amountUsdc);
        require(ok, "USDC transfer failed");
        emit PackagePurchased(packageId, msg.sender, orgWallet, amountUsdc);
    }
}
