// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RewardToken is ERC20, Ownable, Pausable, ReentrancyGuard {
    mapping(address => bool) public authorizedMinter;

    event MinterAuthorized(address indexed minter, bool authorized);

    error UnauthorizedMinter();
    error InvalidRecipient();
    error NoRewardsToDistribute();

    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {}

    function setMinterAuthorization(address minter, bool authorized) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinter[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }

    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    function processDailyRewardsBatch(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        if (!authorizedMinter[msg.sender]) revert UnauthorizedMinter();
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "Empty arrays");

        uint256 totalMintAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalMintAmount += amounts[i];
        }

        if (totalMintAmount == 0) revert NoRewardsToDistribute();
        _mint(address(this), totalMintAmount);

        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0) && amounts[i] > 0) {
                _transfer(address(this), recipients[i], amounts[i]);
            }
        }
    }
}