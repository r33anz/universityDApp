import wallet from "../blockchainConnetion.js";
import abiCredentialManagement from "../abi/abiCredentialManagement.js";
import { ethers } from "ethers";
import envConfig from "../../../envConfig.js";


const contractAddress = envConfig.CONTRACT_ADDRESS_STUDENT_MANAGEMENT_CREDENTIALS || "";
const ABI = abiCredentialManagement
const contract = new ethers.Contract(contractAddress, ABI, wallet);

export default contract;