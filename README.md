# Tiny.Scatter
Scatter javascript warpper for webview

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
        // value as string "SIG_K1_..."
        function onSignEOSMessageSuccessful(id, value) {
            BrigeAPI.sendResponse(id, value)
        }

        // value as string with this format '{"signatures":["SIG_K1_..."]}'
        function onSignEOSSuccessful(id, value) {
            BrigeAPI.sendResponse(id, JSON.parse(value))
        }
        
        // error as string
        function onSignEOSError(id, error) {
            BrigeAPI.sendError(id, {"type": "signature_rejected", "message": error, "code": 402, "isError": true})
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
## Additional Android injection init.js, your need thirdpart lib (or roll you own) to accomplish the injection.
```javascript

/**
/* use webView.evaluateJavascript to call when your finish the sign
/* @param id as number , you got it when XWebView.signEOS called
/* @param value as string, with this format '{"signatures":["SIG_K1_..."]}'
**/
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

const messageHandlers = {
    signEOS: {
        postMessage: function (param) {
            //XWebView is your @JavascriptInterface
            XWebView.signEOS(param.id, param.object.data);
        }
    },
    signEOSMsg: {
        postMessage: function (param) {
            XWebView.signEOSMsg(param.id, param.object.data);
        }
    }
}

window.webkit = { messageHandlers };

TinyIdentitys.initEOS("%1$s", "%2$s");

const scatter = new TinyScatter();
scatter.loadPlugin(new TinyEOS());

window.scatter = scatter;

setTimeout(function() {document.dispatchEvent(new CustomEvent('scatterLoaded'));}, 1000};
```
