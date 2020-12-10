# UI5 Automation Framework

[![REUSE status](https://api.reuse.software/badge/github.com/SAP/ui5-automation-framework)](https://api.reuse.software/info/github.com/SAP/ui5-automation-framework)

<img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/vyper.gif" width="48">

End-to-end test framework for UI5 applications. It uses UI5 structure and renders simplicity and ease of use for UI5 Automation.

The UI5 Automation Framework comprises of two components-

* <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/chrome.png" width="25"> UI5 Automation Designer-chrome extension to design the automation scripts
* <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/npm.png" width="25"> UI5 Automation Runner- to run the automation scripts


How to use UI5 Automation Designer - <a href="https://youtu.be/wcGxnhotwWo">See how</a>

How to use UI5 Automation Runner - <a href="https://youtu.be/bTPd4AST1lM">See how</a>

----
### Requirements
It requires
* <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/nodejs.png" width="35">  [NodeJS](https://nodejs.org/)     v6.0.0 or higher
* <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/java.png" width="35">  [Java](https://java.com/en/)         version 1.7 or higher
---
### Download and Installation
__Install UI5 Automation Designer__
* Go to chrome web store in your chrome browser
* Search for UI5 Automation Designer
* Look for the extension <img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/vyper.gif" width="25"> icon in the extension list
* Click on Add to Chrome 

__Install UI5 Automation Runner__

* Create a folder and open command prompt
    ```sh
    $ cd <path-to-created-folder>
    ```
* Use npm to install
    ```sh
    $  npm install --save  https://github.com/SAP/ui5-automation-framework
    ```
    If the above approach fails then use this
    ```sh
    git clone https://github.com/SAP/ui5-automation-framework
    cd ..\ui5-automation-framework\protractor
    npm install
    node bin\webdriver-manager update 
    cd ..\ui5-automation-framework\coverage
    npm install
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
No known issues

---
### How to obtain support
Please ask questions in the project's GitHub issues area

---
### License
Copyright (c) 2017 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the
[LICENSE file](https://github.com/SAP/ui5-automation-framework/blob/master/LICENSE)
