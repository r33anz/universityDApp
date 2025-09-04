const { ethers } = require("hardhat");

const PROXY_ADDRESS = "0xD1BD72d7292430c1dc1481f676739Fa697a0A50c";

const ABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "target",
          "type": "address"
        }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "implementation",
          "type": "address"
        }
      ],
      "name": "ERC1967InvalidImplementation",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "ERC1967NonPayable",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "FailedCall",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "InvalidInitialization",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NotInitializing",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "UUPSUnauthorizedCallContext",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "slot",
          "type": "bytes32"
        }
      ],
      "name": "UUPSUnsupportedProxiableUUID",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "codSIS",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "issuedAt",
          "type": "uint256"
        }
      ],
      "name": "CredentialIssued",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint64",
          "name": "version",
          "type": "uint64"
        }
      ],
      "name": "Initialized",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "codSIS",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "wallet",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "timeRequested",
          "type": "uint256"
        }
      ],
      "name": "RequestKardex",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "implementation",
          "type": "address"
        }
      ],
      "name": "Upgraded",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "UPGRADE_INTERFACE_VERSION",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "studentSIS",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "studentWallet",
          "type": "address"
        }
      ],
      "name": "emitCredential",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "sisCode",
          "type": "string"
        }
      ],
      "name": "getStudentAddressBySISCode",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "sisCode",
          "type": "string"
        }
      ],
      "name": "getStudentPassword",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "initialOwner",
          "type": "address"
        }
      ],
      "name": "initialize",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "proxiableUUID",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "codSIS",
          "type": "string"
        }
      ],
      "name": "requestKardex",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "sisCode",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        }
      ],
      "name": "setIPFSHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "sisCode",
          "type": "string"
        },
        {
          "internalType": "bytes32",
          "name": "passwordHash",
          "type": "bytes32"
        }
      ],
      "name": "setStudentPassword",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "students",
      "outputs": [
        {
          "internalType": "string",
          "name": "codSIS",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "walletAddress",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "passwordHash",
          "type": "bytes32"
        },
        {
          "internalType": "string",
          "name": "ipfsHash",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "issuedAt",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newImplementation",
          "type": "address"
        },
        {
          "internalType": "bytes",
          "name": "data",
          "type": "bytes"
        }
      ],
      "name": "upgradeToAndCall",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "studentWallet",
          "type": "address"
        }
      ],
      "name": "verifyWalletToSIS",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "walletToSIS",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

async function main() {
    console.log("🔍 Diagnosticando problema de storage...\n");
    
    const provider = ethers.provider;
    const contract = new ethers.Contract(PROXY_ADDRESS, ABI, provider);
    
    const sisCode = "20190010";
    
    console.log(`Proxy Address: ${PROXY_ADDRESS}`);
    console.log(`SIS Code: ${sisCode}\n`);
    
    // 1. Consulta directa al struct students
    console.log("📊 Consultando struct students[sisCode]:");
    const student = await contract.students(sisCode);
    console.log(`- codSIS: "${student.codSIS}"`);
    console.log(`- walletAddress: ${student.walletAddress}`);
    console.log(`- passwordHash: ${student.passwordHash}`);
    console.log(`- ipfsHash: "${student.ipfsHash}"`);
    console.log(`- issuedAt: ${student.issuedAt.toString()}`);
    
    // 2. Consulta a través de getAddress
    console.log("\n🔍 Consultando getAddress(sisCode):");
    const addressFromFunction = await contract.getStudentAddressBySISCode(sisCode);
    console.log(`getAddress result: ${addressFromFunction}`);
    
    // 3. Comparación
    console.log("\n📊 Análisis:");
    console.log(`Wallet en struct: ${student.walletAddress}`);
    console.log(`Resultado getAddress: ${addressFromFunction}`);
    console.log(`¿Son iguales?: ${student.walletAddress.toLowerCase() === addressFromFunction.toLowerCase()}`);
    
    if (addressFromFunction === PROXY_ADDRESS) {
        console.log("\n❌ PROBLEMA IDENTIFICADO:");
        console.log("getAddress está retornando la dirección del proxy en lugar de la wallet del estudiante");
        console.log("Esto indica un problema grave de storage slots o implementación del proxy");
    }
    
    // 4. Verificar si el problema afecta a otros estudiantes
    console.log("\n🔄 Probando con otros SIS codes posibles:");
    const testSisCodes = ["20190010"];
    
    for (const testSis of testSisCodes) {
        try {
            const testStudent = await contract.students(testSis);
            if (testStudent.codSIS && testStudent.codSIS !== "") {
                const testAddress = await contract.getStudentAddressBySISCode(testSis);
                console.log(`SIS ${testSis}:`);
                console.log(`  Struct wallet: ${testStudent.walletAddress}`);
                console.log(`  getAddress: ${testAddress}`);
                console.log(`  Problema: ${testAddress === PROXY_ADDRESS ? "SÍ" : "NO"}`);
            }
        } catch (error) {
            // SIS no existe, continuar
        }
    }
  
}

main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});