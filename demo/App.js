/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';

import { WebView } from 'react-native-webview';

import scatter from './inject/tiny_scatter.js';

const inject = `
${scatter}

function onSignEOSSuccessful(id, value) {
    BrigeAPI.sendResponse(id, JSON.parse(value))
}

function onSignEOSMessageSuccessful(id, value) {
    BrigeAPI.sendResponse(id, value)
}

function onSignEOSError(id, error) {
    BrigeAPI.sendError(id, {"type": "signature_rejected", "message": error, "code": 402, "isError": true})
}

window.tinyBrige = {
  signEOS: function (param) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type:'signEOS',
        id: param.id,
        data: param.object.data
      }))
  },
  signEOSMsg: function (param) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type:'signEOSMsg',
        id: param.id,
        data: param.object.data
      }))
  }
}

TinyIdentitys.initEOS("lixuewu11111", "EOS7wbfh16cqjgVkw3AAL6E6bahe3UFuidX5RLZ48K3quT7xppdDu");

const scatter = new TinyScatter();
scatter.loadPlugin(new TinyEOS());

window.scatter = scatter;

setTimeout(function() {document.dispatchEvent(new CustomEvent('scatterLoaded'));}, 1000);

true;
`

const App = () => {
  return (
      <SafeAreaView style={styles.webView}>
        <WebView
          ref={r => (this.webref = r)}
          style={styles.webView}
          source={{uri:'https://chain.pro/candybox'}}
          javaScriptEnabled={true}
          injectedJavaScript={inject}
          onMessage = {(event) =>{
            const data = JSON.parse(event.nativeEvent.data);
            Alert.alert(
              'Demo',
              data.data,
              [
                {text: 'Yes', onPress: () => {
                  // fake signatures, will not really successed.
                  this.webref.injectJavaScript(`onSignEOSSuccessful(${data.id}, '{"signatures":["SIG_K1_K5bDLVGDodLTQVXqXk6UcpTqGo8aZ4dwJAfJmz3hwN55CLHkhMTgb1HURbdMQyPFkpA2uoikxdWqqpnjxUtXa3xRMp5oH7"]}')`);
                }},
                {text: 'No', onPress: () => {
                  this.webref.injectJavaScript(`onSignEOSError(${data.id}, 'cancled')`);
                }, style: 'cancel'},
              ],
              { cancelable: false }
            );

          }}
        />
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  webView: {
    flex : 1
  }
});

export default App;
