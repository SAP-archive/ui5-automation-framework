/*!
* SAP
* (c) Copyright 2015 SAP SE or an SAP affiliate company.
* Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * @typedef {Object} resolveMessageOptions
 * @property {Object} message - port.onMessage.addListener parameter
 * @property {Object} messageSender - port.onMessage.addListener parameter
 * @property {Object} sendResponse - port.onMessage.addListener parameter
 * @property {Object} actions - Object with all the needed actions as methods
 */

/**
 * Calls the needed message action.
 * @param {resolveMessageOptions} options
 * @private
 */
function _resolveMessage(options) {
    if (!options) {
        return;
    }

    var message = options.message;
    var messageSender = options.messageSender;
    var sendResponse = options.sendResponse;
    var actions = options.actions;
    var messageHandlerFunction = actions[message.action];

    if (messageHandlerFunction) {
        messageHandlerFunction(message, messageSender, sendResponse);
    }
}

/**
 * Convert UI5 timestamp to readable date.
 * @param {string} timeStamp  - timestamp in UI5 format ("20150427-1201")
 * @returns {string|undefined}
 * @private
 */
function _convertUI5TimeStampToHumanReadableFormat(timeStamp) {
    var formattedTime = '';

    if (!timeStamp) {
        return;
    }

    // Year
    formattedTime += timeStamp.substr(0, 4) + '/';
    // Month
    formattedTime += timeStamp.substr(4, 2) + '/';
    // Date
    formattedTime += timeStamp.substr(6, 2);

    formattedTime += ' ';

    // Hour
    formattedTime += timeStamp.substr(9, 2) + ':';
    // Minutes
    formattedTime += timeStamp.substr(11, 2) + 'h';

    return formattedTime;
}

/**
 * Set specific class for each OS.
 * @private
 */
function _setOSClassNameToBody() {
    // Set a body attribute for detecting and styling according the OS
    var osName = '';
    if (navigator.appVersion.indexOf('Win') !== -1) {
        osName = 'windows';
    }
    if (navigator.appVersion.indexOf('Mac') !== -1) {
        osName = 'mac';
    }
    if (navigator.appVersion.indexOf('Linux') !== -1) {
        osName = 'linux';
    }

    document.querySelector('body').setAttribute('os', osName);
}

module.exports = {
    formatter: {
        convertUI5TimeStampToHumanReadableFormat: _convertUI5TimeStampToHumanReadableFormat
    },
    resolveMessage: _resolveMessage,
    setOSClassName: _setOSClassNameToBody
};

},{}],2:[function(require,module,exports){
'use strict';

var utils = require('../modules/utils/utils.js');

chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    // Create a port with background page for continuous message communication
    var port = chrome.extension.connect({name: 'popup-tabId-' + tabs[0].id});

    // Name space for message handler functions.
    var messageHandler = {

        /**
         * Send object to background page.
         * @param {Object} message
         */
        'on-port-connection': function (message) {
            port.postMessage({
                action: 'do-script-injection',
                tabId: tabs[0].id,
                file: '/scripts/content/main.js'
            });
        },

        /**
         * Ask for the framework information, as soon as the main script is injected.
         * @param {Object} message
         */
        'on-main-script-injection': function (message) {
            port.postMessage({action: 'get-framework-information'});
        },

        /**
         * Visualize the framework information.
         * @param {Object} message
         */
        'on-framework-information': function (message) {
            var linksDom;
            var library = document.querySelector('library');
            var buildtime = document.querySelector('buildtime');

            if (message.frameworkInformation.OpenUI5) {
                linksDom = document.querySelector('links[openui5]');
                library.innerText = 'OpenUI5';
                buildtime.innerText = message.frameworkInformation.OpenUI5;
            } else {
                linksDom = document.querySelector('links[sapui5]');
                library.innerText = 'SAPUI5';
                buildtime.innerText = message.frameworkInformation.SAPUI5;
            }

            linksDom.removeAttribute('hidden');
        }
    };

    // Listen for messages from the background page
    port.onMessage.addListener(function (message, messageSender, sendResponse) {
        // Resolve incoming messages
        utils.resolveMessage({
            message: message,
            messageSender: messageSender,
            sendResponse: sendResponse,
            actions: messageHandler
        });
    });
});

},{"../modules/utils/utils.js":1}]},{},[2]);
