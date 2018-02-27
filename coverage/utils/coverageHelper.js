let getParentUrl = function(baseUrl) {
    var str = baseUrl;
    var delimiter = '/';
    var start = 3;
    var tokens = str.split(delimiter).slice(start);
    var result = tokens.join(delimiter);
    var url = str.split(result);
    return url[0];
}


let getExtendedUrl = function(baseUrl) {
    var str = baseUrl;
    var delimiter = '/';
    var start = 3;
    var tokens = str.split(delimiter).slice(start);
    var result = tokens.join(delimiter);
    return result;
}



let getOpenSSLPath = function(){

  var openSSLPath= __dirname.split('protractor\\built')[0] + '/OpenSSL/openssl';
  openSSLPath=openSSLPath.replace(/\\/g,'/');

  return openSSLPath;
}

exports.getParentUrl = getParentUrl;

exports.getExtendedUrl = getExtendedUrl;

exports.getOpenSSLPath = getOpenSSLPath;
