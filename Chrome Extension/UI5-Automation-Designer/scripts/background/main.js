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
				if (!u && a)
					return a(o, !0);
				if (i)
					return i(o, !0);
				var f = new Error("Cannot find module '" + o + "'");
				throw f.code = "MODULE_NOT_FOUND",
				f
			}
			var l = n[o] = {
				exports: {}
			};
			t[o][0].call(l.exports, function (e) {
				var n = t[o][1][e];
				return s(n ? n : e)
			}, l, l.exports, e, t, n, r)
		}
		return n[o].exports
	}
	var i = typeof require == "function" && require;
	for (var o = 0; o < r.length; o++)
		s(r[o]);
	return s
})({
	1: [function (require, module, exports) {
			(function () {
				'use strict';

				var utils = require('../modules/utils/utils.js');
				var messenger = require('../modules/background/messenger.js');
				var ContextMenu = require('../modules/background/ContextMenu.js');
				var pageAction = require('../modules/background/pageAction.js');

				var contextMenu = new ContextMenu({
						title: 'Inspect UI5 control',
						id: 'context-menu',
						contexts: ['all']
					});

				/**
				 * This method will be fired when an instanced is clicked. The idea is to be overwritten from the instance.
				 * @param {Object} info - Information sent when a context menu item is clicked. Check chrome.contextMenus.onClicked.
				 * @param {Object} tab - The details of the tab where the click took place.
				 */
				contextMenu.onClicked = function (info, tab) {
					messenger.sendToAll({
						action: 'on-contextMenu-control-select',
						target: contextMenu._rightClickTarget
					}, tab.id);
				};

				// Name space for message handler functions.
				var messageHandler = {

					/**
					 * Create an icons with hover information inside the address bar.
					 * @param {Object} message
					 * @param {Object} messageSender
					 */
					'on-ui5-detected': function (message, messageSender) {
						var framework = message.framework;

						if (message.isVersionSupported === true) {
							pageAction.create({
								version: framework.version,
								framework: framework.name,
								tabId: messageSender.sender.tab.id
							});
						}

					},

					/**
					 * Inject script into the inspected page.
					 * @param {Object} message
					 */
					'do-script-injection': function (message) {
						chrome.tabs.executeScript(message.tabId, {
							file: message.file
						});
					},

					/**
					 * Set the element that was clicked with the right button of the mouse.
					 * @param {Object} message
					 */
					'on-right-click': function (message) {
						contextMenu.setRightClickTarget(message.target);
					},

					/**
					 * Create the button for the context menu, when the user switches to the "UI5" panel.
					 * @param {Object} message
					 */
					'on-ui5-devtool-show': function (message) {
						contextMenu.create();
					},

					/**
					 * Delete the button for the context menu, when the user switches away to the "UI5" panel.
					 * @param {Object} message
					 */
					'on-ui5-devtool-hide': function (message) {
						contextMenu.removeAll();
					}
				};

				/**
				 * Add handler for resolving messages from the other scripts.
				 * @param {Object} port - An object which allows two way communication with other scripts/pages.
				 * @param {string} tabId - The tab ID of the current inspected page.
				 * @private
				 */
				function _listenForPortMessages(port, tabId) {
					port.onMessage.addListener(function (message, messageSender, sendResponse) {
						// Resolve incoming messages
						utils.resolveMessage({
							message: message,
							messageSender: messageSender,
							sendResponse: sendResponse,
							actions: messageHandler
						});

						// Send message to all ports
						messenger.sendToAll(message, tabId);
					});
				}

				/**
				 * Delete the disconnected port from 'ports' object.
				 * @param {Object} port - An object which allows two way communication with other scripts/pages.
				 * @param {string} tabId - The tab ID of the current inspected page.
				 * @private
				 */
				function _listenForPortDisconnect(port, tabId) {
					port.onDisconnect.addListener(function (port) {
						messenger.deletePort(port, tabId);

						// Delete the context menu when devtools is closed
						if (port.name.indexOf('devtools-initialize') !== -1) {
							contextMenu.removeAll();
						}
					});
				}

				/**
				 * Save the connected port and attache the needed event listeners.
				 * @param {Object} port - An object which allows two way communication with other scripts/pages.
				 * @param {string} tabId - The tab ID of the current inspected page.
				 * @private
				 */
				function _setPort(port, tabId) {
					messenger.addPort(port, tabId);
					_listenForPortMessages(port, tabId);
					_listenForPortDisconnect(port, tabId);
				}

				// Listens for messages from devtools panel and content scripts
				chrome.runtime.onConnect.addListener(function (port) {
					var splitPortName = port.name.split('-');
					var tabId;

					if (port.name.indexOf('tabId') !== -1) {
						tabId = splitPortName[splitPortName.length - 1];
					} else {
						tabId = port.sender.tab.id;
					}

					_setPort(port, tabId);
				});
			}
				());

		}, {
			"../modules/background/ContextMenu.js": 2,
			"../modules/background/messenger.js": 3,
			"../modules/background/pageAction.js": 4,
			"../modules/utils/utils.js": 5
		}
	],
	2: [function (require, module, exports) {
			'use strict';

			/**
			 * Context menu.
			 * @param {Object} options
			 * @constructor
			 */
			function ContextMenu(options) {
				this._title = options.title;
				this._id = options.id;
				this._contexts = options.contexts;

				/**
				 * This method will be fired when an instanced is clicked. The idea is to be overwritten from the instance.
				 * @param {Object} info - Information sent when a context menu item is clicked.
				 * @param {Object} tab - The details of the tab where the click took place. If the click did not take place in a tab,
				 * this parameter will be missing.
				 */
				this.onClicked = function (info, tab) {};
			}

			/**
			 * Create context menu item.
			 */
			ContextMenu.prototype.create = function () {
				var that = this;

				chrome.contextMenus.create({
					title: that._title,
					id: that._id,
					contexts: that._contexts
				});

				chrome.contextMenus.onClicked.addListener(that._onClickHandler.bind(that));
			};

			/**
			 * Delete all context menu items.
			 */
			ContextMenu.prototype.removeAll = function () {
				chrome.contextMenus.removeAll();
			};

			/**
			 * Set right clicked element.
			 * @param {string} target
			 */
			ContextMenu.prototype.setRightClickTarget = function (target) {
				this._rightClickTarget = target;
			};

			/**
			 * Click handler.
			 * @param {Object} info - Information sent when a context menu item is clicked.
			 * @param {Object} tabs - The details of the tab where the click took place. If the click did not take place in a tab,
			 * this parameter will be missing.
			 */
			ContextMenu.prototype._onClickHandler = function (info, tabs) {
				if (info.menuItemId === this._id) {
					this.onClicked(info, tabs);
				}
			};

			module.exports = ContextMenu;

		}, {}
	],
	3: [function (require, module, exports) {
			'use strict';

			/**
			 * Maintainer for messages between all ports.
			 * @type {{ports: {}, addPort: Function, deletePort: Function, sendToAll: Function}}
			 */
			var messenger = {

				// All connected ports
				ports: Object.create(null),

				/**
				 * Add port for continues messaging.
				 * @param {Object} port
				 * @param {number} tabId
				 */
				addPort: function (port, tabId) {
					if (!this.ports[tabId]) {
						this.ports[tabId] = {};
					}

					if (!this.ports[tabId][port.name]) {
						this.ports[tabId][port.name] = port;

						// Notify the newly added port that it is added in the messenger.
						// This is because in some cases the port is added asynchronously
						port.postMessage({
							action: 'on-port-connection'
						});
					}
				},

				/**
				 * Delete disconnected port.
				 * @param {Object} port
				 * @param {number} tabId
				 */
				deletePort: function (port, tabId) {
					if (this.ports[tabId] === undefined) {
						return;
					}

					delete this.ports[tabId][port.name];

					if (Object.keys(this.ports[tabId]).length === 0) {
						delete this.ports[tabId];
					}
				},

				/**
				 * Resend message to all open ports.
				 * @param {Object} message
				 */
				sendToAll: function (message, tabId) {
					if (this.ports[tabId] === undefined) {
						return;
					}

					for (var key in this.ports[tabId]) {
						this.ports[tabId][key].postMessage(message);
					}
				}
			};

			module.exports = messenger;

		}, {}
	],
	4: [function (require, module, exports) {
			'use strict';

			/**
			 * Page action.
			 * @type {{create: Function}}
			 */
			var pageAction = {

				/**
				 * Create page action.
				 * @param {Object} options
				 */
				create: function (options) {
					var framework = options.framework;
					var version = options.version;
					var tabId = options.tabId;

					chrome.pageAction.show(tabId);
					chrome.pageAction.setTitle({
						tabId: tabId,
						title: 'This page is using ' + framework + ' v' + version
					});
				}
			};

			module.exports = pageAction;

		}, {}
	],
	5: [function (require, module, exports) {
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

		}, {}
	]
}, {}, [1]);
