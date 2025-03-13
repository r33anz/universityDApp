//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract StoringPasswords{

    mapping (string => string) private studentsPassword; // SISCode -> passowrd
    
    constructor() {

    }

    function storeStudentPassword(
        string calldata sisCode,
        string calldata studentPassword
    ) external {

        studentsPassword[sisCode] = studentPassword;
    }

    function getStudentPassword(string calldata sisCode) external view returns(string memory){
        return studentsPassword[sisCode];
    }

}