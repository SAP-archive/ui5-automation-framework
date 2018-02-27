/*!
 * SAP
 * (c) Copyright 2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
//var jQuery = require('jquery');
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
        sap.ui.require(['ToolsAPI'], function(ToolsAPI) {
            'use strict';


            var ui5inspector = require('../modules/injected/ui5inspector.js');
            var message = require('../modules/injected/message.js');
            var controlUtils = require('../modules/injected/controlUtils.js');
            var rightClickHandler = require('../modules/injected/rightClickHandler.js');
            var applicationUtils = require('../modules/injected/applicationUtils');

            // Create global reference for the extension
            ui5inspector.createReferences();

            /**
             * Mutation observer for DOM elements
             * @type {{init: Function, _observer: MutationObserver, _options: {subtree: boolean, childList: boolean, attributes: boolean}}}
             */
            var mutation = {

                /**
                 * Initialize the observer
                 */
                init: function() {
                    this._observer.observe(document.body, this._options);
                },

                /**
                 * Create an observer instance
                 */
                _observer: new MutationObserver(function(mutations) {
                    var isMutationValid = true;
                    var controlTreeModel;
                    var commonInformation;

                    mutations.forEach(function(mutation) {
                        if (mutation.target.id === 'ui5-highlighter' || mutation.target.id === 'ui5-highlighter-container') {
                            isMutationValid = false;
                            return;
                        }
                    });

                    if (isMutationValid === true) {
                        controlTreeModel = ToolsAPI.getRenderedControlTree();
                        commonInformation = ToolsAPI.getFrameworkInformation().commonInformation;

                        message.send({
                            action: 'on-application-dom-update',
                            controlTree: controlUtils.getControlTreeModel(controlTreeModel, commonInformation)
                        });
                    }
                }),

                // Configuration of the observer
                _options: {
                    subtree: true,
                    childList: true,
                    // If this is set to true, some controls will trigger mutation(example: newsTile changing active tile)
                    attributes: false
                }
            };

            // Initialize
            mutation.init();




            // Name space for message handler functions.
            var messageHandler = {

                /**
                 * Send massage with the needed initial information for the extension.
                 */
                'get-initial-information': function() {
                    var controlTreeModel = ToolsAPI.getRenderedControlTree();
                    var frameworkInformation = ToolsAPI.getFrameworkInformation();

                    message.send({
                        action: 'on-receiving-initial-data',
                        applicationInformation: applicationUtils.getApplicationInfo(frameworkInformation),
                        controlTree: controlUtils.getControlTreeModel(controlTreeModel, frameworkInformation.commonInformation)
                    });
                },

                /**
                 * Send framework information.
                 */
                'get-framework-information': function() {
                    var frameworkInformation = ToolsAPI.getFrameworkInformation();

                    message.send({
                        action: 'on-framework-information',
                        frameworkInformation: applicationUtils.getInformationForPopUp(frameworkInformation)
                    });
                },

                /**
                 * Handler for element selection in the ControlTree.
                 * @param {Object} event
                 */
                'do-control-select': function(event) {
                    var controlId = event.detail.target;
                    var controlProperties = ToolsAPI.getControlProperties(controlId);
                    var elementproperties = ToolsAPI.getControlProperties(controlId);
                    var eventproperties = ToolsAPI.getControlProperties(controlId);

                    var controlBindings = ToolsAPI.getControlBindings(controlId);

                    message.send({
                        action: 'on-control-select',
                        controlProperties: controlUtils.getControlPropertiesFormattedForDataView(controlId, controlProperties),
                        controlBindings: controlUtils.getControlBindingsFormattedForDataView(controlBindings),

                        //POT - Customisation

                    });
                },

                /**
                 * Send message with the inspected UI5 control, from the context menu.
                 * @param {Object} event
                 */
                'select-control-tree-element-event': function(event) {
                    var portMessage = event.detail;

                    message.send({
                        action: 'on-contextMenu-control-select',
                        target: portMessage.target
                    });
                },

                /**
                 * Change control property, based on editing in the DataView.
                 * @param {Object} event
                 */
                'do-control-property-change': function(event) {
                    var data = event.detail.data;
                    var controlId = data.controlId;
                    var property = data.property;
                    var newValue = data.value;

                    var control = sap.ui.getCore().byId(controlId);

                    if (!control) {
                        return;
                    }

                    try {
                        // Change the property through its setter
                        control['set' + property](newValue);
                    } catch (error) {
                        console.warn(error);
                    }

                    // Update the DevTools with the actual property value of the control
                    this['do-control-select']({
                        detail: {
                            target: controlId
                        }
                    });
                },

                //POT - Customisation


            };

            //pot - customisation
            function capitalizeFirstLetter(string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }

            document.addEventListener('do-simulate-event', function(e) {


                var triggerEvent = e.detail.event;
                var id = e.detail.id;

                var events = triggerEvent.split(",");

                for (var i = 0; i < events.length; i++) {
                    events[i] = "fire" + capitalizeFirstLetter(events[i]);
                    sap.ui.getCore().byId(id)[events[i]]();

                }


            });
            //end of pot-customisation

            /**
             * Register mousedown event.
             */
            ui5inspector.registerEventListener('mousedown', function rightClickTarget(event) {
                if (event.button === 2) {
                    rightClickHandler.setClickedElementId(event.target);
                    message.send({
                        action: 'on-right-click',
                        target: rightClickHandler.getClickedElementId()
                    });
                }
            });

            /**
             * Register custom event for communication with the injected.
             */
            ui5inspector.registerEventListener('ui5-communication-with-injected-script', function communicationWithContentScript(event) {
                var action = event.detail.action;

                if (messageHandler[action]) {
                    messageHandler[action](event);
                }
            });
        });

    }, {
        "../modules/injected/applicationUtils": 2,
        "../modules/injected/controlUtils.js": 3,
        "../modules/injected/message.js": 4,
        "../modules/injected/rightClickHandler.js": 5,
        "../modules/injected/ui5inspector.js": 6
    }],
    2: [function(require, module, exports) {
        'use strict';

        var utils = require('../utils/utils.js');

        /**
         * Get common application information.
         * @returns {Object} commonInformation - commonInformation property from ToolsAPI.getFrameworkInformation()
         * @private
         */
        function _getCommonInformation(commonInformation) {
            var frameworkName = commonInformation.frameworkName;
            var buildTime = utils.formatter.convertUI5TimeStampToHumanReadableFormat(commonInformation.buildTime);
            var lastChange = utils.formatter.convertUI5TimeStampToHumanReadableFormat(commonInformation.lastChange);
            var result = {};

            if (lastChange) {
                result[frameworkName] = commonInformation.version + ' (built at ' + buildTime + ' last change ' + lastChange + ')';
            } else {
                result[frameworkName] = commonInformation.version + ' (built at ' + buildTime + ')';
            }

            result['User Agent'] = commonInformation.userAgent;
            result.Application = commonInformation.applicationHREF;

            return result;
        }

        /**
         * Get bootstrap configuration information.
         * @returns {Object} configurationBootstrap - configurationBootstrap property from ToolsAPI.getFrameworkInformation()
         * @private
         */
        function _getConfigurationBootstrap(configurationBootstrap) {
            var bootConfigurationResult = {};

            for (var key in configurationBootstrap) {
                if (configurationBootstrap[key] instanceof Object === true) {
                    bootConfigurationResult[key] = JSON.stringify(configurationBootstrap[key]);
                } else {
                    bootConfigurationResult[key] = configurationBootstrap[key];
                }
            }

            return bootConfigurationResult;
        }

        /**
         * Get loaded modules application information.
         * @returns {Object} loadedModules - loadedModules property from ToolsAPI.getFrameworkInformation()
         * @private
         */
        function _getLoadedModules(loadedModules) {
            var loadedModulesResult = {};

            for (var i = 0; i < loadedModules.length; i++) {
                loadedModulesResult[i + 1] = loadedModules[i];
            }

            return loadedModulesResult;
        }

        /**
         * Get application URL parameters.
         * @returns {Object} URLParameters - URLParameters property from ToolsAPI.getFrameworkInformation()
         * @private
         */
        function _getURLParameters(URLParameters) {
            var urlParametersResult = {};

            for (var key in URLParameters) {
                urlParametersResult[key] = URLParameters[key].join(', ');
            }

            return urlParametersResult;
        }

        // Public API
        module.exports = {

            /**
             * Get UI5 information for the current inspected page.
             * @param {Object} frameworkInformation - frameworkInformation property from ToolsAPI.getFrameworkInformation()
             * @returns {Object}
             */
            getApplicationInfo: function(frameworkInformation) {
                return {
                    common: {
                        options: {
                            title: 'General',
                            expandable: true,
                            expanded: true
                        },
                        data: _getCommonInformation(frameworkInformation.commonInformation)
                    },

                    configurationBootstrap: {
                        options: {
                            title: 'Configuration (bootstrap)',
                            expandable: true,
                            expanded: true
                        },
                        data: _getConfigurationBootstrap(frameworkInformation.configurationBootstrap)
                    },

                    configurationComputed: {
                        options: {
                            title: 'Configuration (computed)',
                            expandable: true,
                            expanded: true
                        },
                        data: frameworkInformation.configurationComputed
                    },

                    urlParameters: {
                        options: {
                            title: 'URL Parameters',
                            expandable: true,
                            expanded: true
                        },
                        data: _getURLParameters(frameworkInformation.URLParameters)
                    },

                    loadedLibraries: {
                        options: {
                            title: 'Libraries (loaded)',
                            expandable: true,
                            expanded: true
                        },
                        data: frameworkInformation.loadedLibraries
                    },

                    libraries: {
                        options: {
                            title: 'Libraries (all)',
                            expandable: true
                        },
                        data: frameworkInformation.libraries
                    },

                    loadedModules: {
                        options: {
                            title: 'Modules (loaded)',
                            expandable: true
                        },
                        data: _getLoadedModules(frameworkInformation.loadedModules)
                    }
                };
            },

            /**
             * Get the needed information for the popup.
             * @param {Object} frameworkInformation - frameworkInformation property from ToolsAPI.getFrameworkInformation();
             * @returns {Object}
             */
            getInformationForPopUp: function(frameworkInformation) {
                return _getCommonInformation(frameworkInformation.commonInformation);
            }
        };

    }, {
        "../utils/utils.js": 7
    }],
    3: [function(require, module, exports) {
        'use strict';

        /**
         * Create data object for the DataView to consume.
         * @param {Object} options - settings
         * @returns {Object}
         * @private
         */
        function _assembleDataToView(options) {
            var object = Object.create(null);
            object.data = options.data ? options.data : Object.create(null);

            object.options = {
                controlId: options.controlId !== undefined ? options.controlId : undefined,
                expandable: options.expandable !== undefined ? options.expandable : true,
                expanded: options.expanded !== undefined ? options.expanded : true,
                hideTitle: options.hideTitle !== undefined ? options.hideTitle : false,
                showTypeInfo: !!options.showTypeInfo,
                title: options.title !== undefined ? options.title : '',
                editableValues: options.editableValues !== undefined ? options.editableValues : true
            };

            return object;
        }

        /**
         * Create a clickable value for the DataView.
         * @param {Object} options
         * @constructor
         */
        function ClickableValue(options) {
            // This is used for checking in the dataView
            this._isClickableValueForDataView = true;
            // This is shown in the data view
            this.value = '<clickable-value key="' + options.key + '" parent="' + options.parent + '">' + (options.value || '') + '</clickable-value>';
            // This data is attached in the click event of the dataview
            this.eventData = options.eventData || {};
        }

        // ================================================================================
        // Control Properties Info
        // ================================================================================
        var controlProperties = (function() {

            var OWN = 'own';
            var INHERITED = 'inherited';

            /**
             * Formatter for the inherited properties.
             * @param {string} controlId
             * @param {Object} properties - UI5 control properties
             * @private
             */
            function _formatInheritedProperties(controlId, properties) {

                if (!properties[INHERITED]) {
                    return;
                }

                for (var i = 0; i < properties[INHERITED].length; i++) {
                    var parent = properties[INHERITED][i];
                    var title = parent.meta.controlName;
                    var props = parent.properties;

                    parent = _assembleDataToView({
                        controlId: controlId,
                        expandable: false,
                        title: title
                    });

                    for (var key in props) {
                        parent.data[key] = props[key].value;
                    }

                    var parentTitle = '<span gray>Inherits from</span>';
                    parentTitle += ' (' + title + ')';
                    parent.options.title = parentTitle;
                    properties[INHERITED + i] = parent;
                }

                delete properties[INHERITED];
            }

            /**
             * Formatter for nested properties.
             * @param {Object} propertyObj
             * @param {string} title
             * @returns {Object}
             * @private
             */
            function _formatNestedProperties(propertyObj, title) {

                var nestedProperties = propertyObj.value;
                var props = _assembleDataToView({
                    title: title,
                    expandable: false,
                    showTypeInfo: true
                });

                for (var key in nestedProperties) {
                    props.data[key] = nestedProperties[key];
                }

                return props;
            }

            /**
             * Getter for the properties' associations.
             * @param {string} controlId
             * @param {Object} properties
             * @private
             */
            function _getControlPropertiesAssociations(controlId, properties) {
                var control = sap.ui.getCore().byId(controlId);

                if (!control) {
                    return;
                }

                properties.associations = Object.create(null);

                var controlAssociations = control.getMetadata().getAssociations();
                var genericObject = Object.create(null);

                Object.keys(controlAssociations).forEach(function(key) {
                    var associationElement = control.getAssociation(key);
                    if (associationElement && associationElement.length) {
                        genericObject.name = associationElement;
                    }

                    genericObject.type = controlAssociations[key].type;
                    properties.associations[key] = genericObject;
                });

            }

            /**
             * Formatter for the associations.
             * @param {Object} properties
             * @private
             */
            function _formatAssociations(properties) {
                var associations = properties.associations;

                for (var assoc in associations) {
                    var associationsValue = '';
                    if (associations[assoc].name) {
                        associationsValue += associations[assoc].name + ' ';
                    }
                    associationsValue += associations[assoc].type;
                    associationsValue += ' (associations)';
                    associations[assoc] = associationsValue;
                }
            }
            /**
             * Formatter function for the control properties data.
             * @param {string} controlId
             * @param {Object} properties
             * @returns {Object}
             * @private
             */
            var _formatControlProperties = function(controlId, properties) {

                if (Object.keys(properties).length === 0) {
                    return properties;
                }

                var title = properties[OWN].meta.controlName;
                var props = properties[OWN].properties;

                for (var key in props) {
                    if (props[key].type === 'object') {
                        props[key] = _formatNestedProperties(props[key], key);
                        continue;
                    }

                    props[key] = props[key].value;
                }

                properties[OWN] = _assembleDataToView({
                    controlId: controlId,
                    expandable: false,
                    title: title
                });
                properties[OWN].data = props;
                properties[OWN].options.title = '#' + controlId + ' <span gray>(' + title + ')</span>';

                _formatInheritedProperties(controlId, properties);
                _getControlPropertiesAssociations(controlId, properties[OWN]);
                _formatAssociations(properties[OWN]);

                return properties;
            }


            //POT - Customisation
            //dummy
            var _formatdata = function(controlId, properties) {



                var propsOptions = properties[OWN];
                propsOptions.title = '<arrow down="true"></arrow>#Element :' + controlId + ' <span gray>(' + propsOptions.meta.controlName + ')</span>';
                var elemSiblings = _getUI5elementProperties(controlId);

                var parentProp = elemSiblings["parentProp"];

                propsOptions.parentMProperty = JSON.stringify(parentProp.mProperties);
                propsOptions.parentTitle = '<arrow down="true"></arrow>#Parent :' + parentProp.id + ' <span gray>(' + parentProp.metadata + ')</span>';

                var prevSiblingId = JSON.stringify((elemSiblings["prevSiblingProp"].id));
                var prevMetadata = JSON.stringify((elemSiblings["prevSiblingProp"].metadata));
                var prevMPropty = JSON.stringify((elemSiblings["prevSiblingProp"].mProperties));
                propsOptions.prevSiblingMProperty = prevMPropty;

                propsOptions.prevSiblingTitle = '<arrow down="true"></arrow>#Previous Sibling :' + prevSiblingId + ' <span gray>(' + prevMetadata + ')</span>';

                var nextSiblingId = JSON.stringify((elemSiblings["nextSiblingProp"].id));
                var nextMetadata = JSON.stringify((elemSiblings["nextSiblingProp"].metadata));
                var nextMPropty = JSON.stringify((elemSiblings["nextSiblingProp"].mProperties));
                propsOptions.nextSiblingMProperty = nextMPropty;
                propsOptions.nextSiblingTitle = '<arrow down="true"></arrow>#Next Sibling :' + nextSiblingId + ' <span gray>(' + nextMetadata + ')</span>';


                properties[OWN] = _assembleDataToView({
                    controlId: controlId,
                    expandable: false,
                    title: propsOptions.meta.controlName
                });
                properties[OWN].data = propsOptions;
                properties[OWN].options.title = '<arrow down="true"></arrow>#Element :' + controlId + ' <span gray>(' + propsOptions.meta.controlName + ')</span>';

                _formatInheritedProperties(controlId, properties);
                _getControlPropertiesAssociations(controlId, properties[OWN]);
                _formatAssociations(properties[OWN]);


                return properties;
            }




            /**
             * Formatter function for the element's event data
             * @param {Object} properties a predefined structured object
             * @returns {Object} events
             * @private
             */
            var _formatEventData = function(controlId, properties) {
                var propsOptions = properties[OWN];

                propsOptions.eventTitle = '<arrow down="true"></arrow>Displaying events for the element :' + controlId + ' <span gray>(' + propsOptions.meta.controlName + ')</span>';
                var id = controlId;
                var eventsSupported = sap.ui.getCore().byId(id).getMetadata()._mEvents;
                if (Object.keys(eventsSupported).length == 0) {
                    eventsSupported = sap.ui.getCore().byId(id).mEventRegistry;
                    if (Object.keys(eventsSupported).length == 0) {
                        eventsSupported = sap.ui.getCore().byId(id).getMetadata()._mAllEvents;
                    }
                }
                var eventsString = "";

                jQuery.each(eventsSupported, function(i, v) {
                    eventsString += i + ',';
                });

                eventsString = eventsString.substr(0, eventsString.length - 1);

                propsOptions.events = eventsString;

                properties[OWN] = _assembleDataToView({
                    controlId: controlId,
                    expandable: false,
                    title: propsOptions.meta.controlName
                });
                properties[OWN].data = propsOptions;
                properties[OWN].options.title = '#' + controlId + ' <span gray>(' + propsOptions.meta.controlName + ')</span>';

                _formatInheritedProperties(controlId, properties);
                _getControlPropertiesAssociations(controlId, properties[OWN]);
                _formatAssociations(properties[OWN]);

                return properties;
            };

            var _getUI5elementProperties = function(id) {

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
                var currBool = false;
                var currMprop = null;
                countMetadata = null;
                elemCount = 0;
                var element = {};
                var value = null;
                var elemString;
                element["elementProperties"] = {
                    "metadata": sap.ui.getCore().byId(id).getMetadata().getName(),
                    "mProperties": sap.ui.getCore().byId(id).mProperties
                };

                //Events
                var eventsSupported = sap.ui.getCore().byId(id).getMetadata()._mEvents;
                if (Object.keys(eventsSupported).length == 0) {
                    eventsSupported = sap.ui.getCore().byId(id).mEventRegistry;
                    if (Object.keys(eventsSupported).length == 0) {
                        eventsSupported = sap.ui.getCore().byId(id).getMetadata()._mAllEvents;
                    }
                }
                if (window.sap.ui.getCore().byId(id) !== undefined) {

                    var parMetadata;
                    var parProp;

                    var str = "id=" + "'" + id + "'"
                    var par = jQuery('[' + str + ']').parent();

                    var parid = par.attr('id');
                    var count = 0;
                    var parfindEndFlag = false;
                    var parMProp;

                    while (1) {
                        if (par.length == 0) {
                            parfindEndFlag = true;
                            break;
                        }
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
                    if (parfindEndFlag) {
                        element["parentProp"] = {}
                    } else {
                        element["parentProp"] = {
                            "id": parid,
                            "metadata": parMetadata,
                            "mProperties": parMProp
                        };
                    }
                    if (!(par.length == 0)) {
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
                                    "id": parNode.getAttribute('id'),
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

                                if (parMetaNodes[i - 1] != undefined) {
                                    var j = i - 1;
                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'"
                                    var prevelemid = jQuery('[' + str + ']').parent();


                                    //var prevelemid = jQuery('#'+parMetaNodeElems[j].id).parent();
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

                                                    // prevelemid = jQuery('#'+parMetaNodeElems[j].id).parent();
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
                                //Next Sibling

                                if (parMetaNodes[i + 1] != undefined) {
                                    var j = i + 1;

                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'"
                                    var nextelemid = jQuery('[' + str + ']').parent();

                                    // var nextelemid = jQuery('#'+parMetaNodeElems[j].id).parent();
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


                                                    // nextelemid = jQuery('#'+parMetaNodeElems[j].id).parent();
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

                        }

                        element["prevSiblingProp"] = prevSibElem;
                        element["nextSiblingProp"] = nextSibElem;
                    }

                }
                //console.log("Element :"+ element);

                return element;

            };



            return {
                formatControlProperties: _formatControlProperties,
                formatdata: _formatdata,
                formatEventData: _formatEventData
            };


        }());

        // ================================================================================
        // Binding Info
        // ================================================================================
        var controlBindings = (function() {

            /**
             *
             * @param {Object} initialControlBindingData - ToolsAPI.getControlBindings()
             * @param {Object} resultControlBindingData
             * @private
             */
            var _getControlContextPathFormattedForDataView = function(initialControlBindingData, resultControlBindingData) {
                if (initialControlBindingData.contextPath) {
                    resultControlBindingData.contextPath = _assembleDataToView({
                        title: 'Binding context',
                        expandable: false,
                        editableValues: false
                    });
                    resultControlBindingData.contextPath.data.contextPath = initialControlBindingData.contextPath;
                }
            };




            /**
             *
             * @param {Object} initialControlBindingData - ToolsAPI.getControlBindings()
             * @param {Object} resultControlBindingData
             * @private
             */
            var _getControlPropertiesFormattedForDataView = function(initialControlBindingData, resultControlBindingData) {
                if (!initialControlBindingData.properties) {
                    return;
                }

                for (var key in initialControlBindingData.properties) {
                    resultControlBindingData[key] = _assembleDataToView({
                        title: key + ' <opaque>(property)</opaque>',
                        expandable: false,
                        editableValues: false
                    });
                }

                Object.keys(initialControlBindingData.properties).forEach(function(key) {
                    var model = initialControlBindingData.properties[key].model;
                    var properties = initialControlBindingData.properties[key];
                    var modelType = model.type ? model.type.split('.').pop() : '';
                    var modelInfo;

                    if (model) {

                        if (modelType) {
                            modelInfo = model.names.join(', ') + ' (' + properties.mode + ', ' + modelType + ')';
                        } else {
                            modelInfo = model.names.join(', ') + ' (' + properties.mode + ')';
                        }

                        resultControlBindingData[key].data = {
                            path: properties.path,
                            value: properties.value,
                            type: properties.type,
                            model: new ClickableValue({
                                value: modelInfo,
                                eventData: {
                                    type: model.type,
                                    'default binding mode': properties.mode,
                                    data: model.data
                                },
                                parent: key,
                                key: 'model'
                            })
                        };
                    }
                });
            };

            /**
             *
             * @param {Object} initialControlBindingData - ToolsAPI.getControlBindingData()
             * @param {Object} resultControlBindingData
             * @private
             */
            var _getControlAggregationsFormattedForDataView = function(initialControlBindingData, resultControlBindingData) {
                if (!initialControlBindingData.aggregations) {
                    return;
                }

                for (var index in initialControlBindingData.aggregations) {
                    resultControlBindingData[index] = _assembleDataToView({
                        title: index + ' <opaque>(aggregation)</opaque>',
                        expandable: false,
                        editableValues: false
                    });
                }

                Object.keys(initialControlBindingData.aggregations).forEach(function(key) {
                    var model = initialControlBindingData.aggregations[key].model;

                    if (model) {
                        resultControlBindingData[key].data = {
                            model: '<anchor href="#">' + model.names.join(', ') + '</anchor>',
                            mode: model.mode,
                            path: model.path
                        };
                    }
                });
            };

            return {
                getControlContextPathFormattedForDataView: _getControlContextPathFormattedForDataView,
                getControlPropertiesFormattedForDataView: _getControlPropertiesFormattedForDataView,
                getControlAggregationsFormattedForDataView: _getControlAggregationsFormattedForDataView
            };

        }());

        // ================================================================================
        // Public API
        // ================================================================================
        module.exports = {

            /**
             * Returns the entire control tree model.
             * @param {Array} controlTreeModel - ToolsAPI.getRenderedControlTree()
             * @param {Object} commonInformation - commonInformation property from ToolsAPI.getFrameworkInformation()
             * @returns {{versionInfo: {version: (string|*), framework: (*|string)}, controls: *}}
             */
            getControlTreeModel: function(controlTreeModel, commonInformation) {
                return {
                    versionInfo: {
                        version: commonInformation.version,
                        framework: commonInformation.frameworkName
                    },
                    controls: controlTreeModel
                };
            },




            /**
             * Returns properties for control in a formatted way.
             * @param {string} controlId
             * @returns {Object}
             */
            getControlPropertiesFormattedForDataView: function(controlId, properties) {
                return controlProperties.formatControlProperties(controlId, properties);
            },

            //POT - Customisation
            //dummy
            getControlPropertiesdummy: function(controlId, properties) {
                return controlProperties.formatdata(controlId, properties);
            },

            getEventProperties: function(controlId, properties) {
                return controlProperties.formatEventData(controlId, properties);
            },
            /**
             * Reformat all information needed for visualizing the control bindings.
             * @param {Object} controlBindingData - ToolsAPI.getControlBindingData()
             * @returns {Object}
             */
            getControlBindingsFormattedForDataView: function(controlBindingData) {
                var resultControlBindingData = Object.create(null);

                controlBindings.getControlContextPathFormattedForDataView(controlBindingData, resultControlBindingData);
                controlBindings.getControlPropertiesFormattedForDataView(controlBindingData, resultControlBindingData);
                controlBindings.getControlAggregationsFormattedForDataView(controlBindingData, resultControlBindingData);

                return resultControlBindingData;
            }
        };

    }, {}],
    4: [function(require, module, exports) {
        'use strict';

        module.exports = {
            /**
             * Send message to content script.
             * @param {Object} object
             */
            send: function(object) {
                var message = {
                    detail: object
                };

                document.dispatchEvent(new CustomEvent('ui5-communication-with-content-script', message));
            }
        };

    }, {}],
    5: [function(require, module, exports) {
        'use strict';

        module.exports = {

            // Reference for the ID of the last click UI5 control.
            _clickedElementId: null,

            /**
             * Return the ID of the UI5 control that was clicked.
             * @returns {string}
             */
            getClickedElementId: function() {
                return this._clickedElementId;
            },

            /**
             * Set the ID of the UI5 control that was clicked.
             * @param {Element} target
             * @returns {string}
             */
            setClickedElementId: function(target) {
                while (target && !target.getAttribute('data-sap-ui')) {
                    if (target.nodeName === 'BODY') {
                        break;
                    }
                    target = target.parentNode;
                }

                this._clickedElementId = target.id;
                return this;
            }
        };

    }, {}],
    6: [function(require, module, exports) {
        'use strict';

        /**
         * Create global reference for the extension.
         * @private
         */
        function _createReferences() {
            if (window.ui5inspector === undefined) {
                window.ui5inspector = {
                    events: Object.create(null)
                };
            }
        }

        /**
         * Register event listener if is not already registered.
         * @param {string} eventName - the name of the event that will be register
         * @callback
         * @private
         */
        function _registerEventListener(eventName, callback) {
            if (window.ui5inspector.events[eventName] === undefined) {
                // Register reference
                window.ui5inspector.events[eventName] = {
                    callback: callback.name,
                    state: 'registered'
                };

                document.addEventListener(eventName, callback, false);
            }
        }

        module.exports = {
            createReferences: _createReferences,
            registerEventListener: _registerEventListener
        };

    }, {}],
    7: [function(require, module, exports) {
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

    }, {}]
}, {}, [1]);