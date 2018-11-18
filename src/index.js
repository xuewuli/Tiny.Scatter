/* global window */

import 'babel-polyfill';

import PluginRepository from './PluginRepository';
import BrigeAPI from './BrigeAPI';
import TinyEOS from './TinyEOS';
import TinyError from './TinyError';
import TinyIdentitys from './TinyIdentitys';

const checkForExtension = (resolve, tries = 0) => {
  if (tries > 20) {
    return;
  }
  if (window.scatter.isExtension) {
    resolve(true);
    return;
  }
  setTimeout(() => checkForExtension(resolve, tries + 1), 100);
};

export default class TinyScatter {
  constructor() {
    this.callbacks = new Map();
    this.isExtension = true;
    this.identity = null;
  }

  loadPlugin(plugin) {
    const noIdFunc = () => {
      if (!this.identity) throw new Error('No Identity');
    };

    if (!plugin.isValid()) {
      throw new Error(`${plugin.name} doesn't seem to be a valid ScatterJS plugin.`);
    }

    PluginRepository.loadPlugin(plugin);

    if (plugin.isSignatureProvider()) {
      this[plugin.name] = plugin.signatureProvider(noIdFunc, () => this.identity);
      this[`${plugin.name}Hook`] = plugin.hookProvider;
    }
  }

  async isInstalled() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, 10000);

      checkForExtension(resolve);
    });
  }

  async connect(pluginName, options) {
    return new Promise((resolve) => {
      if (!pluginName || !pluginName.length) {
        throw new Error('You must specify a name for this connection');
      }

      options = Object.assign({ initTimeout: 10000, linkTimeout: 30000 }, options);

      setTimeout(() => {
        resolve(false);
      }, options.initTimeout);

      checkForExtension(resolve);
    });
  }

  disconnect() {
    return true;
  }

  isConnected() {
    return true;
  }

  isPaired() {
    return true;
  }

  getVersion() {
    return BrigeAPI.sendAsync({
      type: 'getVersion',
      payload: {}
    });
  }

  getIdentity(requiredFields) {
    return BrigeAPI.sendAsync({
      type: 'getOrRequestIdentity',
      payload: {
        fields: requiredFields
      }
    }).then((id) => {
      if (id) this.identity = id;
      return id;
    });
  }

  getIdentityFromPermissions() {
    return BrigeAPI.sendAsync({
      type: 'identityFromPermissions',
      payload: {}
    }).then((id) => {
      if (id) this.identity = id;
      return id;
    });
  }

  forgetIdentity() {
    return BrigeAPI.sendAsync({
      type: 'forgetIdentity',
      payload: {}
    }).then((res) => {
      this.identity = null;
      return res;
    });
  }

  authenticate(nonce) {
    return BrigeAPI.sendAsync({
      type: 'authenticate',
      payload: { nonce }
    });
  }

  getArbitrarySignature(publicKey, data, whatfor = '', isHash = false) {
    return BrigeAPI.sendAsync({
      type: 'requestArbitrarySignature',
      payload: {
        publicKey,
        data,
        whatfor,
        isHash
      }
    });
  }

  getPublicKey(blockchain) {
    return BrigeAPI.sendAsync({
      type: 'getPublicKey',
      payload: { blockchain }
    });
  }

  linkAccount(publicKey, network) {
    return BrigeAPI.sendAsync({
      type: 'linkAccount',
      payload: { publicKey, network }
    });
  }

  hasAccountFor(network) {
    return BrigeAPI.sendAsync({
      type: 'hasAccountFor',
      payload: {
        network
      }
    });
  }

  suggestNetwork(network) {
    return BrigeAPI.sendAsync({
      type: 'requestAddNetwork',
      payload: {
        network
      }
    });
  }

  requestTransfer(network, to, amount, options = {}) {
    const payload = { network, to, amount, options };
    return BrigeAPI.sendAsync({
      type: 'requestTransfer',
      payload
    });
  }

  requestSignature(payload) {
    return BrigeAPI.sendAsync({
      type: 'requestSignature',
      payload
    });
  }

  createTransaction(blockchain, actions, account, network) {
    return BrigeAPI.sendAsync({
      type: 'createTransaction',
      payload: {
        blockchain,
        actions,
        account,
        network
      }
    });
  }
}

window.TinyScatter = TinyScatter;
window.TinyEOS = TinyEOS;
window.BrigeAPI = BrigeAPI;
window.TinyIdentitys = TinyIdentitys;
window.EOSSignatureError = new TinyError(
  'identity_rejected',
  'User rejected the provision of an Identity'
);
