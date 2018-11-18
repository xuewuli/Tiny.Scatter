/* global window */

import TinyIdentitys from './TinyIdentitys';

const genId = () => new Date().getTime() + Math.floor(Math.random() * 1000);

export default class BrigeAPI {
  static sendAsync(payload) {
    payload.id = payload.id || genId();
    return new Promise((resolve, reject) => {
      BrigeAPI.callbacks.set(payload.id, (error, data) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      });

      switch (payload.type) {
        case 'requestSignature':
          return BrigeAPI.postMessage('signEOS', payload.id, {
            data: JSON.stringify(payload.payload.transaction)
          });
        case 'requestArbitrarySignature':
          return BrigeAPI.postMessage('signEOSMsg', payload.id, payload.payload);

        case 'getOrRequestIdentity':
        case 'identityFromPermissions':
        case 'authenticate':
          return BrigeAPI.sendResponse(payload.id, TinyIdentitys.eos);
        case 'forgetIdentity':
        case 'requestAddNetwork':
          return BrigeAPI.sendResponse(payload.id, true);
        case 'getVersion':
          return BrigeAPI.sendResponse(payload.id, '9.6.0');
        case 'getPublicKey':
          return BrigeAPI.sendResponse(payload.id, TinyIdentitys.eos.publicKey);
        case 'linkAccount':
        case 'hasAccountFor':
        case 'requestTransfer':
        case 'createTransaction':
          // all resolve to false
          return BrigeAPI.sendResponse(payload.id, false);
        default:
          return BrigeAPI.sendError(payload.id, new Error('unknow method'));
      }
    });
  }

  static sendResponse(id, result) {
    const callback = BrigeAPI.callbacks.get(id);
    if (callback) {
      callback(null, result);
      BrigeAPI.callbacks.delete(id);
    }
  }

  static sendError(id, error) {
    const callback = BrigeAPI.callbacks.get(id);
    if (callback) {
      callback(error, null);
      BrigeAPI.callbacks.delete(id);
    }
  }

  static postMessage(handler, id, data) {
    window.webkit.messageHandlers[handler].postMessage({
      name: handler,
      object: data,
      id
    });
  }
}

BrigeAPI.callbacks = new Map();
