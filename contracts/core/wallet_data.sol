pragma solidity ^0.7.6;
pragma experimental ABIEncoderV2;

library Core {
    struct GuardianInfo {
        bool exists;
        uint128 index;
    }   

    struct RecoveryInfo {
        address newOwner;
        uint expiration;
    }

    struct Wallet { 
        address owner;
        bool locked;

        bytes32 rootHash;
        uint8 merkelHeight;
        uint counter;
        address payable drainAddr;

        // the list of guardians
        address[] guardians;
        // the info about guardians
        mapping (address => GuardianInfo) info;
        
        
        // daily limit
        uint dailyLimit;
        uint lastDay;
        uint spentToday;

        // recovery
        RecoveryInfo pendingRecovery;
        mapping(bytes32 => bool) commitHash;
    }
}
