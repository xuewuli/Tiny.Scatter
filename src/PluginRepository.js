import * as PluginTypes from './PluginTypes';

class PluginRepositorySingleton {
  constructor() {
    this.plugins = [];
  }

  loadPlugin(plugin) {
    if (!this.plugin(plugin.name)) this.plugins.push(plugin);
  }

  signatureProviders() {
    return this.plugins.filter(
      (plugin) => plugin.type === PluginTypes.BLOCKCHAIN_SUPPORT
    );
  }

  supportedBlockchains() {
    return this.signatureProviders().map((plugin) => plugin.name);
  }

  plugin(name) {
    for (let k = 0, len = this.plugins.length; k < len; k++) {
      const plugin = this.plugins[k];
      if (plugin.name === name) {
        return plugin;
      }
    }
    return null;
  }

  async endorsedNetworks() {
    return Promise.all(
      this.signatureProviders().map(async (plugin) => plugin.getEndorsedNetwork())
    );
  }
}

const PluginRepository = new PluginRepositorySingleton();
export default PluginRepository;
