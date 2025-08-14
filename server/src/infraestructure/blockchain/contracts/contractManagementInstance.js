import wallet from "../blockchainConnetion.js";
import abiCredentialManagement from "../abi/abiCredentialManagement.js";
import { ethers } from "ethers";
import envConfig from "../../../envConfig.js";


const contractAddressManagement = envConfig.CONTRACT_ADDRESS_PROXY_MANAGEMENT_CREDENTIAL || "";
const ABI = abiCredentialManagement
const contractManagement = new ethers.Contract(contractAddressManagement, ABI, wallet);

export default contractManagement;