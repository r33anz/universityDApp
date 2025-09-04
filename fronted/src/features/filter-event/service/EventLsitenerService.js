import { ethers } from 'ethers';

const customABI = [
  'event RequestKardex(string codSIS, address indexed wallet, uint256 timeRequested)',
  'event CredentialIssued(string codSIS, address indexed walletAddress, uint256 issuedAt)',
];

export class EventListenerService {
  constructor() {
    this.provider = null;
    this.contract = null;
  }

  initializeProvider(rpcUrl) {
    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      return true;
    } catch (error) {
      console.error('Error initializing provider:', error);
      throw new Error('No se pudo conectar al proveedor RPC');
    }
  }

  setupContract(contractAddress) {
    if (!this.provider) throw new Error('Provider no inicializado');
    try {
      this.contract = new ethers.Contract(contractAddress, customABI, this.provider);
      return true;
    } catch (error) {
      console.error('Error setting up contract:', error);
      throw new Error('No se pudo configurar el contrato');
    }
  }

  async getContractEvents(fromBlock, toBlock = 'latest') {
    if (!this.contract) throw new Error('Contrato no configurado');
    try {
      const filters = [
        this.contract.filters.RequestKardex(),
        this.contract.filters.CredentialIssued(),
      ];
      const allEvents = [];
      for (const filter of filters) {
        const events = await this.contract.queryFilter(filter, fromBlock, toBlock);
        allEvents.push(...events);
      }
      return this.formatEvents(allEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('No se pudieron obtener los eventos');
    }
  }

  formatEvents(events) {
    return events.map(event => ({
      eventName: event.event,
      args: {
        codSIS: event.args.codSIS,
        wallet: event.args.wallet || event.args.walletAddress,
        time: event.args.timeRequested || event.args.issuedAt,
      },
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      timestamp: event.getBlock?.()?.timestamp || Math.floor(Date.now() / 1000),
      address: event.address,
      logIndex: event.logIndex,
    })).sort((a, b) => b.blockNumber - a.blockNumber); // Más reciente primero
  }

  listenToEvents(callback) {
    if (!this.contract) throw new Error('Contrato no configurado');
    const listener = async (...args) => {
      const event = args[args.length - 1];
      const formattedEvent = this.formatEvents([event])[0];
      callback(formattedEvent);
    };
    this.contract.on('RequestKardex', listener);
    this.contract.on('CredentialIssued', listener);
    return () => {
      this.contract.off('RequestKardex', listener);
      this.contract.off('CredentialIssued', listener);
    };
  }

  async getCurrentBlockNumber() {
    if (!this.provider) throw new Error('Provider no inicializado');
    return await this.provider.getBlockNumber();
  }
}