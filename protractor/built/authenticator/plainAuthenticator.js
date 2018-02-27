
/**
 * Handle no Url authentication
 * @constructor
 * @param {Config} config
 * @param {Object} instanceConfig
 * @param {Logger} logger
 */
function PlainAuthenticator(config,instanceConfig) {
  //this.config = config;
  //this.instanceConfig = instanceConfig;
  //this.logger = logger;
  
      url=browser.baseUrl.replace("?sap-ui-debug=true",""); 
	browser.driver.get(url);
	browser.sleep(2000);
	return true;
  
  
}

/**
 * Get the page without authentication
 * @param {string} url - url to get
 * @returns {webdriver.promise<undefined|Error>} - resolved when the page is full loaded
 */
PlainAuthenticator.prototype.get = function(url){
  // get the url
    url=url.replace("?sap-ui-debug=true",""); 
	browser.driver.get(url);
	browser.sleep(2000);
	return true;
};

module.exports = function(config,instanceConfig){
  return new PlainAuthenticator(config,instanceConfig);
};
