import wallet from "../blockchainConnetion";
import abiNFT from "../abi/abiNFT";
import { ethers } from "ethers";
import envConfig from "../../../envConfig";

const contractAddressNFT = envConfig.CONTRACT_ADDRESS_NFT || "";
const ABI = abiNFT;
const contractNFT = new ethers.Contract(contractAddressNFT, ABI, wallet); 

export default contractNFT;