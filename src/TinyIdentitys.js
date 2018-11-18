class TinyEOSIdentity {
  constructor(account, publicKey) {
    this.hash = '28012c3832f5bed4624c4ac7e9a6beebd9246de9e6ee58388ba463091b6703b2';
    this.publicKey = publicKey;
    this.name = account;
    this.accounts = [
      {
        name: account,
        authority: 'active',
        blockchain: 'eos'
      }
    ];
    this.kyc = false;
  }
}

export default class TinyIdentitys {
  static initEOS(account, publicKey) {
    TinyIdentitys.eos = new TinyEOSIdentity(account, publicKey);
  }
}

TinyIdentitys.eos = null;
TinyIdentitys.eth = null;
TinyIdentitys.trx = null;
