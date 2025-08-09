// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract KardexNFT is ERC721, ERC721URIStorage, Ownable {
    
    struct KardexInfo {
        address student;           
        string studentId;  
        uint256 totalSubjects;    
        uint256 lastUpdated;      
        string currentIpfsCid;
        bool isActive;           
        uint256 version;          
    }
    // tokenID -> KardexInfo
    mapping(uint256 => KardexInfo) public kardexInfo;
    
    // Student address -> tokenId
    mapping(address => uint256) public studentToToken;
    
    // Student ID -> tokenId
    mapping(string => uint256) public studentIdToToken;

    uint256 private _tokenIdCounter = 0;
    
    // Events
    event KardexMinted(uint256 indexed tokenId,address indexed student);
    event KardexProgressed(uint256 indexed tokenId,address indexed student,uint256 version);
    event KardexDeleted(uint256 indexed tokenId,address indexed student);
    
    constructor() ERC721("UMSSKardex", "UMSSKRDX") Ownable(msg.sender) {
        // Constructor for OpenZeppelin v5
    }
 
    function mintStudentKardex(
        address student,
        string memory studentId,
        uint256 initialSubjects,
        string memory ipfsCid,
        string memory metadataUri
    ) public onlyOwner returns (uint256) {
        require(student != address(0), "Direccion invalida");
        require(studentToToken[student] == 0, "Estudiante ya tiene NFT");
        require(studentIdToToken[studentId] == 0, "Student ID ya existe");
        require(initialSubjects > 0, "Debe tener materias");
        require(bytes(studentId).length > 0, "Student ID no puede estar vacio");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(student, tokenId);
        _setTokenURI(tokenId, metadataUri);
        
        kardexInfo[tokenId] = KardexInfo({
            student: student,
            studentId: studentId,
            totalSubjects: initialSubjects,
            lastUpdated: block.timestamp,
            currentIpfsCid: ipfsCid,
            isActive: true,
            version: 1
        });
        
        studentToToken[student] = tokenId;
        studentIdToToken[studentId] = tokenId;
        
        emit KardexMinted(tokenId, student);
        return tokenId;
    }
    
    function updateStudentProgress(
        address student,
        uint256 newTotalSubjects,
        string memory newIpfsCid,
        string memory newMetadataUri
    ) public onlyOwner {
        uint256 tokenId = studentToToken[student];
        require(tokenId != 0, "Estudiante no tiene NFT");
        require(kardexInfo[tokenId].isActive, "Kardex inactivo");
        require(newTotalSubjects >= kardexInfo[tokenId].totalSubjects, "No puede retroceder");
        
        KardexInfo storage kardex = kardexInfo[tokenId];
        
        kardex.totalSubjects = newTotalSubjects;
        kardex.currentIpfsCid = newIpfsCid;
        kardex.lastUpdated = block.timestamp;
        kardex.version++; 
        
        _setTokenURI(tokenId, newMetadataUri);
        
        emit KardexProgressed(
            tokenId, 
            student, 
            kardex.version
        );
    }
    
    function getStudentKardex(address student) public view returns (KardexInfo memory) {
        uint256 tokenId = studentToToken[student];
        require(tokenId != 0, "Estudiante no tiene NFT");
        return kardexInfo[tokenId];
    }
    
    function hasKardex(address student) public view returns (bool) {
        return studentToToken[student] != 0;
    }

    function getStudentProgress(address student) public view returns (
        uint256 tokenId,
        uint256 totalSubjects,
        uint256 version,
        uint256 lastUpdated
    ) {
        tokenId = studentToToken[student];
        require(tokenId != 0, "Estudiante no tiene NFT");
        
        KardexInfo memory kardex = kardexInfo[tokenId];
        return (
            tokenId,
            kardex.totalSubjects,
            kardex.version,
            kardex.lastUpdated
        );
    }
    
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        
        // Prevent transfers except minting (from=0) and burning (to=0)
        require(from == address(0) || to == address(0), "NFT no transferible");
        
        return super._update(to, tokenId, auth);
    }

    function burnKardex(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token no existe");
        
        KardexInfo memory kardex = kardexInfo[tokenId];
        address student = kardex.student;
        string memory studentId = kardex.studentId;
        
        // Clean up mappings before burning
        delete studentToToken[student];                
        delete studentIdToToken[studentId];               
        delete kardexInfo[tokenId];  

        _burn(tokenId);

        emit KardexDeleted(tokenId, student);
    }
    
    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}