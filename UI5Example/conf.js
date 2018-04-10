// An example configuration file.
exports.config = {
  directConnect: true,

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
        args: ["--headless", "--disable-gpu", "--window-size=800x600"]
    }
  },
  params: {
    auth: {
	  formType:'plain'
      //username: 'blackm',
    //  password: 'welcome'
  },
  coverage: false
  },


baseUrl:'https://sapui5.hana.ondemand.com/#/controls/',

  // Framework to use. Jasmine is recommended.
  framework: 'jasmine2',

  // Spec patterns are relative to the current working directory when
  // protractor is called.
  specs: ['testScript_spec.js'],

  allScriptsTimeout: 29000,   //important for loading to complete
     getPageTimeout: 12000,
     idleTimeout :10000,

    // Options to be passed to Jasmine.
    jasmineNodeOpts: {
                     showColors: false,
      //silent: true,
                  defaultTimeoutInterval: 50000

    }
};
