import config from '../config/env.js';
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider(config.blockchain.rpcUrl);
const wallet = new ethers.Wallet(config.blockchain.privateKey, provider);

export default wallet;
