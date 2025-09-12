"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SMART_ACCOUNT_FACTORY_ABI = void 0;
exports.SMART_ACCOUNT_FACTORY_ABI = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_entryPoint",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "createAccount",
        "outputs": [
            {
                "internalType": "address",
                "name": "smartAccount",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "getAccount",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];
//# sourceMappingURL=SmartAccountFactory.js.map