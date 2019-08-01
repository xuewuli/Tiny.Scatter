class TinyIdentity {
  constructor(name) {
    this.hash = '28012c3832f5bed4624c4ac7e9a6beebd9246de9e6ee58388ba463091b6703b2';
    this.name = name;
    this.accounts = [];
    this.kyc = false;
  }

  addAccount(address, publicKey, blockchain) {
    this.accounts.push({
      authority: 'active',
      address,
      blockchain,
      name: address,
      publicKey
    });
  }
}

const currentIdentity = new TinyIdentity('tiny');

const TinyIdentitys = {
  getIdentity() {
    return currentIdentity;
  },

  getAccounts(blockchain) {
    return currentIdentity.accounts.find((account) => account.blockchain === blockchain);
  },

  changeName(name) {
    currentIdentity.name = name;
  },

  initEOS(account, publicKey) {
    currentIdentity.addAccount(account, publicKey, 'eos');
  },

  initTRX(address, publicKey) {
    currentIdentity.addAccount(address, publicKey, 'trx');
  },

  initETH(address, publicKey) {
    currentIdentity.addAccount(address, publicKey, 'eth');
  }
};

export default TinyIdentitys;
