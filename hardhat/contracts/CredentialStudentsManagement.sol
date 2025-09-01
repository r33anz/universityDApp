// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CredentialStudentManagement is Initializable,UUPSUpgradeable,OwnableUpgradeable {

    struct Student {
        string codSIS;
        address walletAddress;
        bytes32 passwordHash;
        string ipfsHash;
        uint256 issuedAt;
    }
    
    mapping (string => Student) public students; // SisCode => Student info
    mapping(address => string) public walletToSIS;     //wallet => SisCode
    
    event RequestKardex(string  codSIS, address indexed wallet, uint256 timeRequested);
    event CredentialIssued(string codSIS, address walletAddress, uint256 issuedAt);
    

    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function emitCredential(
        string calldata studentSIS,
        address studentWallet
    ) public onlyOwner {
        require(bytes(studentSIS).length > 0, "El codigo SIS no puede estar vacio");
        require(bytes(students[studentSIS].codSIS).length == 0,"El estudiante ya existe");
        require(studentWallet != address(0), "Wallet no puede ser 0x0");
        require(studentWallet != address(this), "La billetera del estudiante no puede ser el proxy");

        students[studentSIS] = Student({
            codSIS: studentSIS,
            walletAddress: studentWallet,
            passwordHash: bytes32(0),
            ipfsHash: "",
            issuedAt: block.timestamp
        });

        walletToSIS[studentWallet] = studentSIS;

        emit CredentialIssued(studentSIS, studentWallet, block.timestamp);
    }
    
    function setStudentPassword(string calldata sisCode, bytes32 passwordHash) external {
        require(bytes(sisCode).length > 0, "El codigo SIS no puede estar vacio");
        require(msg.sender == students[sisCode].walletAddress,"Solo el estudiante puede establecer la contrasenia");

        students[sisCode].passwordHash = passwordHash;
    }
    
    function setIPFSHash(string calldata sisCode, string calldata ipfsHash) external onlyOwner{
        require(bytes(sisCode).length > 0, "El codigo SIS no puede estar vacio");
        require(bytes(students[sisCode].codSIS).length > 0, "El estudiante no existe");
        
        students[sisCode].ipfsHash = ipfsHash;
    }

    function getStudentAddressBySISCode(string calldata sisCode) external view returns(address) {
        require(bytes(sisCode).length > 0, "El codigo SIS no puede estar vacio");
        require(bytes(students[sisCode].codSIS).length > 0, "El estudiante no existe");
        return students[sisCode].walletAddress;
    }
    
    function getStudentPassword(string calldata sisCode) external view returns(bytes32) {
        require(bytes(sisCode).length > 0, "El codigo SIS no puede estar vacio");
        require(msg.sender == students[sisCode].walletAddress,"Solo el estudiante puede obtener la contrasenia");

        return students[sisCode].passwordHash;
    }
    
    function requestKardex(string calldata codSIS) public payable {
        require(bytes(codSIS).length > 0, "El codigo SIS no puede estar vacio");
        require(bytes(students[codSIS].codSIS).length > 0,"El estudiante no existe");
        require(msg.sender == students[codSIS].walletAddress,"Solo el estudiante puede solicitar el kardex");
        require(msg.value > 0, "Pago requerido");

        address admin = owner();
        (bool success ,) = payable(admin).call{value: msg.value}("");
        require(success, "Transferencia fallida");

        emit RequestKardex(codSIS, msg.sender, block.timestamp);
    }

    function verifyWalletToSIS(address studentWallet) external view returns(string memory) {
        require(bytes(walletToSIS[studentWallet]).length > 0,"El estudiante no existe");
        
        return walletToSIS[studentWallet];
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
}