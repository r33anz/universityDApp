// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract CredentialStudentManagement is Ownable{
    using ECDSA for bytes32;

    struct Student{
        string codSIS; 
        address walletAddress;
        bytes publicKey;
        uint256 issuedAt;
    }

    mapping (string => Student) public students; // SISCode -> Student 
    mapping (address => string) public walletToCodSIS; // Wallet -> SISCode
    
    event CredentialStudentEmmited(string indexed studentSIS, address indexed studentWallet);
    
    constructor() Ownable(msg.sender) {

    }

    function emmitCredential(
        string calldata studentSIS,
        address studentWallet,
        bytes calldata studentPublicKey
    ) public onlyOwner{

        require(bytes(students[studentSIS].codSIS).length == 0, 
            "Student already exists");

        students[studentSIS] = Student({
            codSIS: studentSIS,
            walletAddress: studentWallet,
            publicKey: studentPublicKey,
            issuedAt: block.timestamp
        });

        walletToCodSIS[studentWallet] = studentSIS;

        emit CredentialStudentEmmited(studentSIS, studentWallet);         
    }

    function verifySISCodeByWalletAddres(address walletAddress) external view returns(string memory){
        return walletToCodSIS[walletAddress];
    }
}