/*!
 * SAP
 * (c) Copyright 2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;
                if (!u && a) return a(o, !0);
                if (i) return i(o, !0);
                var f = new Error("Cannot find module '" + o + "'");
                throw f.code = "MODULE_NOT_FOUND", f
            }
            var l = n[o] = {
                exports: {}
            };
            t[o][0].call(l.exports, function(e) {
                var n = t[o][1][e];
                return s(n ? n : e)
            }, l, l.exports, e, t, n, r)
        }
        return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
})({
    1: [function(require, module, exports) {
        (function() {
            'use strict';

            /**
             * Create an object witch the initial needed information from the UI5 availability check.
             * @returns {Object}
             */
            function createResponseToContentScript() {
                var responseToContentScript = Object.create(null);
                var responseToContentScriptBody;
                var frameworkInfo;
                var versionInfo;


                responseToContentScript.detail = Object.create(null);
                responseToContentScriptBody = responseToContentScript.detail;

                if (window.sap && window.sap.ui) {
                    responseToContentScriptBody.action = 'on-ui5-detected';
                    responseToContentScriptBody.framework = Object.create(null);

                    // Get framework version
                    try {
                        responseToContentScriptBody.framework.version = sap.ui.getVersionInfo().version;
                    } catch (e) {
                        responseToContentScriptBody.framework.version = '';
                    }

                    // Get framework name
                    try {
                        versionInfo = sap.ui.getVersionInfo();

                        // Use group artifact version for maven builds or name for other builds (like SAPUI5-on-ABAP)
                        frameworkInfo = versionInfo.gav ? versionInfo.gav : versionInfo.name;

                        responseToContentScriptBody.framework.name = frameworkInfo.indexOf('openui5') !== -1 ? 'OpenUI5' : 'SAPUI5';
                    } catch (e) {
                        responseToContentScriptBody.framework.name = 'UI5';
                    }

                    // Check if the version is supported
                    responseToContentScriptBody.isVersionSupported = !!sap.ui.require;

                } else {
                    responseToContentScriptBody.action = 'on-ui5-not-detected';
                }

                return responseToContentScript;
            }

            //POT- Customisation




            var blobdata = {};
            blobdata.content = 'describe ( ' + '"script"' + ', function () {' + '\n\n';
            var xhr = new XMLHttpRequest();

            var path = "'path':"

            var mode = "'mode':"
            var mode_val = "100644"

            var type = "'type':"
            var type_val = "blob"

            var sha = "'sha':"
            var returnsha = "";
            var sha1 = "";
            var returndata = "";
            var blobsha1 = "";
            var filename = "";
            var datastring = "";
            var copy = false;
            var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];




            var count = 1;
            /** Customization - PoT
                Upload the script to github
             */


            window.addEventListener("copyControl", function(evt) {

                copy = true;

            });

            window.addEventListener("contextMenu-control-right-select", function(evt) {


                window.postMessage({
                    data: {
                        action: 'previewWindowOpen',
                        content: blobdata.content
                    }
                }, '*');
                blobdata.content = 'describe ( ' + '"script"' + ', function () {' + '\n\n';
                count = 1;
                copy = false;


            });




            window.addEventListener("on-contextMenu-After_Enter_Value", function(evt) {
                var elemProperties = capture_UI5_elementProperties(evt.detail.nodeId, evt.detail.actionType, evt.detail.valueRequired, evt.detail.finalValue, evt.detail.compareValue, evt.detail.attribute);
                copyToClipboard(elemProperties.elementProp);
                if (copy) {
                    if (evt.detail.actionType == 'Object') {
                        blobdata.content += " ";
                    } else {
                        blobdata.content += 'it(' + '"step' + (count++) + ':' + elemProperties.stepmsg + '", function () {\n' + elemProperties.elementProp + '});\n\n';
                    }

                }




            }, false);

            //pot customization for value extraction
            window.addEventListener("on-contextMenu-control-right-select-forvalue", function(evt) {
                var id = evt.detail.nodeId;

                var properties = sap.ui.getCore().byId(id).mProperties;
                var name = {};
                for (var val in properties) {

                    name[val] = properties[val];
                }
                var action = evt.detail.actionType;
                var valueRequired = false;
                var defaultValue = '';

                try {
                    defaultValue = sap.ui.getCore().byId(id).getValue();
                    if (defaultValue) {

                        valueRequired = true;

                    } else {
                        if (sap.ui.getCore().byId(id).getMetadata().getName() == "sap.me.Calendar") {
                            var date = new Date();
                            valueRequired = true;
                            defaultValue = "'" + day[date.getDay()] + '-' + months[date.getMonth()] + '-' + date.getDate() + '-' + date.getFullYear() + "'";
                        } else {
                            valueRequired = true;
                            defaultValue = null;
                        }
                    }

                } catch (err) {
                    if (sap.ui.getCore().byId(id).getMetadata().getName() == "sap.me.Calendar") {
                        valueRequired = true;
                        var date = new Date();
                        defaultValue = "'" + day[date.getDay()] + '-' + months[date.getMonth()] + '-' + date.getDate() + '-' + date.getFullYear() + "'";

                    } else if (sap.ui.getCore().byId(id).getMetadata().getName() == "sap.m.List") {
                        valueRequired = true;
                        defaultValue = null;
                    } else if (sap.ui.getCore().byId(id).getMetadata().getName() == "sap.m.Select") {
                        valueRequired = true;
                        defaultValue = null;
                    } else if (sap.ui.getCore().byId(id).getMetadata().getName() == "sap.m.SelectList") {
                        valueRequired = true;
                        defaultValue = null;
                    } else {
                        valueRequired = false;
                    }
                }

                window.postMessage({
                    data: {
                        action: 'valueRequired',
                        content: {
                            nodeId: id,
                            nodeProperties: name,
                            action: action,
                            value: defaultValue,
                            valueRequired: valueRequired
                        }
                    }
                }, '*');




            }, false);




            /** Customization - PoTcancel
            Listens to the event from content script- when context menu is right click  - this event has access to the SAP Object
            */

            //End of - Customization - PoT


            /** Customization - PoT
            Function to copy text to the clipboard
            */
            function copyToClipboard(text) {

                var copyFrom = jQuery('<textarea/>');
                copyFrom.text(text);
                jQuery('body').append(copyFrom);
                copyFrom.select();
                document.execCommand('copy', true);
                copyFrom.remove();
            }
            //End of - Customization - PoT



            /**
             * POT - Customisation
             * Function to filter the properties
             * @param {String} prop	
             * @return {String} newProp
             */
            function filterProperties(prop) {
                var arr = ['height', 'width', 'selectedItemId', 'selectedKey', 'timestamp', 'value', 'groupName'];


                for (var j = 0; j < arr.length; j++) {
                    jQuery.each(prop, function(v, i) {
                        try {
                            if (arr[j] == v) {
                                delete prop[v];
                            }
                        } catch (err) {
                            console.log(err);
                        }
                    })
                }

                //delete the properties which are of type number
                jQuery.each(prop, function(v, i) {
                    try {

                        if (!isNaN(prop[v])) {
                            delete prop[v];
                        }
                    } catch (err) {
                        console.log(err);
                    }

                    if (i == '[object Object]' || typeof(i) == 'object') {
                        delete prop[v];

                    }


                })

                var newProp = {};
                newProp = prop;
                return newProp;

            }



            /**
             * POT - Customisation
             * Function to get the properties of element and its parent/previous sibling/next sibling/first child.
             * @param {String} id
             * @param {String} type 
             * @return {String} ele
             */

            function capture_UI5_elementProperties(id, type, valueRequired, finalValue, compareValue, attribute) {
                var act = id;
                var parentElement = document || window;
                var nodes = parentElement.querySelectorAll('*');
                var metadata;
                var mProperties;
                var countMetadata;
                var countMProp;
                var elemCount = 0;
                var bool;
                var trueFlag = false;
                var trueNodeid = null;
                var currMetadata = "";
                var ele = "";
                var currBool = false;
                var currMprop = null;

                countMetadata = null;
                elemCount = 0;
                var flag = 0;
                var obj = {};
                var element = {};
                var value = null;
                var elemString;
                var elemAction = "";
                var elemMetadata;

                var prop = sap.ui.getCore().byId(id).mProperties;
                prop = filterProperties(prop);



                element["elementProperties"] = {
                    "metadata": sap.ui.getCore().byId(id).getMetadata().getName(),
                    "mProperties": prop
                };
                var eventsSupported = sap.ui.getCore().byId(id).getMetadata()._mEvents;
                if (Object.keys(eventsSupported).length == 0) {
                    eventsSupported = sap.ui.getCore().byId(id).mEventRegistry;
                    if (Object.keys(eventsSupported).length == 0) {
                        eventsSupported = sap.ui.getCore().byId(id).getMetadata()._mAllEvents;
                    }
                }


                if (window.sap.ui.getCore().byId(id) !== undefined) {

                    //Parent Properties
                    var parMetadata;
                    var parProp;

                    var str = "id=" + "'" + id + "'"
                    var par = jQuery('[' + str + ']').parent();
                    var parid = par.attr('id');

                    var count = 0;
                    var flag = false;
                    var parMProp;
                    while (1) {

                        if (par.length == 0) {
                            flag = true;
                            break;
                        } else {
                            if (parid !== undefined) {

                                if (sap.ui.getCore().byId(parid) !== undefined) {
                                    parMetadata = sap.ui.getCore().byId(parid).getMetadata().getName();

                                    parMProp = sap.ui.getCore().byId(parid).mProperties;

                                    break;

                                } else {

                                    par = jQuery(par).parent();
                                    parid = par.attr('id');
                                }
                            } else {

                                par = jQuery(par).parent();
                                parid = par.attr('id');

                            }
                        }

                    }
                    // Properties will be null if the element has no parent
                    if (flag) {
                        element["parentProp"] = {};
                        element["prevSiblingProp"] = {};
                        element["nextSiblingProp"] = {};

                        element["childProp"] = {};


                        elemString =
                            'var ui5ControlProperties =  {' + "\n" + '\t\t\t\t\t\t\t' +
                            '"elementProperties":' + JSON.stringify(element["elementProperties"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"parentProperties":' + JSON.stringify(element["parentProp"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"prevSiblingProperties":' + JSON.stringify(element["prevSiblingProp"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"nextSiblingProperties":' + JSON.stringify(element["nextSiblingProp"]) + ',' + '\n\t\t\t\t\t\t\t' +
                            '"childProperties":' + JSON.stringify(element["childProp"]) + '\n\t\t\t\t\t\t\t' +
                            '};' + '\n\n';
                    } else {
                        var parentprop = filterProperties(parMProp);
                        element["parentProp"] = {
                            "metadata": parMetadata,
                            "mProperties": parentprop
                        };




                        //Child Properties
                        var metadata, childProp;
                        var nodes = document.getElementById(id).querySelectorAll('*');
                        if (nodes.length == 0) {
                            element["childProp"] = {};
                        } else {
                            jQuery.each(nodes, function(v, i) {
                                if (sap.ui.getCore().byId(i.id) !== undefined) {

                                    childProp = sap.ui.getCore().byId(i.id).mProperties;
                                    childProp = filterProperties(childProp);
                                    element["childProp"] = {
                                        "metadata": sap.ui.getCore().byId(i.id).getMetadata().getName(),
                                        "mProperties": childProp
                                    };
                                    return false;
                                } else {
                                    element["childProp"] = {};
                                }
                            })
                        }

                        var parNodes = document.getElementById(parid).querySelectorAll('*');
                        var ind = 0;
                        //load metadata elements into an array
                        var parMetaNodeElems = new Array();
                        var parMetaNodes = new Array();
                        Array.prototype.filter.call(parNodes, function(parNode) {
                            if (window.sap.ui.getCore().byId(parNode.getAttribute('id')) !== undefined) {
                                var childMetadata = window.sap.ui.getCore().byId(parNode.getAttribute('id')).getMetadata().getName();
                                var childMProperties = window.sap.ui.getCore().byId(parNode.getAttribute('id')).mProperties;
                                parMetaNodeElems[ind] = parNode;
                                parMetaNodes[ind] = {

                                    "metadata": childMetadata,
                                    "mProperties": childMProperties
                                };
                                ind++;
                            }
                        });
                        //find the pos of the element in the array
                        var pos = 0;
                        var count = 0;
                        var prevSibBool;
                        var nextSibBool;
                        var prevSibElem;
                        var nextSibElem;
                        var sibBool = false;
                        var k = 0;
                        jQuery.each(parMetaNodeElems, function(i, v) {
                            if (id == v.id) {
                                sibBool = true;

                                //Previous Sibling Properties
                                if (parMetaNodes[i - 1] != undefined) {
                                    var j = i - 1;
                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'"
                                    var prevelemid = jQuery('[' + str + ']').parent();


                                    var prevelempar = prevelemid.attr('id');
                                    while (j <= (parMetaNodeElems.length - 1)) {

                                        if (prevelempar != undefined) {
                                            if (sap.ui.getCore().byId(prevelempar) !== undefined) {
                                                if (parid == prevelempar) {

                                                    prevSibElem = parMetaNodes[j];
                                                    break;
                                                } else {
                                                    j = j - 1;

                                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'"
                                                    prevelemid = jQuery('[' + str + ']').parent();


                                                    prevelempar = prevelemid.attr('id');

                                                }
                                            } else {

                                                prevelemid = (prevelemid).parent();
                                                prevelempar = prevelemid.attr('id');
                                            }


                                        } else {

                                            prevelemid = prevelemid.parent();
                                            prevelempar = prevelemid.attr('id');

                                        }
                                    }

                                } else {
                                    prevSibElem = {};
                                }


                                //Next Sibling Properties

                                if (parMetaNodes[i + 1] != undefined) {
                                    var j = i + 1;
                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'"
                                    var nextelemid = jQuery('[' + str + ']').parent();


                                    var nextelempar = nextelemid.attr('id');
                                    while (j <= (parMetaNodeElems.length - 1)) {

                                        if (nextelempar != undefined) {

                                            if (sap.ui.getCore().byId(nextelempar) !== undefined) {
                                                if (parid == nextelempar) {

                                                    nextSibElem = parMetaNodes[j];
                                                    break;
                                                } else {
                                                    j = j + 1;
                                                    if (j > (parMetaNodeElems.length - 1)) {
                                                        nextSibElem = {};
                                                        break;
                                                    }

                                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'"
                                                    nextelemid = jQuery('[' + str + ']').parent();

                                                    nextelempar = nextelemid.attr('id');

                                                }
                                            } else {

                                                nextelemid = (nextelemid).parent();
                                                nextelempar = nextelemid.attr('id');
                                            }
                                        } else {

                                            nextelemid = nextelemid.parent();
                                            nextelempar = nextelemid.attr('id');
                                        }
                                    }
                                } else {
                                    nextSibElem = {};
                                }


                            }



                        });
                        if (!sibBool) {
                            prevSibElem = {};
                            nextSibElem = {};

                        } else {
                            if (prevSibElem.mProperties != undefined) {
                                prevSibElem.mProperties = filterProperties(prevSibElem.mProperties);
                            }

                            if (nextSibElem.mProperties != undefined) {
                                nextSibElem.mProperties = filterProperties(nextSibElem.mProperties);
                            }


                        }
                        element["prevSiblingProp"] = prevSibElem;
                        element["nextSiblingProp"] = nextSibElem;
                    }

                    var eventsString = "";

                    jQuery.each(eventsSupported, function(i, v) {
                        eventsString += i + ',';
                    });
                    var lastline = "";
                    eventsString = eventsString.substr(0, eventsString.length - 1);
                    eventsString = "'" + eventsString + "'";

                    //convert object into JSON
                    elemString =
                        'var ui5ControlProperties =  {' + "\n" + '\t\t\t\t\t\t\t' +
                        '"elementProperties":' + JSON.stringify(element["elementProperties"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                        '"parentProperties":' + JSON.stringify(element["parentProp"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                        '"prevSiblingProperties":' + JSON.stringify(element["prevSiblingProp"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                        '"nextSiblingProperties":' + JSON.stringify(element["nextSiblingProp"]) + ',' + '\n\t\t\t\t\t\t\t' +
                        '"childProperties":' + JSON.stringify(element["childProp"]) + '\n\t\t\t\t\t\t\t' +
                        '};' + '\n' +

                        "var Index=0;" + '\n';

                    if (finalValue == "null" || finalValue == "") {


                        lastline = 'element(by.ui5Action(ui5ControlProperties,UI5Action, Index)).perform();' + '\n';


                    } else {
                        elemString += 'var value=' + "'" + finalValue + "'" + ';' + '  //value to be entered by user' + '\n';

                        lastline = 'element(by.ui5Action(ui5ControlProperties,UI5Action,Index,value)).perform();' + '\n';

                    }


                    var stepMessage = '';
                    // Properties based on the selection type 
                    if (type == "Action") {

                        ele += '//*********************Block for ' + sap.ui.getCore().byId(id).getMetadata().getName() + ' - Perform Action*****************************************************************' + '\n';

                        elemString += 'var UI5Action=' + eventsString + ';\n' + lastline + '//!!*******************************************************************************************************' + '\n\n';
                        elemAction = eventsString.split(',')[0];
                        stepMessage = elemAction + " on " + sap.ui.getCore().byId(id).getMetadata().getName();
                    }
                    if (type == "Assert") {
                        ele += '//*********************Block for ' + sap.ui.getCore().byId(id).getMetadata().getName() + ' - Perform Assert*****************************************************************' + '\n';


                        elemString += 'var attribute = "' + attribute + '";                //eg: title, text, value etc.' + '\n';

                        elemString += 'var compareValue ="' + compareValue + '";             //expected value' + '\n';


                        elemString += "expect(element(by.ui5(ui5ControlProperties)).getUI5Attribute(attribute)).toBe(compareValue);" + '\n';




                        elemString += '//!!*******************************************************************************************************' + '\n\n';
                        elemAction = elemString.split(',')[0];
                        stepMessage = 'assertion' + " on " + sap.ui.getCore().byId(id).getMetadata().getName();
                    }
                    if (type == "Object") {

                        return "";
                    }

                    if (type == "Value") {

                        var sendKeysText;
                        var sendKeysVar;
                        sendKeysVar = 'element(by.ui5(ui5ControlProperties)).sendKeys(value);' + '\n';
                        if (jQuery("[id='" + id + "']").prop("tagName") == "DIV") {
                            var inputElCount = jQuery("[id='" + id + "']").has('input').length;
                            if (inputElCount >= 1) {
                                sendKeysText = 'element(by.css("[id=\'"+id+"\'] input")).sendKeys(value);' + '\n'
                                sendKeysVar = 'element(by.ui5(ui5ControlProperties)).getAttribute("id").then(function(id) {' + "\n" +



                                    sendKeysText +

                                    '});' + '\n'




                            } else {
                                var textareaElCount = jQuery("[id='" + id + "']").has('textarea').length;
                                if (textareaElCount >= 1) {
                                    sendKeysText = 'element(by.css("[id=\'"+id+"\'] textarea")).sendKeys(value);' + '\n'
                                    sendKeysVar = 'element(by.ui5(ui5ControlProperties)).getAttribute("id").then(function(id) {' + "\n" +



                                        sendKeysText +

                                        '});' + '\n'
                                }

                            }

                        }


                        ele += '//*********************Block for ' + sap.ui.getCore().byId(id).getMetadata().getName() + ' - Perform Set-Value*****************************************************************' + '\n';

                        elemString = 'var ui5ControlProperties =  {' + "\n" + '\t\t\t\t\t\t\t' +
                            '"elementProperties":' + JSON.stringify(element["elementProperties"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"parentProperties":' + JSON.stringify(element["parentProp"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"prevSiblingProperties":' + JSON.stringify(element["prevSiblingProp"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"nextSiblingProperties":' + JSON.stringify(element["nextSiblingProp"]) + ',' + '\n\t\t\t\t\t\t\t' +
                            '"childProperties":' + JSON.stringify(element["childProp"]) + '\n\t\t\t\t\t\t\t' +
                            '};' + '\n' +

                            'var value ="' + finalValue + '";    //value to be entered by user' + '\n' +
                            sendKeysVar +

                            '//!!*******************************************************************************************************' + '\n\n';
                        elemAction = elemString.split(',')[0];
                        stepMessage = 'setValue' + " on " + sap.ui.getCore().byId(id).getMetadata().getName();
                        var action = sap.ui.getCore().byId(act);
                        action.setValue(finalValue);
                       
                    }
                    if (type == "Click") {

                        ele += '//*********************Block for ' + sap.ui.getCore().byId(id).getMetadata().getName() + ' - Perform Click*****************************************************************' + '\n';

                        elemString = 'var ui5ControlProperties =  {' + "\n" + '\t\t\t\t\t\t\t' +
                            '"elementProperties":' + JSON.stringify(element["elementProperties"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"parentProperties":' + JSON.stringify(element["parentProp"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"prevSiblingProperties":' + JSON.stringify(element["prevSiblingProp"]) + ',' + '\n' + '\t\t\t\t\t\t\t' +
                            '"nextSiblingProperties":' + JSON.stringify(element["nextSiblingProp"]) + ',' + '\n\t\t\t\t\t\t\t' +
                            '"childProperties":' + JSON.stringify(element["childProp"]) + '\n\t\t\t\t\t\t\t' +
                            '};' + '\n' +

                            'element(by.ui5(ui5ControlProperties)).click();' + "\n" +

                            '//!!*******************************************************************************************************' + '\n\n';
                        elemAction = elemString.split(',')[0];
                        stepMessage = 'click' + " on " + sap.ui.getCore().byId(id).getMetadata().getName();
                        var action = sap.ui.getCore().byId(act);
                        action.fireEvent('press');
                    }


                    ele += elemString;

                    return {
                        stepmsg: stepMessage,
                        elementProp: ele
                    }
                }

                //End of PoT - Customization



            }


            // Send information to content script
            document.dispatchEvent(new CustomEvent('detect-ui5-content', createResponseToContentScript()));

            // Listens for event from injected script
            document.addEventListener('do-ui5-detection-injected', function() {
                document.dispatchEvent(new CustomEvent('detect-ui5-content', createResponseToContentScript()));
            }, false);
        }());

    }, {}]
}, {}, [1]);