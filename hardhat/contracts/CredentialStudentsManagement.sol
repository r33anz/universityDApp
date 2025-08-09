// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


contract CredentialStudentManagement {
  
    address public owner;
    struct Student {
        string codSIS;
        address walletAddress;
        bytes32 passwordHash;
        bytes publicKey;
        string ipfsHash;
        uint256 issuedAt;
    }
    
    
    mapping (string => Student) public students; // SisCode => Student info
    mapping(address => string) public walletToSIS;     //wallet => SisCode
    
    event RequestKardex(string  codSIS, address indexed wallet, uint256 timeRequested);
    event CredentialIssued(string codSIS, address walletAddress, uint256 issuedAt);

    constructor(){
        owner = payable(msg.sender);
    }
    
    function emmitCredential(
        string calldata studentSIS,
        address studentWallet,
        bytes calldata studentPublicKey
    ) public  {
        require(msg.sender == owner, "Solo el propietario puede emitir credenciales");
        require(bytes(students[studentSIS].codSIS).length == 0,
            "El estudiante ya existe");

        students[studentSIS] = Student({
            codSIS: studentSIS,
            walletAddress: studentWallet,
            passwordHash: bytes32(0),
            ipfsHash: "",
            publicKey: studentPublicKey,
            issuedAt: block.timestamp
        });

        walletToSIS[studentWallet] = studentSIS;

        emit CredentialIssued(studentSIS, studentWallet, block.timestamp);
    }
    
    function setStudentPassword(string calldata sisCode, bytes32 passwordHash) external {
        
        require(msg.sender == students[sisCode].walletAddress, 
            "Solo el estudiante puede establecer la contrasenia");

        students[sisCode].passwordHash = passwordHash;
    }
    
    function setIPFSHash(string calldata sisCode, string calldata ipfsHash) external {
        require(msg.sender == owner,"Solo el propietario puede establecer el IPFS Hash");
        students[sisCode].ipfsHash = ipfsHash;
    }
    
    function getAddressAndIPFSHash(string calldata sisCode) external view returns(address, string memory) {
        return (students[sisCode].walletAddress, students[sisCode].ipfsHash);
    }
    
    function getStudentPassword(string calldata sisCode) external view returns(bytes32) {
        
        require(msg.sender == students[sisCode].walletAddress, 
            "Solo el estudiante puede obtener la contrasenia");

        return students[sisCode].passwordHash;
    }
    
    function requestKardex(string calldata codSIS) public payable {
        require(bytes(students[codSIS].codSIS).length > 0, 
            "El estudiante no existe");
        require(msg.sender == students[codSIS].walletAddress, 
            "Solo el estudiante puede solicitar el kardex");
        require(msg.value > 0, "Pago requerido");

        (bool success ,) = payable(owner).call{value: msg.value}("");
        require(success, "Transferencia fallida");
        emit RequestKardex(codSIS, msg.sender, block.timestamp);
    }

    function verifyWalletToSIS(address studentWallet) external view returns(string memory) {
        require(bytes(walletToSIS[studentWallet]).length > 0, 
            "El estudiante no existe");
        return walletToSIS[studentWallet];
    }

}