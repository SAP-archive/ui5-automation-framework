
var webdriver = require('selenium-webdriver');

/**
 * Handle page authentication
 * @constructor
 * @param {Config} config
 * @param {Object} instanceConfig
 * @param {Logger} logger
 */
function FormAuthenticator(authconfig,instanceConf){
  

  var user = authconfig.username;
  var pass = authconfig.password;
  var userFieldSelector = instanceConf.userFieldSelector;
  var passFieldSelector = instanceConf.passFieldSelector;
  var logonButtonSelector = instanceConf.logonButtonSelector;
  
  //console.log("browser base url"+browser.baseUrl);
    url=browser.baseUrl;
	//.replace("?sap-ui-debug=true","");      
  browser.driver.get(url);
  browser.sleep(3000);
  
    //browser.driver.wait(function(){
    //return browser.driver.isElementPresent(by.css(userFieldSelector));
  //},3000);
  
    // enter user and pass in the respective fields
    //attempt to login only if on login screen
    //Added by PSilpa on 11/1/2019
    element(by.css(userFieldSelector)).isPresent().then(function(present){
      if(present){
      browser.driver.findElement(by.css(userFieldSelector)).sendKeys(user);
      browser.driver.findElement(by.css(passFieldSelector)).sendKeys(pass);
      return browser.driver.findElement(by.css(logonButtonSelector)).click();
       }
    });
  
  
  
}

/**
 * Get the page and authenticates with provided credentials
 * @param {string} url - url to get
 * @returns {promise<>} - resolved when the page is full loaded
 */
FormAuthenticator.prototype.get = function(url){
  var that = this;

  if (!this.user || !this.pass) {
    return webdriver.promise.rejected(
      new Error('Form auth requested but user or pass is not specified'));
  }

  // webdriver statements are synchronized by webdriver flow so no need to join the promises

  // open the page
  url=url.replace("?sap-ui-debug=true","");      
  browser.driver.get(url);

  // wait till page is fully rendered
  browser.driver.wait(function(){
    return browser.driver.isElementPresent(by.css(that.userFieldSelector));
  },3000);

  // enter user and pass in the respective fields
  browser.driver.findElement(by.css(this.userFieldSelector)).sendKeys(this.user);
  browser.driver.findElement(by.css(this.passFieldSelector)).sendKeys(this.pass);
  return browser.driver.findElement(by.css(this.logonButtonSelector)).click();
};

module.exports = function(authconfig,instanceConf){
  return new FormAuthenticator(authconfig,instanceConf);
};
