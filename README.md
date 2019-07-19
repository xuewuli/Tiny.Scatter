# Tiny.Scatter
Scatter compatible eos injection library

## Demo
a simple `react-native` demo in `./demo` dir.

(only test on iOS, should work on Android too.)
![demo screenshot](/doc/demo.jpg)

## inject to iOS WKWebView
```swift
extension WKWebViewConfiguration {
    static func makeScatterEOSSupport(account: String, publicKey: String, in messageHandler: WKScriptMessageHandler, with config: WKWebViewConfiguration) -> Void {
        var js = ""
        
        if let filepath = Bundle.main.path(forResource: "tiny_scatter", ofType: "js") {
            do {
                js += try String(contentsOfFile: filepath)
            } catch { }
        }
        
        js +=
        """
        // 'value' as string. "SIG_K1_..."
        function onSignEOSMessageSuccessful(id, value) {
            BrigeAPI.sendResponse(id, value)
        }

        // 'value' as string. '{"signatures":["SIG_K1_..."]}'
        function onSignEOSSuccessful(id, value) {
            BrigeAPI.sendResponse(id, JSON.parse(value))
        }
        
        // 'error' as string
        function onSignEOSError(id, error) {
            BrigeAPI.sendError(id, {"type": "signature_rejected", "message": error, "code": 402, "isError": true})
        }

        window.tinyBrige = {
            signEOS: function (param) {
                window.webkit.messageHandlers['signEOS'].postMessage(param)
            },
            signEOSMsg: function (param) {
                window.webkit.messageHandlers['signEOSMsg'].postMessage(param)
            }
        }

        TinyIdentitys.initEOS("\(account)", "\(publicKey)");
        
        const scatter = new TinyScatter();
        scatter.loadPlugin(new TinyEOS());
        
        window.scatter = scatter;
        
        document.dispatchEvent(new CustomEvent('scatterLoaded'));

        """
        let onLoadScript = WKUserScript(source: "document.dispatchEvent(new CustomEvent('scatterLoaded'))", injectionTime: .atDocumentEnd, forMainFrameOnly: false)
        config.userContentController.addUserScript(onLoadScript)
        let userScript = WKUserScript(source: js, injectionTime: .atDocumentStart, forMainFrameOnly: false)
        config.userContentController.add(messageHandler, name: XMethod.signEOS.rawValue)
        config.userContentController.addUserScript(userScript)
    }
}
```
## Additional init.js for Android. you need thirdpart lib such as https://github.com/TrustWallet/Web3View  (or roll you own) to accomplish the injection.
```javascript

// callback when you finish the sign. use webView.evaluateJavascript 

// 'id' as number. it's the param.id when XWebView.signEOS called
// 'value' as string. '{"signatures":["SIG_K1_..."]}'
function onSignEOSSuccessful(id, value) {
    BrigeAPI.sendResponse(id, JSON.parse(value))
}

// value as string "SIG_K1_..."
function onSignEOSMessageSuccessful(id, value) {
    BrigeAPI.sendResponse(id, value)
}

function onSignEOSError(id, error) {
    BrigeAPI.sendError(id, {"type": "signature_rejected", "message": error, "code": 402, "isError": true})
}

window.tinyBrige = {
  signEOS: function (param) {
    //XWebView is export from java @JavascriptInterface, is based on your implement.
    XWebView.signEOS(param.id, param.object.data);
  },
  signEOSMsg: function (param) {
    XWebView.signEOSMsg(param.id, param.object.data);
  }
}

TinyIdentitys.initEOS("%1$s", "%2$s");

const scatter = new TinyScatter();
scatter.loadPlugin(new TinyEOS());

window.scatter = scatter;

setTimeout(function() {document.dispatchEvent(new CustomEvent('scatterLoaded'));}, 1000);
```
