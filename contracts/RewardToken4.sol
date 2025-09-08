// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardToken4 is ERC20, Ownable {
    address public recordUsageContract;
    
    constructor(address admin) ERC20("MPS Mileage", "MPSM") Ownable(admin) {}

    function setRecordUsageContract(address _recordUsage) external onlyOwner {
        recordUsageContract = _recordUsage;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    // RecordUsage 컨트랙트에서의 전송만 허용
    function transfer(address to, uint256 amount) public override returns (bool) {
        require(msg.sender == recordUsageContract, "Only RecordUsage contract");
        return super.transfer(to, amount);
    }

    // 양도 불가 (RecordUsage 컨트랙트 제외)
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override {
        // 민팅(0→to) / 소각(from→0) / RecordUsage 컨트랙트에서의 전송만 허용
        if (from != address(0) && to != address(0) && msg.sender != recordUsageContract) {
            revert("NonTransferable");
        }
        super._update(from, to, value);
    }
}