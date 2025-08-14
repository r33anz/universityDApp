// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract CredentialProxy {
    //EIP-1967
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

    mapping(string => Student) public students;
    mapping(address => string) public walletToSIS;

    event Upgraded(address indexed implementation);
    event AdminChanged(address previousAdmin, address newAdmin);

    constructor(address _implementation) {
        require(_implementation != address(0), "Implementacion no puede ser 0x0");
        require(_isContract(_implementation), "Implementacion debe ser contrato");
        
        _setAdmin(msg.sender);
        _setImplementation(_implementation);
        
        _initializeImplementation(_implementation, msg.sender);
    }

    modifier onlyAdmin() {
        require(msg.sender == _getAdmin(), "Solo el admin puede ejecutar");
        _;
    }

    
    function upgrade(address newImplementation) external onlyAdmin {
        require(newImplementation != address(0), "Nueva implementacion no puede ser 0x0");
        require(_isContract(newImplementation), "Nueva implementacion debe ser contrato");
        require(newImplementation != implementation(), "Misma implementacion");
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
    }

    function upgradeToAndCall(
        address newImplementation, 
        bytes calldata data
    ) external onlyAdmin payable {
        require(newImplementation != address(0), "Nueva implementacion no puede ser 0x0");
        require(_isContract(newImplementation), "Nueva implementacion debe ser contrato");
        require(newImplementation != implementation(), "Misma implementacion");
        
        _setImplementation(newImplementation);
        emit Upgraded(newImplementation);
        
        if (data.length > 0) {
            (bool success, bytes memory returnData) = newImplementation.delegatecall(data);
            if (!success) {
                if (returnData.length > 0) {
                    assembly {
                        let returndata_size := mload(returnData)
                        revert(add(32, returnData), returndata_size)
                    }
                } else {
                    revert("upgradeToAndCall: delegatecall failed");
                }
            }
        }
    }

    function changeAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Nuevo admin no puede ser 0x0");
        require(newAdmin != _getAdmin(), "Mismo admin");
        
        address previousAdmin = _getAdmin();
        _setAdmin(newAdmin);
        emit AdminChanged(previousAdmin, newAdmin);
    }

    function implementation() public view returns (address impl) {
        assembly {
            impl := sload(IMPLEMENTATION_SLOT)
        }
    }

    function admin() public view returns (address adm) {
        return _getAdmin();
    }

    function isInitialized() public view returns (bool initialized) {
        assembly {
            initialized := sload(INITIALIZED_SLOT)
        }
    }

    function _setImplementation(address newImplementation) private {
        assembly {
            sstore(IMPLEMENTATION_SLOT, newImplementation)
        }
    }

    function _getAdmin() private view returns (address adm) {
        assembly {
            adm := sload(ADMIN_SLOT)
        }
    }

    function _setAdmin(address newAdmin) private {
        assembly {
            sstore(ADMIN_SLOT, newAdmin)
        }
    }

    function _isContract(address account) private view returns (bool) {
        return account.code.length > 0;
    }

    function _initializeImplementation(address impl, address _admin) private {
        bytes memory initData = abi.encodeWithSignature("initialize(address)", _admin);
        (bool success, bytes memory returnData) = impl.delegatecall(initData);
        
        if (!success) {
            if (returnData.length > 0) {
                assembly {
                    let returndata_size := mload(returnData)
                    revert(add(32, returnData), returndata_size)
                }
            } else {
                revert("Inicializacion de implementacion fallo");
            }
        }
        
        assembly {
            sstore(INITIALIZED_SLOT, true)
        }
    }

    fallback() external payable {
        address impl = implementation();
        require(impl != address(0), "Implementacion no configurada");
        
        assembly {
            
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 { 
                revert(0, returndatasize()) 
            }
            default { 
                return(0, returndatasize()) 
            }
        }
    }

    receive() external payable {}
}
