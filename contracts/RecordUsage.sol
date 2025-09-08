// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRewardToken {
    function processDailyRewardsBatch(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external;
}

contract RecordUsage is Ownable, Pausable, ReentrancyGuard {
    IRewardToken public rewardToken;

    enum RewardCode {
        Rewardless,    
        Rewarded,     
        MusicLimit,    
        CompanyLimit 
    }

    struct UsageRecord {
        uint256 company_id;
        uint256 music_id;
        uint256 play_id;
        uint8 reward_code;
        uint256 created_at;
    }
    
    event PlayRecorded(
        uint256 indexed company_id,
        uint256 indexed track_id,
        uint256 play_id,
        RewardCode reward_code,
        uint256 usedAt
    );

    event BatchRecorded(
        address indexed processor,
        uint256 recordCount,
        uint256 timestamp
    );

    event DailyRewardsBatchProcessed(
        uint256 totalRecipients,
        uint256 totalAmount
    );

    error InvalidTrackId();
    error EmptyBatch();

    constructor(address initial_owner, address _rewardToken) Ownable(initial_owner) {
        if (_rewardToken != address(0)) {
            rewardToken = IRewardToken(_rewardToken);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function recordDailyUsageBatch(
        UsageRecord[] calldata usageRecords
    )
        external
        onlyOwner
        whenNotPaused
        nonReentrant
    {
        if (usageRecords.length == 0) revert EmptyBatch();

        for (uint256 i = 0; i < usageRecords.length; i++) {
            UsageRecord calldata record = usageRecords[i];
            if (record.music_id == 0) revert InvalidTrackId();

            emit PlayRecorded(
                record.company_id,
                record.music_id,
                record.play_id,
                RewardCode(record.reward_code),
                record.created_at
            );
        }

        emit BatchRecorded(msg.sender, usageRecords.length, block.timestamp);
    }

    function processDailyRewardsBatch(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(address(rewardToken) != address(0), "Reward token not set");
        require(recipients.length == amounts.length, "Array length mismatch");

        rewardToken.processDailyRewardsBatch(recipients, amounts);

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        emit DailyRewardsBatchProcessed(recipients.length, totalAmount);
    }
}