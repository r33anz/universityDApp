// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialStudentManagement {

    bytes32 private constant IMPLEMENTATION_SLOT = 0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc;
    bytes32 private constant ADMIN_SLOT = 0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103;
    bytes32 private constant INITIALIZED_SLOT = 0x834ce84547018237034401a09067277cdcbe7bbf7d7d30f6b382b0a102b7b4a3;

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

    modifier onlyAdmin() {
        require(_getAdmin() != address(0), "Admin no configurado");
        require(msg.sender == _getAdmin(), "Solo el admin puede ejecutar");
        _;
    }
    
    function initialize(address adminAddress) external {
        require(adminAddress != address(0), "Admin no puede ser 0x0");
        
        // Verificar que no esté inicializado
        bool initialized;
        assembly {
            initialized := sload(INITIALIZED_SLOT)
        }
        require(!initialized, "Ya inicializado");
        
        assembly {
            sstore(INITIALIZED_SLOT, true)
            sstore(ADMIN_SLOT, adminAddress)
        }
    }

    function emmitCredential(
        string calldata studentSIS,
        address studentWallet
    ) public onlyAdmin {
        
        require(bytes(students[studentSIS].codSIS).length == 0,
            "El estudiante ya existe");

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
        
        require(msg.sender == students[sisCode].walletAddress, 
            "Solo el estudiante puede establecer la contrasenia");

        students[sisCode].passwordHash = passwordHash;
    }
    
    function setIPFSHash(string calldata sisCode, string calldata ipfsHash) external {
        students[sisCode].ipfsHash = ipfsHash;
    }
    
    function getAddress(string calldata sisCode) external view returns(address) {
        return students[sisCode].walletAddress;
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

        address adminAddr = _getAdmin();
        (bool success ,) = payable(adminAddr).call{value: msg.value}("");
        require(success, "Transferencia fallida");

        emit RequestKardex(codSIS, msg.sender, block.timestamp);
    }

    function verifyWalletToSIS(address studentWallet) external view returns(string memory) {
        require(bytes(walletToSIS[studentWallet]).length > 0, 
            "El estudiante no existe");
        return walletToSIS[studentWallet];
    }

    function getAdmin() external view returns(address) {
        return _getAdmin();
    }
    
    function isInitialized() external view returns(bool) {
        bool initialized;
        assembly {
            initialized := sload(INITIALIZED_SLOT)
        }
        return initialized;
    }
 
    function _getAdmin() private view returns(address adminAddr) {
        assembly {
            adminAddr := sload(ADMIN_SLOT)
        }
    }
    

}