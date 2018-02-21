# UI5 Automation Framework


<img src="https://github.com/SAP/ui5-automation-framework/blob/master/images/vyper.gif" width="48">

UI5 Automation Framework is an end-to-end test framework for SAP UI5 and Open UI5 applications. It uses UI5 structure and renders simplicity and ease of use for UI5 Automation.

The UI5 Automation Framework comprises of two components-

* <img src="https://github.com/raw/SAP/ui5-automation-framework/master/images/chrome.png" width="25"> UI5 Automation Designer-chrome extension to design the automation scripts
* <img src="https://github.com/raw/SAP/ui5-automation-framework/master/images/npm.png" width="25"> UI5 Automation Runner- to run the generated scripts


How to use UI5 Automation Designer - <a href="https://youtube.com">See how</a>

How to use UI5 Automation Runner - <a href="https://youtube.com">See how</a>

----
### Requirements
It requires
* <img src="https://github.com/raw/SAP/ui5-automation-framework/master/images/nodejs.png" width="35">  [NodeJS](https://nodejs.org/)
* <img src="https://github.com/raw/SAP/ui5-automation-framework/master/images/java.png" width="35">  [Java](https://java.com/en/)
---
### Download and Installation
__Add UI5 Automation Designer:__
* Add  [UI5 Automation Designer](https://chrome.google.com/webstore/detail/ui5-inspector/) extension to chrome

__Install UI5 Automation Runner__

* Create a folder and open command prompt
    ```sh
    $ cd <path-to-created-folder>
    ```
* Use npm to install
    ```sh
    $  npm install UI5-Automation-Runner
    ```
* Run the sample UI5-Example.
    * Run the below command
    ```sh
    $ cd <path-to-created-folder>/node_modules/UI5-Automation-Runner/UI5Example
    $ node <path-to-created-folder>/node_modules/UI5-Automation-Runner/protractor/bin/protractor conf.js
    ```
    * If the browser launches and executes the sample script, Hurray!!!! the set up is succesfully complete
---
### Known Issues
---
### How to obtain support
Please ask questions in github issues

---
### License
Copyright (c) 2017 SAP SE or an SAP affiliate company. All rights reserved.
This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the
[LICENSE file](https://github.wdf.sap.corp/TechnologyTestCenter-Framework-Tools/Vyper4All/blob/master/LICENSE.txt)
