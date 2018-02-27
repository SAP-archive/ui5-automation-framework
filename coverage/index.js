

var https = require('https')
var pem = require('pem')

var express = require('express')
var proxy = require('express-http-proxy')

var istanbul = require('istanbul')
var instrumenter = new istanbul.Instrumenter()

var sslPath = require('./utils/coverageHelper.js');



pem.config({
    pathOpenSSL: sslPath.getOpenSSLPath()
})

pem.createCertificate({
    days: 1,
    selfSigned: true
}, function(err, keys) {
    if (err) {
        throw err
    }
    var app = express()

    //var target = 'https://ldciur3.wdf.sap.corp:44355'; //process.argv.slice(2);
    var target = process.argv.slice(2);
	var csvData=process.argv.slice(3);
	
	csvData=csvData[0].substr(1);
	csvData=csvData.substr(0, csvData.length-1)
	csvData=csvData.split(",");
    console.log(keys.serviceKey);
    console.log(keys.certificate);


    https.createServer({
        key: keys.serviceKey,
        cert: keys.certificate
    }, app).listen(443)

    app.all('*', proxy(target, {
        userResDecorator: function(proxyRes, proxyResData, userReq, userRes) {
            //console.log('userReq.originalUrl', userReq.originalUrl);
			for(var i=0;i<csvData.length;i++){
				  if (userReq.originalUrl.endsWith('.js') && userReq.originalUrl.includes(csvData[i]) ) {
                console.log('       userReq.originalUrl instrument'+userReq.originalUrl);
                return instrumenter.instrumentSync(proxyResData.toString('utf8'), userReq.originalUrl);
            }	
			}
            return proxyResData; //check if  this return is required
        },
        proxyReqOptDecorator: function(proxyReqOpts, originalReq) {
            proxyReqOpts.rejectUnauthorized = false;
            return proxyReqOpts;
        }


    }));


})
