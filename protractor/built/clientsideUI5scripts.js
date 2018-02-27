var functions = {};

functions.waitForAngular = function(rootSelector, callback) {


var findMetadata = function(elemMetadata,flag) {
    var pres = false;
    var nodes = document.querySelectorAll('*');
    Array.prototype.filter.call(nodes, function(node) {
        var metadata = null;
        if (window.sap.ui.getCore().byId(node.getAttribute('id')) !== undefined) {
            metadata = window.sap.ui.getCore().byId(node.getAttribute('id')).getMetadata().getName();
            if (document.getElementsByClassName('sapUiLocalBusyIndicator sapUiLocalBusyIndicatorSizeMedium sapUiLocalBusyIndicatorFade').length>1) {
                pres = true;
            }

        }

          });
    flag=pres;
    return pres;

}


var findBusyIndicator = function(flag) {
    var pres = false;
           if (document.getElementsByClassName('sapUiLocalBusyIndicator sapUiLocalBusyIndicatorSizeMedium sapUiLocalBusyIndicatorFade').length>1) {
                pres = true;
            }
    flag=pres;
    return pres;
}



function findui5Busy(){
  var flag=false;
  flag=findBusyIndicator();
  //flag = $('div[id^="busyIndicator"]')
  if(!flag && document.readyState=='complete' ){   //&& $.active==0 && document.readyState=='complete'
    callback();
  }
  else{
   window.setTimeout(function(){findui5Busy();},3000);
  }

}

/*
function findui5Busy(){
  var flag=false;
  flag=findMetadata('sap.m.BusyIndicator');
  //flag = $('div[id^="busyIndicator"]')
  if(!flag && document.readyState=='complete' ){   //&& $.active==0 && document.readyState=='complete'
    callback();
  }
  else{
   window.setTimeout(function(){findui5Busy();},3000);
  }

}
*/


//window.setTimeout(findme(),10000);
window.setTimeout(function(){findui5Busy();},4000);
//window.setTimeout(function(){callback();},10000);






};

/* Publish all the functions as strings to pass to WebDriver's
* exec[Async]Script.  In addition, also include a script that will
* install all the functions on window (for debugging.)
*
* We also wrap any exceptions thrown by a clientSideScripts function
* that is not an instance of the Error type into an Error type.  If we
* don't do so, then the resulting stack trace is completely unhelpful
* and the exception message is just 'unknown error.'  These types of
* exceptins are the common case for dart2js code.  This wrapping gives
* us the Dart stack trace and exception message.
*/
var util = require('util');
var scriptsList = [];
var scriptFmt = (
'try { return (%s).apply(this, arguments); }\n' +
'catch(e) { throw (e instanceof Error) ? e : new Error(e); }');
for (var fnName in functions) {
  if (functions.hasOwnProperty(fnName)) {
    exports[fnName] = util.format(scriptFmt, functions[fnName]);
    scriptsList.push(util.format('%s: %s', fnName, functions[fnName]));
  }
}

exports.installInBrowser = (util.format(
  'window.clientSideScripts = {%s};', scriptsList.join(', ')));
