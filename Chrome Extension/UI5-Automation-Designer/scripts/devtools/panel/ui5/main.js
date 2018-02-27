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

            // ================================================================================
            // Main controller for 'UI5' tab in devtools
            // ================================================================================

            // ================================================================================
            // Bootstrap
            // ================================================================================

            // Components that need to be required and reference
            // ================================================================================
            var utils = require('../../../modules/utils/utils.js');
            var TabBar = require('../../../modules/ui/TabBar.js');
            var ControlTree = require('../../../modules/ui/ControlTree.js');
            var DataView = require('../../../modules/ui/DataView.js');
            var Splitter = require('../../../modules/ui/SplitContainer.js');

            // Create a port with background page for continuous message communication
            // ================================================================================
            var port = chrome.extension.connect({
                name: 'devtools-tabId-' + chrome.devtools.inspectedWindow.tabId
            });

            // Bootstrap for 'Control inspector' tab
            // ================================================================================
            utils.setOSClassName();

            // Main tabbar inside 'UI5' devtools panel
            var UI5TabBar = new TabBar('ui5-tabbar');

            // Horizontal Splitter for 'Control Inspector' tab
            var controlInspectorHorizontalSplitter = new Splitter('horizontal-splitter', {
                endContainerWidth: '400px'
            });

            // Control tree	
            var controlTree = new ControlTree('control-tree', {

                /**
                 * Send message, that the a new element is selected in the ControlTree.
                 * @param {string} selectedElementId
                 */
                onSelectionChanged: function(selectedElementId) {
                    port.postMessage({
                        action: 'do-control-select',
                        target: selectedElementId
                    });
                },

                /**
                 * Send message, that the a new element is hovered in the ControlTree.
                 * @param {string} hoveredElementId
                 */
                onHoverChanged: function(hoveredElementId) {
                    port.postMessage({
                        action: 'on-control-tree-hover',
                        target: hoveredElementId
                    });
                },

                /**
                 * Fired at first rendering of the ControlTree.
                 */
                onInitialRendering: function() {
                    var controls = this.getData().controls;
                    this.setSelectedElement(controls[0].id);
                }
            });

            // Tabbar for Controltree additional information (Properties, Binding and etc)
            var controlTreeTabBar = new TabBar('control-tree-tabbar');

            // Dataview for control properties
            var controlProperties = new DataView('control-properties', {

                /**
                 * Send message, that an proprety in the DataView is changed.
                 * @param {Object} changeData
                 */
                onPropertyUpdated: function(changeData) {
                    port.postMessage({
                        action: 'do-control-property-change',
                        data: changeData
                    });
                }
            });

            // Vertical splitter for 'Bindings' tab
            var controlBindingsSplitter = new Splitter('control-bindings-splitter', {
                hideEndContainer: true,
                isEndContainerClosable: true,
                endContainerTitle: 'Model Information'
            });

            // Dataview for control binding information - left part
            var controlBindingInfoLeftDataView = new DataView('control-bindings-left', {

                /**
                 * Method fired when a clickable element is clicked.
                 * @param {Object} event
                 */
                onValueClick: function(event) {
                    var dataFormatedForDataView = {
                        modelInfo: {
                            options: {
                                title: 'Model Information',
                                expandable: false,
                                expanded: true,
                                hideTitle: true
                            },
                            data: event.data
                        }
                    };

                    controlBindingInfoRightDataView.setData(dataFormatedForDataView);
                    controlBindingsSplitter.showEndContainer();
                }
            });
            // Dataview for control binding information
            var controlBindingInfoRightDataView = new DataView('control-bindings-right');

            // Bootstrap for 'Control inspector' tab
            // ================================================================================

            // Dataview for 'Application information' tab
            var appInfo = new DataView('app-info');

            // ================================================================================
            // Communication
            // ================================================================================

            // Name space for message handler functions.
            var messageHandler = {

                /**
                 * Send object to background page.
                 * @param {Object} message
                 */
                'on-port-connection': function(message) {
                    port.postMessage({
                        action: 'do-ui5-detection'
                    });
                },

                /**
                 * Handler for UI5 detection on the current inspected page.
                 * @param {Object} message
                 */
                'on-ui5-detected': function(message) {
                    var overlay = document.getElementById('supportability');
                    var overlayNoUI5Section = overlay.querySelector('[no-ui5-version]');
                    var overlayUnsupportedVersionSection = overlay.querySelector('[unsupported-version]');

                    if (message.isVersionSupported) {
                        overlay.setAttribute('hidden', true);
                    } else {
                        overlay.removeAttribute('hidden');
                        overlayNoUI5Section.style.display = 'none';
                        overlayUnsupportedVersionSection.style.display = 'block';
                    }

                    port.postMessage({
                        action: 'do-script-injection',
                        tabId: chrome.devtools.inspectedWindow.tabId,
                        file: '/scripts/content/main.js'
                    });
                },

                /**
                 * Get the initial needed information, when the main injected script is available.
                 * @param {Object} message
                 */
                'on-main-script-injection': function(message) {
                    port.postMessage({
                        action: 'get-initial-information'
                    });
                },

                /**
                 * Visualize the initial needed data for the extension.
                 * @param {Object} message
                 */
                'on-receiving-initial-data': function(message) {
                    controlTree.setData(message.controlTree);
                    appInfo.setData(message.applicationInformation);
                },

                /**
                 * Updates the ControlTree, when the DOM in the inspected window is changed.
                 * @param {Object} message
                 */
                'on-application-dom-update': function(message) {
                    controlTree.setData(message.controlTree);
                },

                /**
                 * Handler for ControlTree element selecting.
                 * @param {Object} message
                 */
                'on-control-select': function(message) {
                    controlProperties.setData(message.controlProperties);
                    controlBindingInfoLeftDataView.setData(message.controlBindings);

                    //POT - Customization
                    document.getElementById("git_img").onclick = function() {
                        var data = document.getElementById("git_img");
                        if (data.name == "gif_img") {
                            data.src = "/images/vyperTRANS1.gif";
                            data.title = "Recording... Click to Stop"
                            data.name = "gif_new_img";
                            port.postMessage({
                                action: 'copyControl'
                            });

                        } else if (data.name == "gif_new_img") {
                            port.postMessage({
                                action: 'contextMenu-control-right-select'
                            });
                            data.title = "Start Recording"
                            data.src = "/images/vyper1.gif";
                            data.name = "gif_img";
                        }

                    }

                    document.getElementById("getEvent").onclick = function() {
                        var id = document.getElementById('hiddenIdEventsTab').value;
                        var checkboxes = document.getElementsByName('chb[]');
                        var vals = "";
                        for (var i = 0, n = checkboxes.length; i < n; i++) {
                            if (checkboxes[i].checked) {
                                vals += "," + checkboxes[i].value;
                            }
                        }
                        if (vals) {
                            vals = vals.substring(1);
                            port.postMessage({
                                sender: 'triggerEvent',
                                id: id,
                                events: vals
                            });
                        }
                    }

                    //End of Customization-PoT
                    // Set bindings count
                    document.querySelector('#tab-bindings count').innerHTML = '&nbsp;(' + Object.keys(message.controlBindings).length + ')';

                    // Close possible open binding info and/or methods info
                    controlBindingsSplitter.hideEndContainer();
                },

                /**
                 * Select ControlTree element, based on selection in the Element panel.
                 * @param {Object} message
                 */
                'on-select-ui5-control-from-element-tab': function(message) {
                    controlTree.setSelectedElement(message.nearestUI5Control);
                },

                /**
                 * Select ControlTree element, based on right click and context menu.
                 * @param {Object} message
                 */
                'on-contextMenu-control-select': function(message) {
                    controlTree.setSelectedElement(message.target);
                },

                /**
                 * Handler for UI5 none detection on the current inspected page.
                 * @param {Object} message
                 */
                'on-ui5-not-detected': function(message) {
                    var overlay = document.getElementById('supportability');
                    var overlayNoUI5Section = overlay.querySelector('[no-ui5-version]');
                    var overlayUnsupportedVersionSection = overlay.querySelector('[unsupported-version]');

                    overlay.removeAttribute('hidden');

                    overlayNoUI5Section.style.display = 'block';
                    overlayUnsupportedVersionSection.style.display = 'none';
                }
            };

            port.onMessage.addListener(function(message) {


                if (message.action == 'valueRequired_From_DetectUI5') {
                    var valueRequired = message.data.valueRequired;
                    var action = message.data.action;
                    var id = message.data.nodeId;

                    var prop = message.data.nodeProperties;
                    var listbox = '<select id="attributeValue">';


                    for (var val in prop) {
                        listbox += '<option value="' + val + '">' + val + '</option>';
                    }
                    listbox += '</select>';
                    var defaultValue;
                    var finalActionValue;
                    if (action == 'Action' && valueRequired || action == 'Value') {
                        debugger;


                        defaultValue = message.data.value;
                        if (defaultValue == null) {
                            defaultValue = ""
                        }
                        try {
                            $('<div></div>').dialog({
                                modal: true,
                                title: "Values required",
                                open: function() {
                                    var markup = '<form id="actionValueForm"><div><label>Value</label><input id="actionValue" type="text" required="true" value=' + defaultValue + '></div></form> ';
                                    $(this).html(markup);
                                },
                                buttons: {
                                    Ok: function() {
                                        if ($('#actionValueForm').valid()) {

                                            finalActionValue = $("#actionValue").val();
                                            $(this).dialog("destroy");
                                            try {
                                                var sendMessage = {
                                                    action: 'on-contextMenu-After_Enter_Value', //called in script/content/detectUI5.js
                                                    target: id,
                                                    type: action,
                                                    valueRequired: valueRequired,
                                                    finalValue: finalActionValue,
                                                    compareValue: 'null',
                                                    attribute: 'null'
                                                }
                                                port.postMessage(sendMessage);
                                            } catch (e) {}
                                        }
                                    }
                                }
                            });
                        } catch (e) {
                            alert(e);
                        }
                        return true;
                    } else if (action == 'Assert') {
                        $('<div></div>').dialog({
                            modal: true,
                            width: "350px",
                            title: "Values required",
                            open: function() {
                                var markup = '<form id="assertDialogForm"><div><div>' +
                                    '</div><br>' +
                                    '<div><label for="attributeValue" style="margin-right:44px">Attribute</label>' + listbox + '</div><br>' +
                                    '<div><label for="compareValue" style="margin-right:3px">Compare Value</label><input id="compareValue" name="compareValue" type="text" required="true"></div><br></div></form>';

                                $(this).html(markup);
                                $('#compareValue').val(prop[Object.keys(prop)[0]]);
                            },
                            buttons: {
                                Ok: function() {
                                    if ($('#assertDialogForm').valid()) {
                                        var compareValue = $("#compareValue").val();
                                        var attribute = $('#attributeValue').val();
                                        $(this).dialog("destroy");
                                        try {
                                            var sendMessage = {
                                                action: 'on-contextMenu-After_Enter_Value', //called in script/content/detectUI5.js
                                                target: id,
                                                type: action,
                                                valueRequired: 'null',
                                                finalValue: 'null',

                                                compareValue: compareValue,
                                                attribute: attribute
                                            }
                                            port.postMessage(sendMessage);
                                        } catch (e) {}
                                    }
                                }
                            },
                            close: function() {
                                $(this).dialog("destroy");
                            }
                        });


                        $("#attributeValue").on('change', function() {

                            var selected = $('#attributeValue').find(':selected').text();

                            setTimeout(function() {
                                $('#compareValue').val(prop[selected])
                            },  0);
                        });
                    } else {

                        var sendMessage = {
                            action: 'on-contextMenu-After_Enter_Value', //called in script/content/detectUI5.js
                            target: id,
                            type: action,
                            valueRequired: valueRequired,
                            finalValue: 'null',
                            compareValue: 'null',
                            attribute: 'null'
                        }
                        port.postMessage(sendMessage);


                        return true;

                    }




                }

            });
            // Listen for messages from the background page
            port.onMessage.addListener(function(message, messageSender, sendResponse) {
                // Resolve incoming messages
                utils.resolveMessage({
                    message: message,
                    messageSender: messageSender,
                    sendResponse: sendResponse,
                    actions: messageHandler
                });
            });

            // Restart everything when the URL is changed
            chrome.devtools.network.onNavigated.addListener(function() {
                port.postMessage({
                    action: 'do-ui5-detection'
                });
            });
        }());

    }, {
        "../../../modules/ui/ControlTree.js": 2,
        "../../../modules/ui/DataView.js": 3,
        "../../../modules/ui/SplitContainer.js": 5,
        "../../../modules/ui/TabBar.js": 6,
        "../../../modules/utils/utils.js": 8
    }],
    2: [function(require, module, exports) {
        'use strict';

        /**
         * @typedef {Object} ControlTree
         * @property {Object} data - This property should contain objects described in ControlTreeOptions
         * @function onSelectionChanged
         * @function onHoverChanged

         */

        /**
         * @typedef {Object} ControlTreeOptions
         * @property {Object} versionInfo - JSON object with the fowling format:
         *  {
         *      framework: 'string',
         *      version: 'string'
         *  }
         * @property {Object} controls - Array with JSON object in the following format:
         *  [{
         *      id: 'string',
         *      name: 'string',
         *      type: 'string',
         *      content: 'Array'
         *  }]
         */

        /**
         * @typedef {Object} controlTreeRenderingOptions
         * @property {string} id - The id of the control.
         * @property {Array} attributes - HTML attributes.
         */

        /**
         * Check for JS object.
         * @param {Object} data
         * @returns {boolean}
         * @private
         */
        function _isObject(data) {
            return (typeof data === 'object' && !Array.isArray(data) && data !== null);
        }

        /**
         * Create tree element that shows framework name and version.
         * @param {Object} versionInfo
         * @returns {string}
         * @private
         */
        function _createTreeHeader(versionInfo) {
            if (!versionInfo) {
                console.warn('There is no version information in the data model');
                return '';
            }

            return '<ul><li visible><version>&#60;!' + versionInfo.framework + ' v' + versionInfo.version + '&#62;</version></li></ul>';
        }

        /**
         * @param {controlTreeRenderingOptions} options
         * @returns {string}
         * @private
         */
        function _startControlTreeList(options) {
            return '<ul ' + options.attributes.join(' ') + '>';
        }

        /**
         * @returns {string}
         * @private
         */
        function _endControlTreeList() {
            return '</ul>';
        }

        /**
         * @param {controlTreeRenderingOptions.controls} options
         * @returns {string}
         * @private
         */
        function _startControlTreeListItem(options) {
            return '<li id="' + options.id + '">';
        }

        /**
         * @returns {string}
         * @private
         */
        function _endControlTreeListItem() {
            return '</li>';
        }

        /**
         * Create HTML for the left part of the ControlTree list item.
         * @param {ControlTreeOptions.controls} controls
         * @param {number} paddingLeft
         * @returns {string}
         * @private
         */
        function _getControlTreeLeftColumnOfListItem(controls, paddingLeft) {
            var html = '<offset style="padding-left:' + paddingLeft + 'px" >';

            if (controls.content.length > 0) {
                html += '<arrow down="true"></arrow>';
            } else {
                html += '<place-holder></place-holder>';
            }

            html += '</offset>';


            return html;
        }

        /**
         * Create HTML for the right part of the ControlTree list item.
         * @param {Object} control - JSON object form {ControlTreeOptions.controls}
         * @returns {string}
         * @private
         */
        function _getControlTreeRightColumnOfListItem(control) {
            var splitControlName = control.name.split('.');
            var name = splitControlName[splitControlName.length - 1];
            var nameSpace = control.name.replace(name, '');

            return '<tag data-search="' + control.name + control.id + '">' +
                '&#60;' +
                '<namespace>' + nameSpace + '</namespace>' +
                name +
                '<attribute>&#32;id="<attribute-value>' + control.id + '</attribute-value>"</attribute>' +
                '&#62;' +
                '</tag>';
        }

        /**
         * Search for the nearest parent Node.
         * @param {element} element - HTML DOM element that will be the root of the search
         * @param {string} parentNodeName - The desired HTML parent element nodeName
         * @returns {Object} HTML DOM element
         * @private
         */
        function _findNearestDOMParent(element, parentNodeName) {
            while (element.nodeName !== parentNodeName) {
                if (element.nodeName === 'CONTROL-TREE') {
                    break;
                }
                element = element.parentNode;
            }

            return element;
        }

        /**
         * ControlTree constructor.
         * @param {string} id - The id of the DOM container
         * @param {ControlTree} instantiationOptions
         * @constructor
         */
        function ControlTree(id, instantiationOptions) {
            var areInstantiationOptionsAnObject = _isObject(instantiationOptions);
            var options;

            /**
             * Make sure that the options parameter is Object and
             * that the ControlTree can be instantiate without initial options.
             */
            if (areInstantiationOptionsAnObject) {
                options = instantiationOptions;
            } else {
                options = {};
            }

            // Save DOM reference
            this._controlTreeContainer = document.getElementById(id);

            /**
             * Method fired when the selected element in the ControlTree is changed.
             * @param {string} selectedElementId - The selected element id
             */
            this.onSelectionChanged = options.onSelectionChanged ? options.onSelectionChanged : function(selectedElementId) {};

            /**
             * Method fired when the hovered element in the ControlTree is changed.
             * @param {string} hoveredElementId - The hovered element id
             */
            this.onHoverChanged = options.onHoverChanged ? options.onHoverChanged : function(hoveredElementId) {};

            /**
             * Method fired when the initial ControlTree rendering is done.
             */
            this.onInitialRendering = options.onInitialRendering ? options.onInitialRendering : function() {};

            // Object with the tree model that will be visualized
            this.setData(options.data);
        }

        /**
         * Initialize Tree.
         */
        ControlTree.prototype.init = function() {
            this._createHTML();
            this._createHandlers();

            // Fire event to notify that the ControlTree is initialized
            this.onInitialRendering();
        };

        /**
         * Get the data model used for the tree.
         * @returns {ControlTreeOptions} the data that is used for the tree
         */
        ControlTree.prototype.getData = function() {
            return this._data;
        };

        /**
         * Set the data model used for the tree.
         * @param {ControlTreeOptions} data
         * @returns {ControlTree}
         */
        ControlTree.prototype.setData = function(data) {
            var oldData = this.getData();
            var isDataAnObject = _isObject(data);

            if (isDataAnObject === false) {
                console.warn('The parameter should be an Object');
                return;
            }

            // Make sure that the new data is different from the old one
            if (JSON.stringify(oldData) === JSON.stringify(data)) {
                return;
            }

            this._data = data;

            // Initialize ControlTree on first rendering
            // If it is a second rendering, render only the tree elements
            if (this._isFirstRendering === undefined) {
                this.init();
                this._isFirstRendering = true;
            } else {
                this._createTree();
            }

            return this;
        };

        /**
         * Returns the selected <li> element of the tree.
         * @returns {Element} HTML DOM element
         */
        ControlTree.prototype.getSelectedElement = function() {
            return this._selectedElement;
        };

        /**
         * Set the selected <li> element of the tree.
         * @param {string} elementID - HTML DOM element id
         * @returns {ControlTree}
         */
        ControlTree.prototype.setSelectedElement = function(elementID) {
            var selectedElement;

            if (typeof elementID !== 'string') {
                console.warn('Please use a valid string parameter');
                return;
            }

            selectedElement = this._controlTreeContainer.querySelector('#' + elementID);

            if (selectedElement === null) {
                console.warn('The selected element is not a child of the ControlTree');
                return;
            }

            this._selectedElement = selectedElement;
            this._selectTreeElement(selectedElement);

            return this;
        };

        /**
         * Create and places the ControlTree HTML.
         * @private
         */
        ControlTree.prototype._createHTML = function() {
            var html;

            html = this._createFilter();
            html += this._createTreeContainer();

            this._controlTreeContainer.innerHTML = html;
            // Save reverences for future use
            this._setReferences();

            if (this.getData() !== undefined) {
                this._createTree();
            }
        };

        /**
         * Create the HTML needed for filtering.
         * @returns {string}
         * @private
         */
        ControlTree.prototype._createFilter = function() {
            return '<filter>' +
                '<start>' +
                '<input type="search" placeholder="Search" search autofocus/>' +
                '<label><input type="checkbox" filter />Filter results <results>(0)</results></label>' +
                '</start>' +
                '<end>' +
                '<label><input type="checkbox" namespaces checked/>Show Namespace</label>' +
                '<label><input type="checkbox" attributes checked/>Show Attributes</label>' +
                //POT - Customization
                '<input type="image" id="git_img" title = "Start Recording" name = "gif_img" src="/images/vyper1.gif" alt="Image input control" width="25" height="25">' +
                //End of POT - Customization
                '</end>' +
                '</filter>';
        };

        /**
         * Create the HTML container for the tree.
         * @returns {string}
         * @private
         */
        ControlTree.prototype._createTreeContainer = function() {
            return '<tree show-namespaces show-attributes></tree>';
        };

        /**
         * Create ControlTree HTML.
         */
        ControlTree.prototype._createTree = function() {
            var versionInfo = this.getData().versionInfo;
            var controls = this.getData().controls;

            this._treeContainer.innerHTML = _createTreeHeader(versionInfo) + this._createTreeHTML(controls);
        };

        /**
         * Create HTML tree from JSON.
         * @param {ControlTreeOptions.controls} controls
         * @param {number} level - nested level
         * @returns {string} HTML ControlTree in form of a string
         * @private
         */
        ControlTree.prototype._createTreeHTML = function(controls, level) {
            if (controls === undefined || controls.length === 0) {
                return '';
            }

            var html = '';
            var nestedLevel = level || 0;
            var paddingLeft = ++nestedLevel * 10;
            var that = this;

            controls.forEach(function(control) {
                html += _startControlTreeList({
                    attributes: ['expanded="true"']
                });

                html += _startControlTreeListItem({
                    id: control.id
                });

                html += _getControlTreeLeftColumnOfListItem(control, paddingLeft);

                html += _getControlTreeRightColumnOfListItem(control);

                html += _endControlTreeListItem();

                html += that._createTreeHTML(control.content, nestedLevel);

                html += _endControlTreeList();
            });

            return html;
        };

        /**
         * Hide/Show nested "<ul>" in "<li>" elements.
         * @param {Element} target - DOM element
         * @private
         */
        ControlTree.prototype._toggleCollapse = function(target) {
            var targetParent = _findNearestDOMParent(target.parentNode, 'UL');

            if (target.getAttribute('right') === 'true') {
                target.removeAttribute('right');
                target.setAttribute('down', 'true');

                targetParent.setAttribute('expanded', 'true');
            } else if (target.getAttribute('down') === 'true') {
                target.removeAttribute('down');

                targetParent.removeAttribute('expanded');
                target.setAttribute('right', 'true');
            }
        };

        /**
         * Add visual selection to clicked "<li>" elements.
         * @param {Element} targetElement - DOM element
         * @private
         */
        ControlTree.prototype._selectTreeElement = function(targetElement) {
            var selectedList = this._controlTreeContainer.querySelector('[selected]');
            var target = _findNearestDOMParent(targetElement, 'LI');

            // Prevent tree element selection for allowing proper multiple tree element selection for copy/paste
            if (target.id === this._controlTreeContainer.id) {
                return;
            }

            if (selectedList) {
                selectedList.removeAttribute('selected');
            }

            target.setAttribute('selected', 'true');

            this._scrollToElement(target);
            this.onSelectionChanged(target.id);
        };

        /**
         * Scroll to element in the ControlTree.
         * @param {Element} target - DOM element to which need to be scrolled
         */
        ControlTree.prototype._scrollToElement = function(target) {
            var desiredViewBottomPosition = this._treeContainer.offsetHeight - this._treeContainer.offsetTop + this._treeContainer.scrollTop;

            if (target.offsetTop > desiredViewBottomPosition || target.offsetTop < this._treeContainer.scrollTop) {
                this._treeContainer.scrollTop = target.offsetTop - window.innerHeight / 6;
            }
        };

        /**
         * Search tree elements that match given criteria.
         * @param {string} userInput - Search criteria
         * @private
         */
        ControlTree.prototype._searchInTree = function(userInput) {
            var searchableElements = this._controlTreeContainer.querySelectorAll('[data-search]');
            var searchInput = userInput.toLocaleLowerCase();
            var elementInformation;

            for (var i = 0; i < searchableElements.length; i++) {
                elementInformation = searchableElements[i].getAttribute('data-search').toLocaleLowerCase();

                if (elementInformation.indexOf(searchInput) !== -1) {
                    searchableElements[i].parentNode.setAttribute('matching', true);
                } else {
                    searchableElements[i].parentNode.removeAttribute('matching');
                }
            }
        };

        /**
         * Remove  "matching" attribute from the search.
         * @private
         */
        ControlTree.prototype._removeAttributesFromSearch = function() {
            var elements = this._treeContainer.querySelectorAll('[matching]');

            for (var i = 0; i < elements.length; i++) {
                elements[i].removeAttribute('matching');
            }
        };

        /**
         * Visualize the number of elements which satisfy the search.
         * @private
         */
        ControlTree.prototype._setSearchResultCount = function(count) {
            this._filterContainer.querySelector('results').innerHTML = '(' + count + ')';
        };

        /**
         * Event handler for mouse click on a tree element arrow.
         * @param {Object} event - click event
         * @private
         */
        ControlTree.prototype._onArrowClick = function(event) {
            var target = event.target;

            if (target.nodeName === 'ARROW') {
                this._toggleCollapse(target);
            } else {
                this._selectTreeElement(target);
            }
        };

        /**
         * Event handler for user input in "search" input.
         * @param {Object} event - keyup event
         * @private
         */
        ControlTree.prototype._onSearchInput = function(event) {
            var target = event.target;
            var searchResultCount;

            if (target.getAttribute('search') !== null) {

                if (target.value.length !== 0) {
                    this._searchInTree(target.value);
                } else {
                    this._removeAttributesFromSearch('matching');
                }

                searchResultCount = this._treeContainer.querySelectorAll('[matching]').length;
                this._setSearchResultCount(searchResultCount);
            }
        };

        /**
         * Event handler for onsearch event.
         * @param {Object} event - onsearch event
         * @private
         */
        ControlTree.prototype._onSearchEvent = function(event) {
            var searchResultCount;

            if (event.target.value.length === 0) {
                this._removeAttributesFromSearch('matching');

                searchResultCount = this._treeContainer.querySelectorAll('[matching]').length;
                this._setSearchResultCount(searchResultCount);
            }

        };

        /**
         * Event handler for ControlTree options change.
         * @param {Object} event - click event
         * @private
         */
        ControlTree.prototype._onOptionsChange = function(event) {
            var target = event.target;

            if (target.getAttribute('filter') !== null) {
                if (target.checked) {
                    this._treeContainer.setAttribute('show-filtered-elements', true);
                } else {
                    this._treeContainer.removeAttribute('show-filtered-elements');
                }
            }

            if (target.getAttribute('namespaces') !== null) {
                if (target.checked) {
                    this._treeContainer.setAttribute('show-namespaces', true);
                } else {
                    this._treeContainer.removeAttribute('show-namespaces');
                }
            }

            if (target.getAttribute('attributes') !== null) {
                if (target.checked) {
                    this._treeContainer.setAttribute('show-attributes', true);
                } else {
                    this._treeContainer.removeAttribute('show-attributes');
                }
            }

        };

        /**
         * Event handler for mouse hover on tree element.
         * @param {Object} event - mouse event
         * @private
         */
        ControlTree.prototype._onTreeElementMouseHover = function(event) {
            var target = _findNearestDOMParent(event.target, 'LI');
            this.onHoverChanged(target.id);
        };

        /**
         * Create all event handlers for the ControlTree.
         * @private
         */
        ControlTree.prototype._createHandlers = function() {
            this._treeContainer.onclick = this._onArrowClick.bind(this);
            this._filterContainer.onkeyup = this._onSearchInput.bind(this);
            this._filterContainer.onsearch = this._onSearchEvent.bind(this);
            this._filterContainer.onchange = this._onOptionsChange.bind(this);
            this._controlTreeContainer.onmouseover = this._onTreeElementMouseHover.bind(this);
        };

        /**
         * Save references to ControlTree different sections.
         * @private
         */
        ControlTree.prototype._setReferences = function() {
            this._filterContainer = this._controlTreeContainer.querySelector(':scope > filter');
            this._treeContainer = this._controlTreeContainer.querySelector(':scope > tree');
        };

        module.exports = ControlTree;

    }, {}],
    3: [function(require, module, exports) {
        'use strict';

        var JSONFormatter = require('../ui/JSONFormatter');
        var DVHelper = require('../ui/helpers/DataViewHelper');

        /** @property {Object} data - Object in the following format:
         *  {
         *      object1: {
                    associations: 'Object' containing all the associations for the control
                    options: 'Object' containing the configuration for dataview
         *                      controlId: 'string'
         *                      expandable:'boolean',
         *                      expanded:'boolean',
         *                      title:'string',
         *                      showTypeInfo:'boolean', default is false
         *                      showTitle: 'boolean' default is true
         *                      editableValues: 'boolean' default is true
         *           data:'Object' with all the data to be represented visually
         *      },
         *  }
         *
         * If there is an object in the data section you have to repeat the object1 structure to be properly represented
         */

        /**
         * @param {string} target - id of the DOM container
         * @param {Object} options - initial configuration
         * @constructor
         */
        function DataView(target, options) {

            this._DataViewContainer = document.getElementById(target);

            // Initialize event handlers for editable fields
            this._onClickHandler();
            this._onEnterHandler();

            // When the field is editable this flag shows whether the value should be selected
            this._selectValue = true;

            /**
             * Method fired when the clicked element is an editable.
             * @param {Object} changedData - with the id of the selected control, property name and the new value
             */
            this.onPropertyUpdated = function(changedData) {};
            this.onPropertyDisplay = function(changedData) {

            };
            this.onEventDisplay = function(changedData) {

            }
            /**
             * Method fired when a clickable element is clicked.
             * @param {Object} event
             */
            this.onValueClick = function(event) {};

            if (options) {

                this.onPropertyUpdated = options.onPropertyUpdated || this.onPropertyUpdated;

                //dummy
                this.onPropertyDisplay = options.onPropertyDisplay || this.onPropertyDisplay;
                this.onEventDisplay = options.onEventDisplay || this.onEventDisplay;

                this.onValueClick = options.onValueClick || this.onValueClick;

                options.data ? this.setData(options.data) : undefined;
            }
        }

        /**
         * @param {Object} data - object structure as HTML
         */
        DataView.prototype.setData = function(data) {

            if (typeof data !== 'object') {
                return;
            }

            this._data = data;
            this._generateHTML();
        };

        /**
         * Get data model.
         * @returns {Object}
         */
        DataView.prototype.getData = function() {
            return this._data;
        };

        /**
         * Checks if any of the view objects contain any data to present.
         * @returns {boolean}
         * @private
         */
        DataView.prototype._isDataEmpty = function() {
            var viewObjects = this.getData();
            var isEmpty = true;

            if (!viewObjects) {
                return isEmpty;
            }

            for (var key in viewObjects) {
                if (DVHelper.getObjectLength(viewObjects[key].data)) {
                    isEmpty = false;
                    break;
                }
            }

            return isEmpty;
        };

        /**
         * Generates HTML string from an object.
         * @param {string} key
         * @param {Object|Array} currentElement
         * @returns {string}
         * @private
         */
        DataView.prototype._generateHTMLFromObject = function(key, currentElement) {
            var html = '';
            var tag = 'key';

            var options = currentElement.options;
            var data = currentElement.data;
            if (options.title) {
                key = options.title;
                tag = 'section-title';
            }
            //dummy
            if (options && data.parentTitle) {
                key = options.parentTitle;
                tag = 'section-parentTitle';
            }

            if (options && options.prevSiblingTitle) {
                key = options.prevSiblingTitle;
                tag = 'section-prevSiblingTitle';
            }
            if (options && options.nextSiblingTitle) {
                key = options.nextSiblingTitle;
                tag = 'section-nextSiblingTitle';
            }
            if (data && data.eventTitle) {
                key = data.eventTitle;
                tag = 'section-events';
            }
            if (DVHelper.getObjectLength(currentElement) && options.expandable) {
                html += DVHelper.addArrow(options.expanded);
            }

            html += DVHelper.wrapInTag(tag, key, {});

            if (options.showTypeInfo) {

                if (!options.hideTitle) {
                    html += ':&nbsp;';
                }

                html += DVHelper.addKeyTypeInfoBegin(currentElement.data);
            }
            html += DVHelper.closeLI();
            return html;
        };

        /**
         * Appends or skips the closing bracket for Object type.
         * @param {Object} currentElement - current element to present
         * @returns {string}
         * @private
         */
        DataView.prototype._generateHTMLForEndOfObject = function(currentElement) {
            var html = '';

            if (currentElement.options.showTypeInfo) {
                html += DVHelper.addKeyTypeInfoEnd(currentElement.data);
            }

            return html;
        };

        /**
         * Generates HTML string for a key value pair.
         * @param {string} key
         * @param {Object} currentView
         * @returns {string}
         * @private
         */
        DataView.prototype._generateHTMLForKeyValuePair = function(key, currentView) {
            var html = '';
            var value;
            if (currentView.data.properties) {
                value = currentView.data.properties[key].value;
            } else {
                value = currentView.data[key];
            }

            var options = currentView.options;
            var attributes = {};
            var valueHTML;

            if (options && options.editableValues) {
                attributes = {
                    'contentEditable': options.editableValues,
                    'data-control-id': options.controlId,
                    'data-property-name': key
                };
            }

            if (value && typeof value === 'object') {
                valueHTML = JSONFormatter.formatJSONtoHTML(value);
            } else {
                valueHTML = DVHelper.valueNeedsQuotes(value, DVHelper.wrapInTag('value', value, attributes));
            }

            html += DVHelper.wrapInTag('key', key) + ':&nbsp;' + valueHTML;
            //html += DVHelper.closeLI();
            return html;
        };

        /**
         * Generates a HTML string for one of the sections in the supplied object to be viewed.
         * @param {Object} viewObject
         * @returns {string}
         * @private
         */
        DataView.prototype._generateHTMLSection = function(viewObject) {
            var data = viewObject.data;
            var associations = viewObject.associations;
            var html = '';
            var options = viewObject.options;
            var isDataArray = Array.isArray(data);
            var lastArrayElement = data.length - 1;
            var prop;
            html += DVHelper.openUL(DVHelper.getULAttributesFromOptions(options));
            if (data.properties) {
                prop = data.properties;
            } else {
                prop = data;
            }
            for (var key in prop) {
                html += DVHelper.openLI();

                //var currentElement = data[key];
                var currentElement = prop[key];

                // Additional check for currentElement mainly to go around null values errors
                if (currentElement && currentElement.data) {

                    html += this._generateHTMLFromObject(key, currentElement);
                    html += this._generateHTMLSection(currentElement);
                    html += this._generateHTMLForEndOfObject(currentElement);
                } else if (currentElement && currentElement._isClickableValueForDataView) {
                    html += this._generateHTMLForKeyValuePair(key, DVHelper.formatValueForDataView(key, currentElement));
                } else {
                    //html += this._generateHTMLForKeyValuePair(key, viewObject);
                    html += this._generateHTMLForKeyValuePair(key, viewObject);
                }

                if (isDataArray && key < lastArrayElement) {
                    html += ',';
                }

                html += DVHelper.closeLI();
            }

            for (var name in associations) {
                var currentAssociation = associations[name];
                html += DVHelper.openLI();
                html += DVHelper.wrapInTag('key', name) + ':&nbsp;' + DVHelper.wrapInTag('value', currentAssociation);
                html += DVHelper.closeLI();
            }

            html += DVHelper.closeUL();
            return html;
        };



        //dummy
        //Customization-PoT
        /**
         * Generates the HTML string of parent element's data for one of the sections in the supplied object
         * @param {Object} viewObject with that for the DataView
         * @returns {string}
         * @private
         */
        DataView.prototype._getHTMLSectionForParent = function(viewObject) {
            var data = viewObject.data,
                assoc = viewObject.associations,
                html = '';

            var options = viewObject.options;
            var parProp = data.parentMProperty;
            html += DVHelper.openUL(
                DVHelper.getULAttributesFromOptions(options)
            );


            html += DVHelper.openLI();
            html += '<font color=firebrick>Properties of Parent</font>' + ':&nbsp;' + parProp;
            html += DVHelper.closeLI();

            html += DVHelper.closeUL();
            return html;
        };

        /**
         * Generates the HTML string of previous sibling element's data for one of the sections in the supplied object
         * @param {Object} viewObject with that for the DataView
         * @returns {string}
         * @private
         */
        DataView.prototype._getHTMLSectionForPrevSibling = function(viewObject) {
            var data = viewObject.data,
                assoc = viewObject.associations,
                html = '';

            var options = viewObject.options;
            var prevSiblingMProp = data.prevSiblingMProperty;

            /* html += DVHelper.openUL({
                attributes: DVHelper.getULAttributesFromOptions(options)
            }); */
            html += DVHelper.openUL(
                DVHelper.getULAttributesFromOptions(options)
            );
            html += DVHelper.openLI();
            html += '<font color=firebrick>Properties of Previous Sibling</font>' + ':&nbsp;' + prevSiblingMProp;
            html += DVHelper.closeLI();

            html += DVHelper.closeUL();


            return html;
        };

        /**
         * Generates the HTML string of next sibling element's data for one of the sections in the supplied object
         * @param {Object} viewObject with that for the DataView
         * @returns {string}
         * @private
         */
        DataView.prototype._getHTMLSectionForNextSibling = function(viewObject) {
            var data = viewObject.data,
                assoc = viewObject.associations,
                html = '';

            var options = viewObject.options;
            var nextSiblingMProp = data.nextSiblingMProperty;
            html += DVHelper.openUL(
                DVHelper.getULAttributesFromOptions(options)
            );
            //html+= "<ul expanded = 'true'>"; 
            html += DVHelper.openLI();
            html += '<font color=firebrick>Properties of Next Sibling</font>' + ':&nbsp;' + nextSiblingMProp;
            html += DVHelper.closeLI();

            html += DVHelper.closeUL();

            return html;
        };
        /**
         * Generates the HTML string of element's supported events for one of the sections in the supplied object
         * @param {Object} viewObject with that for the DataView
         * @returns {string}
         * @private
         */
        DataView.prototype._getHTMLSectionForEvents = function(viewObject) {
            var data = viewObject.data,
                assoc = viewObject.associations,
                html = '';

            var options = viewObject.options;
            var elemEvents = data.events;
            var eventarray = elemEvents.split(',');

            html += DVHelper.openUL(
                DVHelper.getULAttributesFromOptions(options)
            );

            html += DVHelper.openLI();
            html += '<font color=firebrick>Events supported by the element</font>' + ':&nbsp;<br/>';
            html += '<input id="hiddenIdEventsTab" type="hidden"  value="' + options.controlId + '">'
            for (var i = 0; i < eventarray.length; i++) {
                html += '<input type="checkbox" name="chb[]" value="' + eventarray[i] + '">' + eventarray[i] + '<br/>';
            }
            html += '<button value="Trigger event" id="getEvent" >Trigger Event </button>';
            html += '<button value="Get Blob" id="getBlob"  >Blob</button>';

            html += DVHelper.closeLI();
            html += DVHelper.closeUL();




            return html;
        };
        /**
         * Transform predefined Object to HTML.
         * @private
         */
        /* DataView.prototype._generateHTML = function () {
            var viewObjects = this.getData();
        	
        	
            var html = '';
            var noAvailableData = DVHelper.wrapInTag('no-data', 'No Available Data');

            if (this._isDataEmpty()) {
                this._DataViewContainer.innerHTML = noAvailableData;
                return;
            }

            // Go trough all the objects on the top level in the data structure and
            // skip the ones that does not have anything to display
            for (var key in viewObjects) {
        		
                var currentObject = viewObjects[key];
        		var parTitle = currentObject.data.parentTitle;
        		var prevSibTitle = currentObject.data.prevSiblingTitle;
        		var nextSibTitle = currentObject.data.nextSiblingTitle;
        		var eventTitle = currentObject.data.eventTitle;
        		//alert("title: "+(eventTitle == null));
        		//alert("length: "+(parTitle.length));
                if (!DVHelper.getObjectLength(currentObject.data)) {
        			alert(true + " : "+ currentObject.data);
              	    html += this._addSectionTitle(currentObject, DVHelper.getNoDataHTML(noAvailableData));
                 	continue;
        		              
                }
        		if((eventTitle == null || eventTitle.length === 0))
        	      {
        			  
        			    alert("event");
        	         	html += this._addSectionTitle(currentObject, this._generateHTMLSection(currentObject));
        		  }
        		 
        		  
        		 if(!(parTitle == null || parTitle.length === 0))
                  {
        			  alert(parTitle.length);
        			  alert(parTitle);
        			 
                  	html += this._addSectionParentTitle(currentObject, this._getHTMLSectionForParent(currentObject));
                  } 
        		   if(!(prevSibTitle == null || prevSibTitle.length === 0))
                  {
               	 	html += this._addSectionPrevSiblingTitle(currentObject, this._getHTMLSectionForPrevSibling(currentObject));
              	  }
              	  if(!(nextSibTitle == null || nextSibTitle.length === 0))
              	  {
             	 	html += this._addSectionNextSiblingTitle(currentObject, this._getHTMLSectionForNextSibling(currentObject));
            	  } 
        		 if(!(eventTitle == null || eventTitle.length === 0))
              	  {
             	 	html += this._addSectionEventTitle(currentObject, this._getHTMLSectionForEvents(currentObject));
            	  } 
         
            }

            this._DataViewContainer.innerHTML = html;
        }; */


        DataView.prototype._generateHTML = function() {
            var viewObjects = this.getData();


            var html = '';
            var noAvailableData = DVHelper.wrapInTag('no-data', 'No Available Data');

            if (this._isDataEmpty()) {
                this._DataViewContainer.innerHTML = noAvailableData;
                return;
            }

            // Go trough all the objects on the top level in the data structure and
            // skip the ones that does not have anything to display
            for (var key in viewObjects) {

                var currentObject = viewObjects[key];
                var parTitle = currentObject.data.parentTitle;
                var prevSibTitle = currentObject.data.prevSiblingTitle;
                var nextSibTitle = currentObject.data.nextSiblingTitle;
                var eventTitle = currentObject.data.eventTitle;
                //alert("title: "+(eventTitle == null));
                //alert("length: "+(parTitle.length));
                if (!DVHelper.getObjectLength(currentObject.data)) {

                    html += this._addSectionTitle(currentObject, DVHelper.getNoDataHTML(noAvailableData));
                    continue;

                }
                if ((eventTitle == null || eventTitle.length === 0)) {


                    html += this._addSectionTitle(currentObject, this._generateHTMLSection(currentObject));
                }


                if (!(parTitle == null || parTitle.length === 0)) {


                    html += this._addSectionParentTitle(currentObject, this._getHTMLSectionForParent(currentObject));
                }
                if (!(prevSibTitle == null || prevSibTitle.length === 0)) {
                    html += this._addSectionPrevSiblingTitle(currentObject, this._getHTMLSectionForPrevSibling(currentObject));
                }
                if (!(nextSibTitle == null || nextSibTitle.length === 0)) {
                    html += this._addSectionNextSiblingTitle(currentObject, this._getHTMLSectionForNextSibling(currentObject));
                }
                if (!(eventTitle == null || eventTitle.length === 0)) {
                    html += this._addSectionEventTitle(currentObject, this._getHTMLSectionForEvents(currentObject));
                }

            }

            this._DataViewContainer.innerHTML = html;
        };

        /**
         * Adds a title to a section from a view object when transformed to HTML.
         * @param {Object} config
         * @param {string} htmlPart
         * @returns {string}
         * @private
         */
        DataView.prototype._addSectionTitle = function(config, htmlPart) {
            var html = '';
            var options = config.options;
            var data = config.data;

            if (options.hideTitle) {
                return htmlPart;
            }

            html += DVHelper.openUL(DVHelper.getULAttributesFromOptions(options));
            html += DVHelper.openLI();

            if (config.options.expandable) {
                html += DVHelper.addArrow(options.expanded);
            }

            html += DVHelper.wrapInTag('section-title', options.title);
            html += DVHelper.closeLI();
            html += htmlPart;

            html += DVHelper.closeUL();

            return html;
        };


        //dummy
        //Customization-PoT
        /**
         * Adds a parent title to a section from the object when transformed to HTML
         * @param {Object} config
         * @param {string} htmlPart
         * @returns {string}
         * @private
         */
        DataView.prototype._addSectionParentTitle = function(config, htmlPart) {
            var html = '';

            var options = config.options;
            var data = config.data;
            if (options.hideTitle) {
                return htmlPart;
            }
            html += DVHelper.openUL(DVHelper.getULAttributesFromOptions(options));
            html += DVHelper.openLI();


            if (config.options.expandable) {
                html += DVHelper.addArrow(options.expanded);
            }
            html += DVHelper.wrapInTag('section-parentTitle', data.parentTitle);
            html += htmlPart;
            html += DVHelper.closeLI();
            html += DVHelper.closeUL();


            return html;
        };

        /**
         * Adds a Previous sibling title to a section from the object when transformed to HTML
         * @param {Object} config
         * @param {string} htmlPart
         * @returns {string}
         * @private
         */

        DataView.prototype._addSectionPrevSiblingTitle = function(config, htmlPart) {
            var html = '';


            var options = config.options;
            var data = config.data;
            if (options.hideTitle) {
                return htmlPart;
            }


            html += DVHelper.openUL(DVHelper.getULAttributesFromOptions(options));
            html += DVHelper.openLI();



            if (config.options.expandable) {
                html += DVHelper.addArrow(options.expanded);
            }

            html += DVHelper.wrapInTag('section-prevSiblingTitle', data.prevSiblingTitle);
            html += htmlPart;
            html += DVHelper.closeLI();
            html += DVHelper.closeUL();



            return html;
        };


        /**
         * Adds a next sibling title to a section from the object when transformed to HTML
         * @param {Object} config
         * @param {string} htmlPart
         * @returns {string}
         * @private
         */

        DataView.prototype._addSectionNextSiblingTitle = function(config, htmlPart) {
            var html = '';


            var options = config.options;
            var data = config.data;
            if (options.hideTitle) {
                return htmlPart;
            }

            html += DVHelper.openUL(DVHelper.getULAttributesFromOptions(options));
            html += DVHelper.openLI();


            if (config.options.expandable) {
                html += DVHelper.addArrow(options.expanded);
            }
            html += DVHelper.wrapInTag('section-nextSiblingTitle', data.nextSiblingTitle);
            html += htmlPart;
            html += DVHelper.closeLI();
            html += DVHelper.closeUL();


            return html;
        };

        /**
         * Adds a event title to a section from the object when transformed to HTML
         * @param {Object} config
         * @param {string} htmlPart
         * @returns {string}
         * @private
         */
        DataView.prototype._addSectionEventTitle = function(config, htmlPart) {
            var html = '';


            var options = config.options;
            var data = config.data;
            if (options.hideTitle) {
                return htmlPart;
            }

            html += DVHelper.openUL(DVHelper.getULAttributesFromOptions(options));
            html += DVHelper.openLI();

            if (config.options.expandable) {
                html += DVHelper.addArrow(options.expanded);
            }
            html += DVHelper.wrapInTag('section-events', data.eventTitle);
            html += htmlPart;
            html += DVHelper.closeLI();
            html += DVHelper.closeUL();


            return html;
        };
        /**
         * @param {HTMLElement} element
         * @returns {boolean} if value is editable
         * @private
         */
        DataView.prototype._isEditableValue = function(element) {
            return element.nodeName === 'VALUE' && element.contentEditable === 'true';
        };



        /**
         * Mouse click event handler for the editable values.
         * @private
         */
        DataView.prototype._onClickHandler = function() {
            var that = this;

            /**
             * Handler for mouse click.
             * @param {Object} event
             */
            this._DataViewContainer.onclick = function(event) {
                var targetElement = event.target;
                var target = DVHelper.findNearestDOMElement(targetElement, 'LI');

                if (!target) {
                    return;
                }

                DVHelper.toggleCollapse(target);

                if (that._isEditableValue(targetElement)) {
                    that._onBlurHandler(targetElement);
                    DVHelper.selectEditableContent(targetElement, that._selectValue);
                    that._selectValue = false;
                }

                if (targetElement.nodeName === 'CLICKABLE-VALUE') {
                    var attributes = event.target.attributes;
                    var key = attributes.key.value;
                    var parent = attributes.parent.value;
                    var eventData = that.getData()[parent].data[key].eventData;

                    that.onValueClick({
                        target: key,
                        data: eventData
                    });
                }

            };
        };

        /**
         * Enter button event handler for the editable values.
         * @private
         */
        DataView.prototype._onEnterHandler = function() {
            var that = this;

            /**
             * Handler for key down.
             * @param {Object} e
             */
            this._DataViewContainer.onkeydown = function(e) {
                if (!that._isEditableValue(e.target)) {
                    return;
                }

                that._onBlurHandler(e.target);
                DVHelper.selectEditableContent(e.target, that._selectValue);
                that._selectValue = false;

                if (e.keyCode === 13) {
                    e.preventDefault();
                    document.getSelection().empty();
                    e.target.blur();
                }
            };
        };

        /**
         * Blur event handler for the editable values.
         * @param {element} target - HTML DOM element
         * @private
         */
        DataView.prototype._onBlurHandler = function(target) {
            var that = this;

            if (!target) {
                return;
            }

            /**
             * Handler for blur event.
             * @param {Object} e
             */
            target.onblur = function(e) {
                var propertyData = {};
                var target = e.target;
                var propertyName;
                var value;

                propertyData.controlId = target.getAttribute('data-control-id');

                propertyName = target.getAttribute('data-property-name');
                propertyData.property = propertyName.charAt(0).toUpperCase() + propertyName.slice(1);

                value = target.textContent.trim();
                propertyData.value = DVHelper.getCorrectedValue(value);

                that.onPropertyUpdated(propertyData);

                target.removeEventListener('onblur', this);
                that._selectValue = true;
            };
        };

        module.exports = DataView;

    }, {
        "../ui/JSONFormatter": 4,
        "../ui/helpers/DataViewHelper": 7
    }],
    4: [function(require, module, exports) {
        'use strict';

        /**
         * Sample usage
         * JSONView = require('../../../modules/ui/JSONFormatter.js');
         * JSONViewFormater.formatJSONtoHTML(sampleJSONData);
         */

        /**
         *
         * @param {Object} json
         * @returns {string|HTML}
         * @private
         */
        function _syntaxHighlight(json) {
            json = JSON.stringify(json, undefined, 2);
            json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
                var tagName = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        tagName = 'key';
                    } else {
                        tagName = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    tagName = 'boolean';
                } else if (/null/.test(match)) {
                    tagName = 'null';
                }
                return '<' + tagName + '>' + match + '</' + tagName + '>';
            });
        }

        module.exports = {

            /**
             * Create HTML from a json object.
             * @param {Object} json
             * @returns {string}
             */
            formatJSONtoHTML: function(json) {
                return '<pre json>' + _syntaxHighlight(json) + '</pre>';
            }
        };

    }, {}],
    5: [function(require, module, exports) {
        'use strict';

        /**
         * Returns the HTML for the divider.
         * @returns {string}
         * @private
         */
        function _getResizeHolderHTML() {
            return '<divider><handler class="resize-handler"></handler></divider>';
        }

        /**
         * Manage the display style of the start container.
         * @param {elements} _splitterInstance
         * @param {boolean} skipSizing
         * @private
         */
        function _applyInlineStylesForStartContainer(_splitterInstance, skipSizing) {
            var $start = _splitterInstance.$this.querySelector('start');

            $start.style.display = _splitterInstance._hideStartContainer ? 'none' : '';
            if (!skipSizing) {
                $start.style.width = _splitterInstance._startContainerWidth || undefined;
                $start.style.height = _splitterInstance._startContainerHeight || undefined;
            }
        }

        /**
         * Manage the display style of the end container.
         * @param {elements} _splitterInstance
         * @param {boolean} skipSizing
         * @private
         */
        function _applyInlineStylesForEndContainer(_splitterInstance, skipSizing) {
            var $end = _splitterInstance.$this.querySelector('end');

            $end.style.display = _splitterInstance._hideEndContainer ? 'none' : '';
            if (!skipSizing) {
                $end.style.width = _splitterInstance._endContainerWidth || undefined;
                $end.style.height = _splitterInstance._endContainerHeight || undefined;
            }
        }

        /**
         * Manage the display style of a close button.
         * @param {element} _splitterInstance
         * @private
         */
        function _applyInlineStylesForCloseButton(_splitterInstance) {
            var $closeButton = _splitterInstance.$this.querySelector('close-button');

            if ($closeButton) {
                if (_splitterInstance._hideEndContainer) {
                    $closeButton.style.display = 'none';
                } else {
                    $closeButton.style.display = 'block';
                }
            }
        }

        /**
         *
         * @param {element} _splitterInstance
         * @param {boolean} _skipSizing
         * @private
         */
        function _applyInlineStyles(_splitterInstance, _skipSizing) {
            var that = _splitterInstance;
            var $end = that.$this.querySelector('end');
            var skipSizing = _skipSizing || false;

            if (that._isEndContainerClosable) {
                $end.setAttribute('verticalScrolling', 'true');
            }

            if (that._endContainerTitle) {
                $end.setAttribute('withHeader', 'true');
            }

            _applyInlineStylesForStartContainer(_splitterInstance, skipSizing);
            _applyInlineStylesForEndContainer(_splitterInstance, skipSizing);
            _applyInlineStylesForCloseButton(_splitterInstance);
        }

        /**
         *
         * @param {element} splitterInstance
         * @private
         */
        function _createEndContainerHeader(splitterInstance) {
            var endContainerHeader = document.createElement('header');
            endContainerHeader.innerHTML = splitterInstance._endContainerTitle;

            splitterInstance.$this.querySelector('end').appendChild(endContainerHeader);
        }

        /**
         *
         * @param {element} splitterInstance
         * @private
         */
        function _createCloseButton(splitterInstance) {
            var closeButtonElement = document.createElement('close-button');
            splitterInstance.$this.querySelector('end').appendChild(closeButtonElement);

            closeButtonElement.onclick = splitterInstance.hideEndContainer.bind(splitterInstance);
        }

        /**
         * The complete Splitter Options.
         * @typedef {Object} splitterOptions
         * @property {boolean} hideStartContainer - the start dom element will not be rendered (display: none)
         * @property {boolean} hideEndContainer - the end dom element will not be rendered (display: none)
         * @property {boolean} isEndContainerClosable - additional close-button for closing the end element
         * @property {string} startContainerWidth - custom width of the start element
         * @property {string} startContainerHeight - custom height of the start element
         * @property {string} endContainerWidth - custom width of the end element
         * @property {string} endContainerHeight - custom height of the end element
         */

        /**
         * Splitter component.
         * @param {string} domId
         * @param {splitterOptions} options
         * @constructor
         */
        function SplitContainer(domId, options) {
            this._setReferences(domId);

            /**
             * If options is given and hideStartContainer is true the start (dom) element of the splitter will be hidden (display: none).
             * @type {boolean}
             * @private
             */
            this._hideStartContainer = options && options.hideStartContainer;
            /**
             * If options is given and hideStartContainer is true the end (dom) element of the splitter will be hidden (display: none).
             * @type {boolean}
             * @private
             */
            this._hideEndContainer = options && options.hideEndContainer;
            /**
             * Shows a close button for the end (dom) element of the splitter.
             * @type {boolean}
             * @private
             */
            this._isEndContainerClosable = options && options.isEndContainerClosable;
            /**
             * Set the width and height of the splitter start and end elements.
             */
            this._startContainerWidth = options && options.startContainerWidth ? options.startContainerWidth : undefined;
            this._startContainerHeight = options && options.startContainerHeight ? options.startContainerHeight : undefined;
            this._endContainerWidth = options && options.endContainerWidth ? options.endContainerWidth : undefined;
            this._endContainerHeight = options && options.endContainerHeight ? options.endContainerHeight : undefined;
            this._endContainerTitle = options && options.endContainerTitle ? options.endContainerTitle : undefined;

            _applyInlineStyles(this);

            if (this._endContainerTitle) {
                _createEndContainerHeader(this);
            }

            if (this._isEndContainerClosable) {
                _createCloseButton(this);
            }

            /** @type {boolean}*/
            this.isVerticalSplitter = this.$this.getAttribute('orientation') === 'vertical';

            /**
             * Place the resize holder HTML right after the 'start' element
             */
            this.$this.querySelector(':scope > start').insertAdjacentHTML('afterend', _getResizeHolderHTML());

            this.$this.querySelector('handler').onmousedown = this._mouseDownHandler.bind(this);
        }

        /**
         * Hide end container.
         */
        SplitContainer.prototype.hideEndContainer = function() {
            this._hideEndContainer = true;
            _applyInlineStyles(this, true);
        };

        /**
         * Show end container.
         */
        SplitContainer.prototype.showEndContainer = function() {
            this._hideEndContainer = false;
            _applyInlineStyles(this, true);
        };

        /**
         * Handler for mousemove.
         * @param {Object} event
         * @private
         */
        SplitContainer.prototype._mouseMoveHandler = function(event) {
            var that = this;
            var endContainerSize;
            var windowWidth = window.innerWidth;
            var windowHeight = window.innerHeight;

            if (that.isVerticalSplitter) {
                endContainerSize = windowHeight - event.clientY;
                that._$endElement.style.height = endContainerSize + 'px';
                that._$startElement.style.height = (windowHeight - endContainerSize) + 'px';
            } else {
                endContainerSize = windowWidth - event.clientX;
                that._$endElement.style.width = endContainerSize + 'px';
                that._$startElement.style.width = (windowWidth - endContainerSize) + 'px';
            }
        };

        /**
         * Handler for onmouseup.
         * @private
         */
        SplitContainer.prototype._mouseUpHandler = function() {
            this.$this.onmousemove = null;
            document.body.classList.remove('user-is-resizing-vertically');
            document.body.classList.remove('user-is-resizing-horizontally');
        };

        /**
         * Handler for onmousedown.
         * @param {Object} event
         * @private
         */
        SplitContainer.prototype._mouseDownHandler = function(event) {
            var that = this;

            event.preventDefault();
            event.stopPropagation();

            // Add class to disable selection of dom elements while dragging
            if (that.isVerticalSplitter) {
                document.body.classList.add('user-is-resizing-vertically');
            } else {
                document.body.classList.add('user-is-resizing-horizontally');
            }

            /**
             * Handler for onmousemove.
             * @param {Object} event
             */
            that.$this.onmousemove = function(event) {
                window.requestAnimationFrame(that._mouseMoveHandler.bind(that, event));
            };

            that.$this.onmouseup = that._mouseUpHandler.bind(that);
        };

        /**
         * Save references for SplitContainer different HTML elements.
         * @private
         */
        SplitContainer.prototype._setReferences = function(domId) {
            this.$this = document.getElementById(domId);
            this._$endElement = this.$this.querySelector(':scope > end');
            this._$startElement = this.$this.querySelector(':scope > start');
        };

        module.exports = SplitContainer;

    }, {}],
    6: [function(require, module, exports) {
        'use strict';

        /**
         * TabBar.
         * @param {string} containerId
         * @constructor
         */
        function TabBar(containerId) {
            this._container = document.getElementById(containerId);
            this._contentsContainer = this._container.querySelector('contents');
            this._tabsContainer = this._container.querySelector('tabs');
            this.init();
        }

        /**
         * Initialize TabBar.
         */
        TabBar.prototype.init = function() {
            this.setActiveTab(this.getActiveTab());

            // Add event handler on the tab container
            this._tabsContainer.onclick = this._onTabsClick.bind(this);
        };

        /**
         * Get current active tab ID.
         * @returns {string}
         */
        TabBar.prototype.getActiveTab = function() {
            return this._activeTabId ? this._activeTabId : this._tabsContainer.querySelector('[selected]').id;
        };

        /**
         * Set active tab ID.
         * @param {string} newActiveTabId
         * @returns {TabBar}
         */
        TabBar.prototype.setActiveTab = function(newActiveTabId) {
            if (!newActiveTabId) {
                return;
            }

            if (typeof newActiveTabId !== 'string') {
                console.warn('parameter error: The parameter must be a string');
                return;
            }

            if (!this._tabsContainer.querySelector('#' + newActiveTabId)) {
                console.warn('parameter error: The parameter must be a valid ID of a child tab element');
                return;
            }

            // Check for double clicking on active tab
            if (newActiveTabId === this.getActiveTab()) {
                var activeContent = this._contentsContainer.querySelector('[for="' + this.getActiveTab() + '"]');

                if (activeContent.getAttribute('selected')) {
                    return;
                }
            }

            this._changeActiveTab(newActiveTabId);
            this._activeTabId = newActiveTabId;

            return this;
        };

        /**
         * Event handler for mouse click on a tabs.
         * @param {Object} event - click event
         * @private
         */
        TabBar.prototype._onTabsClick = function(event) {
            var targetID = event.target.id;
            this.setActiveTab(targetID);
        };

        /**
         * Change visible tab and content.
         * @param {string} tabId - The Id of the desired tab
         */
        TabBar.prototype._changeActiveTab = function(tabId) {
            var currentActiveTab = this._tabsContainer.querySelector('[selected]');
            var currentActiveContent = this._contentsContainer.querySelector('[for="' + this.getActiveTab() + '"]');
            var newActiveTab = this._tabsContainer.querySelector('#' + tabId);
            var newActiveContent = this._contentsContainer.querySelector('[for="' + tabId + '"]');

            currentActiveTab.removeAttribute('selected');
            currentActiveContent.removeAttribute('selected');

            newActiveTab.setAttribute('selected', 'true');
            newActiveContent.setAttribute('selected', 'true');
        };

        module.exports = TabBar;

    }, {}],
    7: [function(require, module, exports) {
        'use strict';

        /**
         * Generates attributes in HTML.
         * @param {Object} attributes
         * @returns {string}
         * @private
         */
        function _generateTagAttributes(attributes) {

            var html = '';
            if (attributes) {
                for (var key in attributes) {
                    html += ' ' + key + '="' + attributes[key] + '"';
                }
            }
            return html;
        }

        /**
         * @param {Object} attributes
         * @returns {string}
         * @private
         */
        function _openUL(attributes) {
            var html = '';
            var attributesHTML = _generateTagAttributes(attributes);

            html = '<ul' + attributesHTML + '>';
            return html;
        }

        /**
         * Create "ul" closing tag.
         * @returns {string}
         * @private
         */
        function _closeUL() {
            return '</ul>';
        }

        /**
         * Create "li" opening tag.
         * @returns {string}
         * @private
         */
        function _openLI() {
            return '<li>';
        }

        /**
         * Create "li" closing tag.
         * @returns {string}
         * @private
         */
        function _closeLI() {
            return '</li>';
        }

        /**
         * @param {Object|Array} element
         * @returns {number}
         * @private
         */
        function _getObjectLength(element) {

            if (element && typeof element === 'object') {

                return Object.keys(element).length;
            }

            return 0;
        }

        /**
         * @param {boolean} isExpanded - configures the direction of the arrow
         * @returns {string}
         * @private
         */
        function _addArrow(isExpanded) {
            var direction = isExpanded ? 'down' : 'right';
            return '<arrow ' + direction + '="true"></arrow>';
        }

        /**
         * @param {string} tag - name of HTML tag
         * @param {string|number|boolean} value
         * @param {Object} attributes
         * @returns {string}
         * @private
         */
        function _wrapInTag(tag, value, attributes) {
            var html = '';

            if (!tag || typeof tag !== 'string') {
                return html;
            }

            html += '<' + tag;
            html += _generateTagAttributes(attributes);
            html += '>' + value + '</' + tag + '>';
            return html;
        }

        /**
         * Check if property value needs quotes.
         * @param {string|boolean|number|null} value
         * @param {string} valueWrappedInHTML
         * @returns {string|boolean|number|null}
         * @private
         */
        function _valueNeedsQuotes(value, valueWrappedInHTML) {

            if (typeof value === 'string') {
                return '&quot;' + valueWrappedInHTML + '&quot;';
            }

            return valueWrappedInHTML;
        }

        /**
         * @param {Array|Object} element
         * @returns {string}
         * @private
         */
        function _addKeyTypeInfoBegin(element) {

            if (Array.isArray(element)) {
                return '[';
            }

            return '{';
        }

        /**
         * @param {Array|Object} element
         * @returns {string}
         * @private
         */
        function _addKeyTypeInfoEnd(element) {
            var html = '';
            var noOfElements = _getObjectLength(element);
            var collapsedInfo = Array.isArray(element) ? noOfElements : '...';

            if (noOfElements) {
                html += _wrapInTag('collapsed-typeinfo', collapsedInfo);
            }

            if (Array.isArray(element)) {
                html += ']';
            } else {
                html += '}';
            }

            return html;
        }

        /**
         * Search for the nearest parent Node within the bounds of the DATA-VIEW parent.
         * @param {element} element - HTML DOM element that will be the root of the search
         * @param {string} targetElementName - The desired HTML parent element nodeName
         * @returns {Object} HTML DOM element
         * @private
         */
        function _findNearestDOMElement(element, targetElementName) {
            while (element.nodeName !== targetElementName) {
                if (element.nodeName === 'DATA-VIEW') {
                    element = undefined;
                    break;
                }
                element = element.parentNode;
            }

            return element;
        }

        /**
         * @param {element} target - HTML DOM element
         * @returns {boolean}
         * @private
         */
        function _toggleCollapse(target) {
            var expandableLIChild = target.querySelector(':scope > ul');
            var arrow = target.querySelector(':scope > arrow');

            if (!arrow) {
                return false;
            }

            if (arrow.getAttribute('right') === 'true') {
                arrow.removeAttribute('right');
                arrow.setAttribute('down', 'true');

                expandableLIChild.setAttribute('expanded', 'true');
            } else if (arrow.getAttribute('down') === 'true') {
                arrow.removeAttribute('down');
                arrow.setAttribute('right', 'true');

                expandableLIChild.removeAttribute('expanded');
            }

            return true;
        }

        /**
         * Get the needed attributes for an opening UL tag.
         * @param {Object} options
         * @returns {Object}
         * @private
         */
        function _getULAttributesFromOptions(options) {
            var attributes = {};

            if (options.expandable) {
                attributes.expandable = 'true';
            }

            if (options.expanded) {
                attributes.expanded = 'true';
            }

            return attributes;
        }

        /**
         * Appropriately wraps in HTML the No Available Data text.
         * @param {string} html
         * @returns {string}
         * @private
         */
        function _getNoDataHTML(html) {
            var htmlString = '';
            htmlString += _openUL({
                'expanded': 'true'
            });
            htmlString += _openLI();
            htmlString += html;
            htmlString += _closeLI();
            htmlString += _closeUL();

            return htmlString;
        }

        /**
         * This function selects the content of an editable value holder.
         * @param {HTMLElement} element
         * @param {boolean} shouldSelect
         * @returns {Range} range the range that is selected
         * @private
         */
        function _selectEditableContent(element, shouldSelect) {
            if (shouldSelect) {
                var range = document.createRange();
                range.selectNodeContents(element);
                var selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);

                return range;
            }
        }

        /**
         *
         * @param {string} key
         * @param {Object} currentElement
         * @returns {Object}
         * @private
         */
        function _formatValueForDataView(key, currentElement) {
            var requiredFormat = {
                data: {}
            };
            requiredFormat.data[key] = currentElement.value;

            return requiredFormat;
        }

        /**
         * Determines if value is boolean, number or string.
         * @param {string|number|boolean} value
         * @returns {boolean|string|number}
         * @private
         */
        function _getCorrectedValue(value) {

            if (value === 'true' || value === 'false') {
                value = (value === 'true');
            } else if (value === '') {
                value = null;
            } else if (!isNaN(+value) && value !== null) {
                value = +value;
            }

            return value;
        }

        module.exports = {
            addArrow: _addArrow,
            addKeyTypeInfoBegin: _addKeyTypeInfoBegin,
            addKeyTypeInfoEnd: _addKeyTypeInfoEnd,
            closeLI: _closeLI,
            closeUL: _closeUL,
            findNearestDOMElement: _findNearestDOMElement,
            formatValueForDataView: _formatValueForDataView,
            getCorrectedValue: _getCorrectedValue,
            getObjectLength: _getObjectLength,
            getULAttributesFromOptions: _getULAttributesFromOptions,
            getNoDataHTML: _getNoDataHTML,
            openUL: _openUL,
            openLI: _openLI,
            selectEditableContent: _selectEditableContent,
            toggleCollapse: _toggleCollapse,
            wrapInTag: _wrapInTag,
            valueNeedsQuotes: _valueNeedsQuotes
        };

    }, {}],
    8: [function(require, module, exports) {
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