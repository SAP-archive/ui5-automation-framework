/*!
* SAP
* (c) Copyright 2015 SAP SE or an SAP affiliate company.
* Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
*/
'use strict';
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){


// Create a port with background page for continuous message communication
var port = chrome.extension.connect({name: 'devtools-initialize-tabId-' + chrome.devtools.inspectedWindow.tabId});

/**
 * Find the ID of the nearest UI5 control from the current selected element in Chrome elements panel.
 * @param {string} selectedElement - The ID of the selected element in Chrome elements panel
 * @returns {string} The ID of the nearest UI5 Control from the selectedElement
 * @private
 */
function _getNearestUI5ControlID(selectedElement) {
    var element = selectedElement;
    while (!element.getAttribute('data-sap-ui')) {
        if (element.nodeName === 'BODY') {
            return undefined;
        }
        element = element.parentNode;
    }
    return element.id;
}

chrome.devtools.panels.create('UI5', '/images/icon-128.png', '/html/panel/ui5/index.html', function (panel) {
    panel.onHidden.addListener(function () {
        port.postMessage({
            action: 'on-ui5-devtool-hide'
        });
    });
    panel.onShown.addListener(function () {
        port.postMessage({
            action: 'on-ui5-devtool-show'
        });
    });
});

chrome.devtools.panels.elements.onSelectionChanged.addListener(function () {
    // To get the selected element in Chrome elements panel, is needed to use eval and call the function with $0 parameter
    var getNearestUI5Control = _getNearestUI5ControlID.toString() + '_getNearestUI5ControlID($0);';

    /* JSHINT evil: true */
    chrome.devtools.inspectedWindow.eval(getNearestUI5Control, {useContentScriptContext: true}, function (elementId) {
        if (elementId === undefined) {
            return;
        }

        port.postMessage({
            action: 'on-select-ui5-control-from-element-tab',
            nearestUI5Control: elementId
        });
    });
    /* JSHINT evil: false */
});

},{}]},{},[1]);
