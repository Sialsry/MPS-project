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
    
    // function processSingleDailyReward(address recipient, uint256 amount) external;
}

contract RecordUsage is Ownable, Pausable, ReentrancyGuard {
    
    IRewardToken public rewardToken;
    
    // 리워드 관련 설정
    // uint256 public baseRewardAmount = 1 ether; // 기본 리워드 금액 (1 토큰)
    // mapping(uint256 => uint256) public musicRewardMultiplier; // 음원별 리워드 배수
    
    enum RewardCode {
        Rewardless,    // 0: 무보상
        Rewarded,      // 1: 보상 지급
        MusicLimit,    // 2: 음원 한도 초과
        CompanyLimit   // 3: 기업 한도 초과
    }

    struct UsageRecord {
        uint256 company_id;
        uint256 music_id;
        uint256 play_id;
        uint8 reward_code;
        uint256 created_at;
    }

    mapping(address => bool) public approvedCompanies;
    mapping(uint256 => uint256) public trackPlayCount;
    mapping(address => uint256) public companyTotalRewards;
    mapping(address => uint256) public dailyRewardAccumulated; // 일일 리워드 누적량
    
    event PlayRecorded(
        address indexed using_company,
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
    
    event RewardAccumulated(
        address indexed company,
        uint256 amount,
        uint256 music_id
    );
    
    event DailyRewardsBatchProcessed(
        uint256 totalRecipients,
        uint256 totalAmount
    );
    
    event CompanyApproved(address indexed company, bool approved);

    error CompanyNotApproved();
    error InvalidTrackId();
    error EmptyBatch();

    modifier onlyApprovedCompany() {
        if (!approvedCompanies[msg.sender]) revert CompanyNotApproved();
        _;
    }

    modifier validTrackId(uint256 track_id) {
        if (track_id == 0) revert InvalidTrackId();
        _;
    }

    constructor(address initial_owner, address _rewardToken) Ownable(initial_owner) {
        if (_rewardToken != address(0)) {
            rewardToken = IRewardToken(_rewardToken);
        }
    }
    
    // 리워드 토큰 컨트랙트 설정
    // function setRewardToken(address _rewardToken) external onlyOwner {
    //     require(_rewardToken != address(0), "Invalid reward token address");
    //     rewardToken = IRewardToken(_rewardToken);
    // }
    
    // 기본 리워드 금액 설정
    // function setBaseRewardAmount(uint256 _amount) external onlyOwner {
    //     baseRewardAmount = _amount;
    // }
    
    // 음원별 리워드 배수 설정
    // function setMusicRewardMultiplier(uint256 musicId, uint256 multiplier) external onlyOwner {
    //     musicRewardMultiplier[musicId] = multiplier;
    // }

    // function setCompanyApproval(address company, bool approved) external onlyOwner {
    //     require(company != address(0), "Invalid company address");
    //     approvedCompanies[company] = approved;
    //     emit CompanyApproved(company, approved);
    // }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // 배치로 일일 사용내역 기록 및 리워드 처리
    function recordDailyUsageBatch(
        UsageRecord[] calldata usageRecords
    ) 
        external 
        onlyApprovedCompany 
        whenNotPaused 
        nonReentrant 
    {
        if (usageRecords.length == 0) revert EmptyBatch();

        // uint256 totalRewardAmount = 0;
        
        for (uint256 i = 0; i < usageRecords.length; i++) {
            UsageRecord calldata record = usageRecords[i];
            
            if (record.music_id == 0) revert InvalidTrackId();
            
            // trackPlayCount[record.music_id]++;
            
            // 리워드 처리 (reward_code가 1인 경우)
            // if (record.reward_code == 1) {
            //     uint256 rewardAmount = calculateReward(record.music_id);
            //     dailyRewardAccumulated[msg.sender] += rewardAmount;
            //     totalRewardAmount += rewardAmount;
                
            //     emit RewardAccumulated(msg.sender, rewardAmount, record.music_id);
            // }
            
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

    // 일일 리워드 배치 지급 (owner 또는 authorized 시스템에서 호출)
    function processDailyRewardsBatch(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(address(rewardToken) != address(0), "Reward token not set");
        require(recipients.length == amounts.length, "Array length mismatch");
        
        // RewardToken2 컨트랙트를 통해 배치 지급
        rewardToken.processDailyRewardsBatch(recipients, amounts);
        
        // 일일 누적 리워드 초기화
        // for (uint256 i = 0; i < recipients.length; i++) {
        //     dailyRewardAccumulated[recipients[i]] = 0;
        // }
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        emit DailyRewardsBatchProcessed(recipients.length, totalAmount);
    }

    // 리워드 계산 함수
    // function calculateReward(uint256 musicId) internal view returns (uint256) {
    //     uint256 multiplier = musicRewardMultiplier[musicId];
    //     if (multiplier == 0) {
    //         multiplier = 1; // 기본 배수는 1
    //     }
    //     return baseRewardAmount * multiplier;
    // }

    // 단일 사용내역 기록 (기존 호환성을 위해 유지)
    // function recordDailyUsage(
    //     uint256 company_id,
    //     uint256 music_id,
    //     uint256 play_id,
    //     RewardCode reward_code,
    //     uint256 created_at
    // )
    //     external
    //     onlyApprovedCompany
    //     whenNotPaused
    //     validTrackId(music_id)
    //     nonReentrant
    // {
    //     trackPlayCount[music_id]++;

    //     // 리워드 처리 (reward_code가 Rewarded인 경우)
    //     if (reward_code == RewardCode.Rewarded) {
    //         uint256 rewardAmount = calculateReward(music_id);
    //         dailyRewardAccumulated[msg.sender] += rewardAmount;
            
    //         emit RewardAccumulated(msg.sender, rewardAmount, music_id);
    //     }

    //     emit PlayRecorded(
    //         msg.sender,
    //         music_id,
    //         UseCase.Music_use,
    //         play_id,
    //         reward_code
    //     );
    // }

    // 조회 함수들
    function getTrackPlayCount(uint256 track_id) external view returns (uint256) {
        return trackPlayCount[track_id];
    }

    function getCompanyTotalRewards(address company) external view returns (uint256) {
        return companyTotalRewards[company];
    }
    
    function getDailyRewardAccumulated(address company) external view returns (uint256) {
        return dailyRewardAccumulated[company];
    }

    function isCompanyApproved(address company) external view returns (bool) {
        return approvedCompanies[company];
    }
    
    function getBaseRewardAmount() external view returns (uint256) {
        return baseRewardAmount;
    }
    
    function getMusicRewardMultiplier(uint256 musicId) external view returns (uint256) {
        return musicRewardMultiplier[musicId];
    }
    
    function getRewardTokenAddress() external view returns (address) {
        return address(rewardToken);
    }
}
