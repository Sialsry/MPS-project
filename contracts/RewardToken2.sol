// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract RewardToken2 is ERC20, Ownable, Pausable, ReentrancyGuard {
    
    // 상태 변수
    mapping(address => bool) public authorizedMinters; // 민팅 권한이 있는 주소들 (RecordUsage 컨트랙트 등)
    // mapping(address => uint256) public dailyRewards; // 일일 리워드 누적량
    mapping(address => uint256) public totalEarnedRewards; // 총 누적 리워드
    
    uint256 public totalDailyMinted; // 일일 총 민팅량
    uint256 public lastMintDate; // 마지막 민팅 날짜 (YYYYMMDD 형식)
    
    // 이벤트
    event MinterAuthorized(address indexed minter, bool authorized);
    event DailyRewardsBatchMinted(uint256 totalAmount, uint256 recipientCount, uint256 date);
    event DailyRewardsDistributed(address indexed recipient, uint256 amount, uint256 date);
    event DailyRewardsCleared(uint256 date);
    
    // 에러
    error UnauthorizedMinter();
    error InvalidRecipient();
    error NoRewardsToDistribute();
    error SameDay();
    
    constructor(
        string memory name,
        string memory symbol,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        lastMintDate = getCurrentDate();
    }
    
    // 민팅 권한 설정 (RecordUsage 컨트랙트 등록)
    function setMinterAuthorization(address minter, bool authorized) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        authorizedMinters[minter] = authorized;
        emit MinterAuthorized(minter, authorized);
    }
    
    // 일시정지 기능
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    // 일일 리워드 누적 (RecordUsage 컨트랙트에서 호출)
    // function accumulateDailyReward(address recipient, uint256 amount) external {
    //     if (!authorizedMinters[msg.sender]) revert UnauthorizedMinter();
    //     if (recipient == address(0)) revert InvalidRecipient();
        
    //     dailyRewards[recipient] += amount;
    //     totalEarnedRewards[recipient] += amount;
    // }
    
    // 일일 리워드 배치 민팅 및 지급
    function processDailyRewardsBatch(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant whenNotPaused {
        if (!authorizedMinters[msg.sender]) revert UnauthorizedMinter();
        require(recipients.length == amounts.length, "Array length mismatch");
        require(recipients.length > 0, "Empty arrays");
        
        uint256 currentDate = getCurrentDate();
        
        // 같은 날 두 번 실행 방지 (선택적)
        // if (currentDate == lastMintDate) revert SameDay();
        
        uint256 totalMintAmount = 0;
        
        // 총 민팅량 계산
        for (uint256 i = 0; i < amounts.length; i++) {
            totalMintAmount += amounts[i];
        }
        
        if (totalMintAmount == 0) revert NoRewardsToDistribute();
        
        // 총 리워드량 민팅 (컨트랙트에 민팅)
        _mint(address(this), totalMintAmount);
        
        // 각 기업에게 리워드 지급
        for (uint256 i = 0; i < recipients.length; i++) {
            if (recipients[i] != address(0) && amounts[i] > 0) {
                // 컨트랙트에서 수령자에게 전송
                _transfer(address(this), recipients[i], amounts[i]);
                
                emit DailyRewardsDistributed(recipients[i], amounts[i], currentDate);
            }
        }
        
        // 상태 업데이트
        // totalDailyMinted = totalMintAmount;
        // lastMintDate = currentDate;
        
        // emit DailyRewardsBatchMinted(totalMintAmount, recipients.length, currentDate);
    }
    
    // 간단한 일일 리워드 지급 (단일 기업)
    // function processSingleDailyReward(address recipient, uint256 amount) external nonReentrant whenNotPaused {
    //     if (!authorizedMinters[msg.sender]) revert UnauthorizedMinter();
    //     if (recipient == address(0)) revert InvalidRecipient();
    //     require(amount > 0, "Amount must be greater than 0");
        
    //     uint256 currentDate = getCurrentDate();
        
    //     // 민팅 후 즉시 전송
    //     _mint(recipient, amount);
        
    //     // 상태 업데이트
    //     totalEarnedRewards[recipient] += amount;
    //     totalDailyMinted += amount;
    //     lastMintDate = currentDate;
        
    //     emit DailyRewardsDistributed(recipient, amount, currentDate);
    // }
    
    // 일일 리워드 누적량 초기화 (다음 날을 위해)
    // function clearDailyRewards(address[] calldata recipients) external {
    //     if (!authorizedMinters[msg.sender]) revert UnauthorizedMinter();
        
    //     for (uint256 i = 0; i < recipients.length; i++) {
    //         dailyRewards[recipients[i]] = 0;
    //     }
        
    //     emit DailyRewardsCleared(getCurrentDate());
    // }
    
    // 현재 날짜를 YYYYMMDD 형식으로 반환
    function getCurrentDate() public view returns (uint256) {
        uint256 timestamp = block.timestamp;
        uint256 secondsInDay = 86400;
        uint256 daysSinceEpoch = timestamp / secondsInDay;
        
        // 1970-01-01부터의 일수를 날짜로 변환 (단순화된 버전)
        // 실제로는 더 정확한 날짜 계산이 필요할 수 있음
        return 19700101 + daysSinceEpoch;
    }
    
    // 조회 함수들
    function getDailyReward(address account) external view returns (uint256) {
        return dailyRewards[account];
    }
    
    function getTotalEarnedRewards(address account) external view returns (uint256) {
        return totalEarnedRewards[account];
    }
    
    function getTotalDailyMinted() external view returns (uint256) {
        return totalDailyMinted;
    }
    
    function getLastMintDate() external view returns (uint256) {
        return lastMintDate;
    }
    
    function isAuthorizedMinter(address minter) external view returns (bool) {
        return authorizedMinters[minter];
    }
    
    // 컨트랙트 잔액 조회
    function getContractBalance() external view returns (uint256) {
        return balanceOf(address(this));
    }
    
    // 응급 상황용 토큰 회수 (owner만)
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= balanceOf(address(this)), "Insufficient contract balance");
        _transfer(address(this), owner(), amount);
    }
    
    // 기존 ERC20 기능은 그대로 유지 (전송, 승인 등)
    // 필요에 따라 전송 제한을 걸 수도 있음
    
    // 전송 제한 예시 (선택적으로 사용)
    /*
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, amount);
        
        // 예: 특정 조건에서만 전송 허용
        // require(!paused(), "Token transfers are paused");
    }
    */
}
