import envConfig from '../../envConfig.js';
import {ethers} from 'ethers';

const provider = new ethers.JsonRpcProvider("https://data-seed-prebsc-1-s1.binance.org:8545/")
const privateKey = envConfig.PRIVATE_KEY ;
const wallet = new ethers.Wallet(privateKey, provider)

export default wallet;
