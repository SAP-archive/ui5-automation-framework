/*!
 * SAP
 * (c) Copyright 2015 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */


var $ = require('./jQuery-1.10.2.js');
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

				// Inject a script file in the current page
				var script = document.createElement('script');
				script.src = chrome.extension.getURL('/scripts/injected/detectUI5.js');
				document.head.appendChild(script);

				/**
				 * Delete the injected file, when it is loaded.
				 */
				script.onload = function () {
					script.parentNode.removeChild(script);
				};

				// Create a port with background page for continuous message communication
				var port = chrome.extension.connect({
						name: 'do-ui5-detection'
					});

				// Listen for messages from the background page
				port.onMessage.addListener(function (message) {
					if (message.action === 'do-ui5-detection') {
						document.dispatchEvent(new Event('do-ui5-detection-injected'));
					}
					//POT - Customization
					//for dialog-----msg from panel/main.js
					else if ((message.action === 'on-contextMenu-After_Enter_Value')) {
						
						var event = new CustomEvent("on-contextMenu-After_Enter_Value", {
								detail: {
									nodeId: message.target,
									actionType: message.type,
									valueRequired: message.valueRequired,
									finalValue: message.finalValue,
									assertType: message.assertType,
									compareValue: message.compareValue,
									attribute: message.attribute
								}
							}); //calls function in injected/detetctUI5.js
						window.dispatchEvent(event);
					}

					//for dialog-----msg from context menu
					else if ((message.action === 'on-contextMenu-control-right-select-forvalue')) {
						var event = new CustomEvent("on-contextMenu-control-right-select-forvalue", {
								detail: {
									nodeId: message.target,
									actionType: message.type
								}
							}); //calls function in injected/detetctUI5.js
						window.dispatchEvent(event);

					}

					/** Customization - PoT
					recieves a message from background script on right click of web context menu
					 */
					else if ((message.action === 'on-contextMenu-control-right-select')) {
						var event = new CustomEvent("on-contextMenu-control-right-select", {
								detail: {
									nodeId: message.target,
									actionType: message.type
								}
							}); //calls function in injected/detetctUI5.js
						window.dispatchEvent(event);
					} else if ((message.action === 'contextMenu-control-right-select')) {
						var event = new CustomEvent("contextMenu-control-right-select", {
								detail: message.data
							});
						window.dispatchEvent(event);
					} else if ((message.action === 'copyControl')) {
						var event = new CustomEvent("copyControl");
						window.dispatchEvent(event);

					} else if ((message.action === 'image_click')) {
						
						var html = document.createElement('div');
						var lbl = document.createElement('LABEL');
						lbl.setText = "UserName";
						html.appendChild(lbl);
						lbl = document.createElement('LABEL');
						lbl.setText = "Password";
						html.appendChild(lbl);

						jQuery(html).dialog({
							buttons: {
								'OK': function () {
									jQuery(this).dialog('close');
									port.postMessage({
										action: 'Ok'
									});
								},
								'CANCEL': function () {
									jQuery(this).dialog('close');
									port.postMessage({
										action: 'Cancel'
									})
								}
							}
						});

						

					}
					//End of - Customization - PoT

				});

				//POT - Customization
				window.addEventListener('message', function (evt) {
					if (evt.data.data.action == 'valueRequired') {
						var dataContent = evt.data.data.content;
						port.postMessage({
							action: "valueRequired_From_DetectUI5",
							data: dataContent
						}, function (response) {
							console.log(response)
						});
					}
				});

				window.addEventListener('message', function (evt) {
					if (evt.data.data.action == 'previewWindowOpen') {
						var JQueryCSSURL = chrome.extension.getURL('/scripts/content/jquery-ui.css');
						var scriptURL = chrome.extension.getURL('/scripts/content/script.js');
						var JQueryUIURL = chrome.extension.getURL('/scripts/content/jquery-ui.js');
						var JQueryLibURL = chrome.extension.getURL('/scripts/content/jquery-1.12.0.js');
						var aceURL = chrome.extension.getURL('/scripts/content/src-noconflict/ace.js');
						var aceEditorURL = chrome.extension.getURL('/scripts/content/aceEditorScript.js');
						var jQueryValidateURL = chrome.extension.getURL('/scripts/content/jquery.validate.min.js');
						var thememokaiAceEditorURL = chrome.extension.getURL('/scripts/content/downloadTRANSP.gif');
						var downloadimageURL = chrome.extension.getURL('/images/downloadTRANSP.gif');
						//changed by sagar
						var closeimageURL = chrome.extension.getURL('/images/CancelTRANSP.gif');
						var vyperimageURL = chrome.extension.getURL('/images/vyperTRANS.gif');

						function close() {
							win.close();
						}
						evt.data.data.content += '});';
						var win = window.open("http://Vyper", "Vyper", "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, width=1310, height=800");
						win.moveTo(250, 50);
						win.document.clear();
						win.document.write('');
						win.document.write("<html>" +
							"<head>" +
							"<title>Preview</title>" +
							"<link rel='stylesheet' type='text/css' href='" + JQueryCSSURL + "'>" +
							"<style type='text/css' media='screen'>" +
							"body{overflow-x: hidden;background:#ebebeb;font-size: 11px;font-family: Arial,Helvetica,sans-serif;}" +
							"	div#buttonDiv{margin-left: 17px;}" +
							"#editor {" +
							"position: absolute;" +
							"//top: 70px;" +
							"//right: 0;" +
							"//bottom: 0;" +
							"//left: 0;" +
							"height: 89%;" +
							"width: 96%;" +
							"border: 1px solid #cccccc;" +
							"border-radius: 0px;" +
							"border-bottom-right-radius: 0px;" +
							"margin: 8px 0px 0px 18px;" +
							"}" +
							".btn {" +
							"margin: 5px;" +
							
							"cursor: poiner;" +
							
							"display:inline" +
							"}" +
							".btn:hover {" +
							"border: none;" +
							"background:#cccccc;" +
							"box-shadow: 0px 0px 1px #777;" +
							"}" +
							"label, input { display:block; }" +
							"fieldset { padding:0; border:0; margin-top:25px; }" +
							"input.text { margin-bottom:12px; width:95%; padding: .4em; }" +
							"#githubCredentialsForm .error {font-size: small;margin: .5em 0;display: block;color: #dd4b39;line-height: 17px;}" +
							"#title,#vyperImg,#vyperTitle,#buttonDiv{display:inline}" +
							//"#buttonDiv{float:right}"+
							"#vyperTitle{position: absolute;top:-9px;font-size: 24px;}" +
							"#scriptNamedialog_OKBtn,#scriptNamedialog_CancelBtn,#githubdialog_OKBtn,#githubdialog_CancelBtn{width: 30px; height: 30px;}" +
							"</style>" +
							"<script src='" + JQueryLibURL + "'></script>" +
							"<script src='" + JQueryUIURL + "'></script>" +
							"<script src='" + jQueryValidateURL + "'></script>" +
							"<script src='" + scriptURL + "'></script>" +
							"</head>" +
							"<body>" +
							"<div id='header'>" +
						
							"<div id='buttonDiv'>" +
							//changed by sagar
							"<input type='image' id='saveBtn' class='btn' src='" + downloadimageURL + "' alt='Save' width='20' height='20'>" +
							"<input type='image' id='cancelBtn' class='btn' src='" + closeimageURL + "' alt='Cancel' width='20' height='20'>" +
							
							"</div>" +
							"</div>" +
							//changed by Sagar
							"<div id='dialog-saveSriptName' title='Script Name' style='display:none'>" +
							"<form>" +
							"<fieldset>" +
							"<label for='saveScriptName'>Script Name</label>" +
							"<input type='text' name='saveScriptName' id='saveScriptName' class='text ui-widget-content ui-corner-all'>" +
							"</fieldset>" +
							"</form>" +
							"</div>" +

							"<textarea name='editor'/>" + evt.data.data.content + "</textarea>" +
							"<div id='editor'></div> " +
							"<script src='" + aceURL + "'></script> " +

							"<script src='" + aceEditorURL + "'></script>" +
							"</body>" +
							"</html>");
						jQuery(win.document).on('click', '#cancelBtn', function () {
							win.close();
						});
						jQuery(win.document).on("keypress", ":input:not(textarea)", function (event) {
							if (event.keyCode == 13) {
								event.preventDefault();
							}
						});
						jQuery(win.document).on('click', '#saveBtn', function () {

							function saveTextAsFile() { ;

								var code = win.document.getElementsByName("editor")[0].value;
								var scriptName = win.document.getElementById('saveScriptName').value;
								var textToWrite = code.replace('script', scriptName);
								textToWrite = textToWrite.replace(/POTYDELIMITER/g, ';');

								var textFileAsBlob = new Blob([textToWrite], {
										type: 'text/x-java-source'
									});
								var fileNameToSaveAs = scriptName + '.spec.js';
								var downloadLink = document.createElement('a');
								downloadLink.download = fileNameToSaveAs;
								downloadLink.innerHTML = 'Download File';
								if (window.URL != null) {
									downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
								}
								downloadLink.click();
								jQuery(win.document.getElementById('dialog-saveSriptName')).dialog("close");
							}

							jQuery(win.document.getElementById('dialog-saveSriptName')).dialog({
								resizable: false,
								position: {
									my: "center",
									at: "center",
									of: window
								},
								height: 200,
								width: 300,
								modal: true,
								buttons: {
									"OK": {
										icons: {
											primary: "ui-icon-check"
										},
										id: "scriptNamedialog_OKBtn",
										click: saveTextAsFile
									},
									"Cancel": {
										icons: {
											primary: "ui-icon-closethick"
										},
										id: "scriptNamedialog_CancelBtn",
										click: function () {
											jQuery(this).dialog("close");
										}
									},
								}
							});

						});

					}
				});
				/**
				 *  Listens for messages from the injected script.
				 */
				document.addEventListener('detect-ui5-content', function sendEvent(detectEvent) {
					// Send the received event detail object to background page
					port.postMessage(detectEvent.detail);
				}, false);
			}
				());

		}, {}
	]
}, {}, [1]);
