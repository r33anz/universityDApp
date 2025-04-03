// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CredentialStudentManagement is Ownable {
    using ECDSA for bytes32;
    
    struct Student {
        string codSIS;
        address walletAddress;
        bytes32 passwordHash;
        bytes publicKey;
        string ipfsHash;
        uint256 issuedAt;
    }
    
    mapping (string => Student) public students; // SISCode -> Student
    
    event RequestKardex(string  codSIS, uint256 timeRequested);
    
    constructor() Ownable(msg.sender) {
    }
    
    function emmitCredential(
        string calldata studentSIS,
        address studentWallet,
        bytes calldata studentPublicKey
    ) public onlyOwner {
        require(bytes(students[studentSIS].codSIS).length == 0,
            "Student already exists");

        students[studentSIS] = Student({
            codSIS: studentSIS,
            walletAddress: studentWallet,
            passwordHash: bytes32(0),
            ipfsHash: "",
            publicKey: studentPublicKey,
            issuedAt: block.timestamp
        });
    }
    
    function setStudentPassword(string calldata sisCode, bytes32 passwordHash) external {
        
        require(msg.sender == students[sisCode].walletAddress, 
            "Only student or owner can set password");

        students[sisCode].passwordHash = passwordHash;
    }
    
    function setIPFSHash(string calldata sisCode, string calldata ipfsHash) external onlyOwner {
        students[sisCode].ipfsHash = ipfsHash;
    }
    
    function getAddressAndIPFSHash(string calldata sisCode) external view returns(address, string memory) {
        return (students[sisCode].walletAddress, students[sisCode].ipfsHash);
    }
    
    function getStudentPassword(string calldata sisCode) external view returns(bytes32) {
        
        require(msg.sender == students[sisCode].walletAddress, 
            "Only student or owner can view password hash");

        return students[sisCode].passwordHash;
    }
    
    function requestKardex(string calldata codSIS) external {
        require(bytes(students[codSIS].codSIS).length > 0, "Student does not exist");
        
        emit RequestKardex(codSIS, block.timestamp);
    }
}