# UI5 Automation Framework
<img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/vyper.gif" width="48">

End-to-end test framework for UI5 applications. It uses UI5 structure and renders simplicity and ease of use for UI5 Automation.

The UI5 Automation Framework comprises of two components-

* <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/chrome.png" width="25"> UI5 Automation Designer-chrome extension to design the automation scripts
* <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/npm.png" width="25"> UI5 Automation Runner- to run the automation scripts


How to use UI5 Automation Designer - <a href="https://youtube.com">See how</a>

How to use UI5 Automation Runner - <a href="https://youtube.com">See how</a>

----
### Requirements
It requires
* <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/nodejs.png" width="35">  [NodeJS](https://nodejs.org/)
* <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/java.png" width="35">  [Java](https://java.com/en/)
---
### Download and Installation
__Install UI5 Automation Designer__
* Go to [chrome://extensions/](chrome://extensions/) in your chrome browser.
* Ensure that the __Developer mode__ checkbox on the top right corner is checked. 
* Drag and drop the folder from *{path-to-created-folder}/node_modules/ui5-automation-framework/Chrome Extension/UI5-Automation-Designer* to the [chrome://extension](chrome://extensions/) page.
* Look for the <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/vyper.gif" width="25">  on the right corner of the browser to ensure the chrome extension is added successfully.

__Install UI5 Automation Runner__

* Create a folder and open command prompt
    ```sh
    $ cd <path-to-created-folder>
    ```
* Use npm to install
    ```sh
    $  npm install --save  https://github.com/SAP/ui5-automation-framework
    ```
* Run the sample UI5-Example.
    * Run the below command
    ```sh
    $ cd <path-to-created-folder>/node_modules/ui5-automation-framework/UI5Example
    $ node <path-to-created-folder>/node_modules/ui5-automation-framework/protractor/bin/protractor conf.js
    ```
    * If the browser launches and executes the sample script, Hurray!!!! the set up is succesfully complete.
---

### Known Issues
---
### How to obtain support
Please ask questions in github issues

---
### License
Copyright (c) 2017 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the
[LICENSE file](https://github.com/SAP/ui5-automation-framework/blob/master/LICENSE)
