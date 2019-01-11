var JSONReporter = require('jasmine-json-test-reporter');
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

//var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');
var HtmlScreenshotReporter = require('protractor-jasmine2-screenshot-reporter');

var today = new Date();
//Changed by psilpa on 11th Jan 2019
var timeStamp = '.' + today.getMonth() + 1 + '_' + today.getDate() + '_' + today.getFullYear() + '_' + today.getHours() + '_' + today.getMinutes();

module.exports=function(){
	
		//jasmine2 html reporter
		// jasmine.getEnv().addReporter(
        // new Jasmine2HtmlReporter({
          // savePath: 'results2',
		  // screenshotsFolder: 'images'+timeStamp,
		  // cleanDestination: false		  
        // })
      //);
	jasmine.getEnv().addReporter(new HtmlScreenshotReporter({
        //Added by psilpa on 11th Jan
	  dest: 'results/html',
	  inlineImages: true,
	  showSummary: true,
	  showConfiguration: true,
      reportTitle: 'Test',
      //Added by psilpa on 11th Jan
	  filename: 'Report.html',
	  cleanDestination : true,
      //ignoreSkippedSpecs: true,
      //Added by psilpa on 11th Jan
	  pathBuilder: function() {
        return '../images/' + (new Date()).getTime() ;
      },
	  // Setup the report before any tests start
	  beforeLaunch: function() {
		return new Promise(function(resolve){
		  reporter.beforeLaunch(resolve);
		});
	  },

	  // Assign the test reporter to each running instance
	  onPrepare: function() {
		jasmine.getEnv().addReporter(reporter);
	  },

	  // Close the report after all tests finish
	  afterLaunch: function(exitCode) {
		return new Promise(function(resolve){
		  reporter.afterLaunch(resolve.bind(this, exitCode));
		});
	  }
	}));
	
	//json reporter
	jasmine.getEnv().addReporter(new JSONReporter({
        //Changed by psilpa on 11th Jan 2019
    file: 'results/jasmine-test-results' + timeStamp + '.json',
	//dest : 'results/json',
    beautify: true,
    indentationLevel: 4 // used if beautify === true 
}));

	 jasmine.getEnv().addReporter(
	 new SpecReporter({
		spec: {
        displayStacktrace: false
      },
      summary: {
        displayDuration: false
      }
	  })
	  );
	
	

	//custom locator


	by.addLocator('ui5', function(ui5ControlProperties,index,parent_El,root) {
		var sapBody = document.getElementsByClassName('sapUiBody')[0];
		if(sapBody==undefined || sapBody.length == 0 )
		{sapBody = document;} //Added by Sagar
        var nodes = sapBody.querySelectorAll('*');
                var ui5Obj = ui5ControlProperties;
				//var str = value
				//var opnvalue =  str.replace(/-/g, "");
				var index=index || 0;
                var metadata;
                var trueNodeid = null;
                var elemFound = false;
                var mProp;
                var mPropFlag = 0;
                var elemCount = 0;
                var elemFoundIds = [];
                var ParMatchArr = [];
                var parid;
                var prevSibMatchArr = [];
                var prevSibPropBool;
				String.prototype.capitalize = function() {
                    return this.charAt(0).toUpperCase() + this.slice(1);
                }
								Array.prototype.filter.call(nodes, function(node) {
                    if (sap.ui.getCore().byId(node.getAttribute('id')) !== undefined) {
                        metadata = sap.ui.getCore().byId(node.getAttribute('id')).getMetadata().getName();
                        if (metadata == ui5Obj.elementProperties.metadata) {

                            mProp = sap.ui.getCore().byId(node.getAttribute('id')).mProperties;
                            mPropFlag = 0;
                            if (Object.keys(ui5Obj.elementProperties.mProperties).length == 0 || Object.keys(mProp).length == 0) {
                                mPropFlag = 1;
                            } else {
                                jQuery.each(ui5Obj.elementProperties.mProperties, function(key, value) {
                                    if (ui5Obj.elementProperties.mProperties[key] == mProp[key]) {
                                        mPropFlag = 1;
                                    } else {
                                        mPropFlag = 0;
                                        return false;
                                    }
                                });
                            }
                            if (mPropFlag == 1) {

                                elemCount++;
                                elemFoundIds.push(node.getAttribute('id'));


                            }
                        }

                    }

                });
				if (elemCount == 1) {

                    elemFound = true;
                    trueNodeid = elemFoundIds[0];

					}
				else if (elemCount > 1) {

                    var propelemIds = [];
                    var propElemCount = 0;

                    jQuery.each(elemFoundIds, function(key, value) {
                        //parent element
                        var parMetadata;
                        var parProp;
                        //var elid = "#" + value;
                        //var par = jQuery(elid).parent();
						var str="id="+"'"+value+"'";
						var par = jQuery('['+str+']').parent();

                        console.log(par);
                        parid = par.attr('id');
                        var count = 0;

                        var parMProp;

                        while (1) {
                            if (parid !== undefined) {

                                if (sap.ui.getCore().byId(parid) !== undefined) {
                                    parMetadata = sap.ui.getCore().byId(parid).getMetadata().getName();
                                    console.log(parMetadata);
                                    parMProp = sap.ui.getCore().byId(parid).mProperties;
									jQuery.each(parMProp, function(key,val)
									{
										//console.log(key +" : "+ val);
										if(val == '[object Object]' || typeof(val) == 'object')
										{
											delete parMProp[key];
											//console.log("Deleted");
										}
									});
                                    console.log(JSON.stringify(parMProp));
                                    //  i=0;
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



                        var parBool = parMetadata === ui5Obj.parentProperties.metadata;
                        var parPropBool = 0;
						if(parBool){
                        if (Object.keys(ui5Obj.parentProperties.mProperties).length == 0 || Object.keys(parMProp).length == 0) {
                            parPropBool = 1;
                        } else {
                            jQuery.each(ui5Obj.parentProperties.mProperties, function(key, value) {
                                if (ui5Obj.parentProperties.mProperties[key] == parMProp[key]) {
                                    parPropBool = 1;
                                } else {
                                    parPropBool = 0;
                                    return false;
                                }
                            });
                        }
						}
                        if (parPropBool == 1) {

                            ParMatchArr.push({
                                parid: parid,
                                elid: value
                            });
                        }
                    });

                    if (ParMatchArr.length == 1) {

                        elemFound = true;
                        trueNodeid = ParMatchArr[0].elid;


                    } else if (ParMatchArr.length > 1) {

                        var prevSibMatchArr = [];
                        jQuery.each(ParMatchArr, function(index, parmatchNode) {

                            var parNodes = document.getElementById(parmatchNode.parid).querySelectorAll('*');
                            var ind = 0;
                            //load metadata elements into an array
                            var parMetaNodeElems = []
                            var parMetaNodes = [];
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
                            var sibBool;
                        jQuery.each(parMetaNodeElems, function(i, v) {
                            if (parmatchNode.elid == v.id) {
                                sibBool = true;

                                //Previous Sibling Properties
                                if (parMetaNodes[i - 1] != undefined) {
                                    var j = i - 1;
									var str="id="+"'"+parMetaNodeElems[j].id+"'";
									var prevelemid = jQuery('['+str+']').parent();



                                   // var prevelemid = jQuery('#' + parMetaNodeElems[j].id).parent();
                                    var prevelempar = prevelemid.attr('id');
                                    while (j <= (parMetaNodeElems.length - 1)) {

                                        if (prevelempar != undefined) {
                                            if (sap.ui.getCore().byId(prevelempar) !== undefined) {
                                                if (parmatchNode.parid == prevelempar) {

                                                    prevSibElem = parMetaNodes[j];
                                                    break;
                                                } else {
                                                    j = j - 1;
													var str="id="+"'"+parMetaNodeElems[j].id+"'";
													 prevelemid = jQuery('['+str+']').parent();

                                                   // prevelemid = jQuery('#' + parMetaNodeElems[j].id).parent();
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



                            }
							});
                            if (!sibBool) {
                                prevSibElem = {};
                            }

							console.log(JSON.stringify(prevSibElem)+"prev Sibling");
                            var prevSibPropBool = 0;

                            if (Object.keys(prevSibElem).length !== 0 && Object.keys(ui5Obj.prevSiblingProperties).length !== 0) {
							if(ui5Obj.prevSiblingProperties.metadata == prevSibElem.metadata){
                                if (Object.keys(ui5Obj.prevSiblingProperties.mProperties).length == 0 || Object.keys(prevSibElem.mProperties).length == 0) {
                                    prevSibPropBool = 1;
                                } else {
                                    jQuery.each(ui5Obj.prevSiblingProperties.mProperties, function(key, value) {
                                        if (ui5Obj.prevSiblingProperties.mProperties[key] == prevSibElem.mProperties[key]) {
                                            prevSibPropBool = 1;
                                        } else {
                                            prevSibPropBool = 0;
                                            return false;
                                        }
                                    });
                                }
                            }
							}
                            var prevSibEmptyMpropFlag = false;
                            //var prevSibBool = ui5Obj.prevSiblingProperties.metadata == prevSibElem.metadata && prevSibPropBool == 1;
                            if (Object.keys(prevSibElem).length == 0 && Object.keys(ui5Obj.prevSiblingProperties).length == 0) {
                                prevSibEmptyMpropFlag = true;
                            }

                            if (prevSibPropBool || prevSibEmptyMpropFlag) {
                                prevSibMatchArr.push({
                                    elid: parmatchNode.elid,
                                    parid: parmatchNode.parid
                                });
                            }
							;


                        });
                        if (prevSibMatchArr.length == 1) {
							elemFound = true;
							trueNodeid = prevSibMatchArr[0].elid;

                        } else if (prevSibMatchArr.length > 1) {

                            var nxtSibMatchArr = [];
                            jQuery.each(prevSibMatchArr, function(index, nxtSibMatchNode) {

                                var parNodes = document.getElementById(nxtSibMatchNode.parid).querySelectorAll('*');
                                var ind = 0;
                                //load metadata elements into an array
                                var parMetaNodeElems = []
                                var parMetaNodes = [];
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

                                var nextSibBool;

                                var nextSibElem;
                                var sibBool = false;
                                jQuery.each(parMetaNodeElems, function(i, v) {
                                    if (nxtSibMatchNode.elid == v.id) {
                                        sibBool = true;
                                        if (parMetaNodes[i + 1] != undefined) {
                                            var j = i + 1;
											var str="id="+"'"+parMetaNodeElems[j].id+"'";
											var nxtelemid = jQuery('['+str+']').parent();
                                          //  var nxtelemid = jQuery('#' + parMetaNodeElems[j].id).parent();
                                            var nxtelempar = nxtelemid.attr('id');
                                            while (j <= (parMetaNodeElems.length - 1)) {

                                                if (nxtelempar != undefined) {
                                                    if (sap.ui.getCore().byId(nxtelempar) !== undefined) {
                                                        if (nxtSibMatchNode.parid == nxtelempar) {

                                                            nextSibElem = parMetaNodes[j];
                                                            break;
                                                        } else {
                                                            j = j + 1;
															   if (j > (parMetaNodeElems.length - 1)) {
																									nextSibElem = {};
																									break;
																								}
																var str="id="+"'"+parMetaNodeElems[j].id+"'";
																nxtelemid = jQuery('['+str+']').parent();
                                                          //  nxtelemid = jQuery('#' + parMetaNodeElems[j].id).parent();
                                                            nxtelempar = nxtelemid.attr('id');

                                                        }
                                                    } else {

                                                        nxtelemid = (nxtelemid).parent();
                                                        nxtelempar = nxtelemid.attr('id');
                                                    }


                                                } else {

                                                    nxtelemid = nxtelemid.parent();
                                                    nxtelempar = nxtelemid.attr('id');

                                                }
                                            }

                                        } else {
                                            nextSibElem = {};
                                        }

                                    }



                                });
                                if (!sibBool) {
                                    nextSibElem = {};
                                }

								console.log(JSON.stringify(nextSibElem)+"next sibling");
                                var nxtSibPropBool = 0;
                                if (Object.keys(nextSibElem).length !== 0 && Object.keys(ui5Obj.nextSiblingProperties).length !== 0) {
									if(ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata){
                                    if (Object.keys(ui5Obj.nextSiblingProperties.mProperties).length == 0 || Object.keys(nextSibElem.mProperties).length == 0) {
                                        nxtSibPropBool = 1;
                                    } else {
                                        jQuery.each(ui5Obj.nextSiblingProperties.mProperties, function(key, value) {
                                            if (ui5Obj.nextSiblingProperties.mProperties[key] == nextSibElem.mProperties[key]) {
                                                nxtSibPropBool = 1;
                                            } else {
                                                nxtSibPropBool = 0;
                                                return false;
                                            }
                                        });
                                    }
                                }
								}
                                var nextSibEmptyMpropFlag = false;
                                //var nxtSibBool = ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata && nxtSibPropBool == 1;
                                if (Object.keys(nextSibElem).length == 0 && Object.keys(ui5Obj.nextSiblingProperties).length == 0) {
                                    nextSibEmptyMpropFlag = true;
                                }

                                if (nxtSibPropBool || nextSibEmptyMpropFlag) {
                                    nxtSibMatchArr.push({
                                        elid: nxtSibMatchNode.elid,
										parid:nxtSibMatchNode.parid

                                    });
                                }



                            });
                            if(nxtSibMatchArr.length==1){
								elemFound = true;
								trueNodeid = nxtSibMatchArr[0].elid;
							}
							else if(nxtSibMatchArr.length>1){

									//elemFound = true;
									//trueNodeid = elemFoundIds[index];
									var childMatchArr=[];
									var childElem={};
									jQuery.each(nxtSibMatchArr,function(index,nxtSibMatchArrNodes){
									var childElemNodes=document.getElementById(nxtSibMatchArrNodes.elid).querySelectorAll('*');
									if (childElemNodes.length == 0) {
													childElem = {};
													}
									else {
											jQuery.each(childElemNodes, function(v, i) {
													if (sap.ui.getCore().byId(i.id) !== undefined) {

																						childProp = sap.ui.getCore().byId(i.id).mProperties;

																						childElem = {
																								"metadata": sap.ui.getCore().byId(i.id).getMetadata().getName(),
																								"mProperties": childProp
																								};
																								return false;
																							} else {
																									childElem = {};
																									}
																				});
											}
										var childPropBool=0;

										if (Object.keys(childElem).length !== 0 && Object.keys(ui5Obj.childProperties).length !== 0) {
									if(ui5Obj.childProperties.metadata == childElem.metadata){
                                    if (Object.keys(ui5Obj.childProperties.mProperties).length == 0 || Object.keys(childElem.mProperties).length == 0) {
                                        childPropBool = 1;
                                    } else {
                                        jQuery.each(ui5Obj.childProperties.mProperties, function(key, value) {
                                            if (ui5Obj.childProperties.mProperties[key] == childElem.mProperties[key]) {
                                                childPropBool = 1;
                                            } else {
                                                childPropBool = 0;
                                                return false;
                                            }
                                        });
                                    }
                                }
								}
                                var childEmptyMpropFlag = false;
                                //var nxtSibBool = ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata && nxtSibPropBool == 1;
                                if (Object.keys(childElem).length == 0 && Object.keys(ui5Obj.childProperties).length == 0) {
                                    childEmptyMpropFlag = true;
                                }

                                if (childPropBool || childEmptyMpropFlag) {debugger;
                                    childMatchArr.push({
                                        elid: nxtSibMatchArrNodes.elid,
										parid:nxtSibMatchArrNodes.parid

                                    });
                                }

								});

								debugger;
								if(childMatchArr.length==1){
											elemFound = true;
											trueNodeid = childMatchArr[0].elid;
										}
										else if(childMatchArr.length>1){
																		elemFound = true;
																		trueNodeid = childMatchArr[index].elid;

																	}

								}



                        }
						}
						}
				//trueNodeid += '-'+opnvalue;
            if (elemFound) {

				var saptrueNodeId = sap.ui.getCore().byId(trueNodeid);
                //var assertAttribute = "get" + attribute.capitalize();
				var obtainedValue;


				var mProperties=saptrueNodeId.mProperties;

				node=document.getElementById(trueNodeid);
						jQuery.each(mProperties, function(key, value) {
						node.setAttribute('data-'+key,value);
							});




                return node;


            }

        });
		
		//Added SAPui5ControlCount
		by.addLocator('sapUI5_Control_Count', function(ui5Metadata) {
        console.log('in sapUI5_Control_Count ');
        var sapBody = document;
        var nodes = sapBody.querySelectorAll('*');
        return Array.prototype.filter.call(nodes, function(node) {

            if (sap.ui.getCore().byId(node.getAttribute('id')) !== undefined) {
                metadata = sap.ui.getCore().byId(node.getAttribute('id')).getMetadata().getName();
                if (metadata == ui5Metadata) {
                    return true;;
                }

            }

        });
    });

		

		//ui5 action

    /**
     * POT - Customisation
     * Custom locator-to perform operations on the element
     * @param {String} ui5ControlProperties
     * @param {int} index
     * @param {String} operation
     * @param {String} value
     * @return {Object} el
     */
    by.addLocator('ui5Action', function(ui5ControlProperties, operation, index, value, parent_El, root) {
        var sapBody = document.getElementsByClassName('sapUiBody')[0];
		if(sapBody==undefined || sapBody.length == 0 )
		{sapBody = document;} //Added by Sagar
        var nodes = sapBody.querySelectorAll('*');
        var ui5Obj = ui5ControlProperties;
        var opnValue = value || null;
        var index = index || 0;
        var metadata;
        var trueNodeid = null;
        var elemFound = false;
        var mProp;
        var mPropFlag = 0;
        var elemCount = 0;
        var elemFoundIds = [];
        var ParMatchArr = [];
        var parid;
        var prevSibMatchArr = [];
        var prevSibPropBool;

        String.prototype.capitalize = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
        Array.prototype.filter.call(nodes, function(node) {
            if (sap.ui.getCore().byId(node.getAttribute('id')) !== undefined) {
                metadata = sap.ui.getCore().byId(node.getAttribute('id')).getMetadata().getName();
                if (metadata == ui5Obj.elementProperties.metadata) {

                    mProp = sap.ui.getCore().byId(node.getAttribute('id')).mProperties;
                    mPropFlag = 0;
                    if (Object.keys(ui5Obj.elementProperties.mProperties).length == 0 || Object.keys(mProp).length == 0) {
                        mPropFlag = 1;
                    } else {
                        jQuery.each(ui5Obj.elementProperties.mProperties, function(key, value) {
                            if (ui5Obj.elementProperties.mProperties[key] == mProp[key]) {
                                mPropFlag = 1;
                            } else {
                                mPropFlag = 0;
                                return false;
                            }
                        });
                    }
                    if (mPropFlag == 1) {

                        elemCount++;
                        elemFoundIds.push(node.getAttribute('id'));


                    }
                }

            }

        });
        if (elemCount == 1) {

            elemFound = true;
            trueNodeid = elemFoundIds[0];

        } else if (elemCount > 1) {

            var propelemIds = [];
            var propElemCount = 0;

            jQuery.each(elemFoundIds, function(key, value) {
                //parent element
                var parMetadata;
                var parProp;
                //var elid = "#" + value;
                //var par = jQuery(elid).parent();
                var str = "id=" + "'" + value + "'";
                var par = jQuery('[' + str + ']').parent();



                console.log(par);
                parid = par.attr('id');
                var count = 0;

                var parMProp;

                while (1) {
                    if (parid !== undefined) {

                        if (sap.ui.getCore().byId(parid) !== undefined) {
                            parMetadata = sap.ui.getCore().byId(parid).getMetadata().getName();
                            console.log(parMetadata);
                            parMProp = sap.ui.getCore().byId(parid).mProperties;
							var j = Object.keys(parMProp).length;
					jQuery.each(parMProp, function(key,val)
					{
						//console.log(key +" : "+ val);
						if(val == '[object Object]' || typeof(val) == 'object')
						{
							delete parMProp[key];
							//console.log("Deleted");
						}
					});
                            console.log(JSON.stringify(parMProp));
                            //  i=0;
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



                var parBool = parMetadata === ui5Obj.parentProperties.metadata;
                var parPropBool = 0;
                if (parBool) {
                    if (Object.keys(ui5Obj.parentProperties.mProperties).length == 0 || Object.keys(parMProp).length == 0) {
                        parPropBool = 1;
                    } else {
                        jQuery.each(ui5Obj.parentProperties.mProperties, function(key, value) {
                            if (ui5Obj.parentProperties.mProperties[key] == parMProp[key]) {
                                parPropBool = 1;
                            } else {
                                parPropBool = 0;
                                return false;
                            }
                        });
                    }
                }
                if (parPropBool == 1) {

                    ParMatchArr.push({
                        parid: parid,
                        elid: value
                    });




                }
            });

            if (ParMatchArr.length == 1) {

                elemFound = true;
                trueNodeid = ParMatchArr[0].elid;


            } else if (ParMatchArr.length > 1) {

                var prevSibMatchArr = [];
                jQuery.each(ParMatchArr, function(index, parmatchNode) {

                    var parNodes = document.getElementById(parmatchNode.parid).querySelectorAll('*');
                    var ind = 0;
                    //load metadata elements into an array
                    var parMetaNodeElems = []
                    var parMetaNodes = [];
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
                    var sibBool;
                    jQuery.each(parMetaNodeElems, function(i, v) {
                        if (parmatchNode.elid == v.id) {
                            sibBool = true;

                            //Previous Sibling Properties
                            if (parMetaNodes[i - 1] != undefined) {
                                var j = i - 1;
                                var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                                var prevelemid = jQuery('[' + str + ']').parent();



                              //  var prevelemid = jQuery('#' + parMetaNodeElems[j].id).parent();
                                var prevelempar = prevelemid.attr('id');
                                while (j <= (parMetaNodeElems.length - 1)) {

                                    if (prevelempar != undefined) {
                                        if (sap.ui.getCore().byId(prevelempar) !== undefined) {
                                            if (parmatchNode.parid == prevelempar) {

                                                prevSibElem = parMetaNodes[j];
                                                break;
                                            } else {
                                                j = j - 1;
                                                var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                                                prevelemid = jQuery('[' + str + ']').parent();

                                              //  prevelemid = jQuery('#' + parMetaNodeElems[j].id).parent();
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



                        }
                    });
                    if (!sibBool) {
                        prevSibElem = {};
                    }

                    console.log(JSON.stringify(prevSibElem) + "prev Sibling");
                    var prevSibPropBool = 0;

                    if (Object.keys(prevSibElem).length !== 0 && Object.keys(ui5Obj.prevSiblingProperties).length !== 0) {
                        if (ui5Obj.prevSiblingProperties.metadata == prevSibElem.metadata) {
                            if (Object.keys(ui5Obj.prevSiblingProperties.mProperties).length == 0 || Object.keys(prevSibElem.mProperties).length == 0) {
                                prevSibPropBool = 1;
                            } else {
                                jQuery.each(ui5Obj.prevSiblingProperties.mProperties, function(key, value) {
                                    if (ui5Obj.prevSiblingProperties.mProperties[key] == prevSibElem.mProperties[key]) {
                                        prevSibPropBool = 1;
                                    } else {
                                        prevSibPropBool = 0;
                                        return false;
                                    }
                                });
                            }
                        }
                    }
                    var prevSibEmptyMpropFlag = false;
                    //var prevSibBool = ui5Obj.prevSiblingProperties.metadata == prevSibElem.metadata && prevSibPropBool == 1;
                    if (Object.keys(prevSibElem).length == 0 && Object.keys(ui5Obj.prevSiblingProperties).length == 0) {
                        prevSibEmptyMpropFlag = true;
                    }

                    if (prevSibPropBool || prevSibEmptyMpropFlag) {
                        prevSibMatchArr.push({
                            elid: parmatchNode.elid,
                            parid: parmatchNode.parid
                        });
                    };


                });
                if (prevSibMatchArr.length == 1) {
                    elemFound = true;
                    trueNodeid = prevSibMatchArr[0].elid;

                } else if (prevSibMatchArr.length > 1) {

                    var nxtSibMatchArr = [];
                    jQuery.each(prevSibMatchArr, function(index, nxtSibMatchNode) {

                        var parNodes = document.getElementById(nxtSibMatchNode.parid).querySelectorAll('*');
                        var ind = 0;
                        //load metadata elements into an array
                        var parMetaNodeElems = []
                        var parMetaNodes = [];
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

                        var nextSibBool;

                        var nextSibElem;
                        var sibBool = false;
                        jQuery.each(parMetaNodeElems, function(i, v) {
                            if (nxtSibMatchNode.elid == v.id) {
                                sibBool = true;
                                if (parMetaNodes[i + 1] != undefined) {
                                    var j = i + 1;
                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                                    var nxtelemid = jQuery('[' + str + ']').parent();
                                   // var nxtelemid = jQuery('#' + parMetaNodeElems[j].id).parent();
                                    var nxtelempar = nxtelemid.attr('id');
                                    while (j <= (parMetaNodeElems.length - 1)) {

                                        if (nxtelempar != undefined) {
                                            if (sap.ui.getCore().byId(nxtelempar) !== undefined) {
                                                if (nxtSibMatchNode.parid == nxtelempar) {

                                                    nextSibElem = parMetaNodes[j];
                                                    break;
                                                } else {
                                                    j = j + 1;
                                                    if (j > (parMetaNodeElems.length - 1)) {
                                                        nextSibElem = {};
                                                        break;
                                                    }
                                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                                                    nxtelemid = jQuery('[' + str + ']').parent();
                                                 //   nxtelemid = jQuery('#' + parMetaNodeElems[j].id).parent();
                                                    nxtelempar = nxtelemid.attr('id');

                                                }
                                            } else {

                                                nxtelemid = (nxtelemid).parent();
                                                nxtelempar = nxtelemid.attr('id');
                                            }


                                        } else {

                                            nxtelemid = nxtelemid.parent();
                                            nxtelempar = nxtelemid.attr('id');

                                        }
                                    }

                                } else {
                                    nextSibElem = {};
                                }

                            }



                        });
                        if (!sibBool) {
                            nextSibElem = {};
                        }

                        console.log(JSON.stringify(nextSibElem) + "next sibling");
                        var nxtSibPropBool = 0;
                        if (Object.keys(nextSibElem).length !== 0 && Object.keys(ui5Obj.nextSiblingProperties).length !== 0) {
                            if (ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata) {
                                if (Object.keys(ui5Obj.nextSiblingProperties.mProperties).length == 0 || Object.keys(nextSibElem.mProperties).length == 0) {
                                    nxtSibPropBool = 1;
                                } else {
                                    jQuery.each(ui5Obj.nextSiblingProperties.mProperties, function(key, value) {
                                        if (ui5Obj.nextSiblingProperties.mProperties[key] == nextSibElem.mProperties[key]) {
                                            nxtSibPropBool = 1;
                                        } else {
                                            nxtSibPropBool = 0;
                                            return false;
                                        }
                                    });
                                }
                            }
                        }
                        var nextSibEmptyMpropFlag = false;
                        //var nxtSibBool = ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata && nxtSibPropBool == 1;
                        if (Object.keys(nextSibElem).length == 0 && Object.keys(ui5Obj.nextSiblingProperties).length == 0) {
                            nextSibEmptyMpropFlag = true;
                        }

                        if (nxtSibPropBool || nextSibEmptyMpropFlag) {
                            nxtSibMatchArr.push({
                                elid: nxtSibMatchNode.elid,
                                parid: nxtSibMatchNode.parid

                            });
                        }



                    });
                    if (nxtSibMatchArr.length == 1) {
                        elemFound = true;
                        trueNodeid = nxtSibMatchArr[0].elid;
                    } else if (nxtSibMatchArr.length > 1) {

                        //elemFound = true;
                        //trueNodeid = elemFoundIds[index];
                        var childMatchArr = [];
                        var childElem = {};
                        jQuery.each(nxtSibMatchArr, function(index, nxtSibMatchArrNodes) {
                            var childElemNodes = document.getElementById(nxtSibMatchArrNodes.elid).querySelectorAll('*');
                            if (childElemNodes.length == 0) {
                                childElem = {};
                            } else {
                                jQuery.each(childElemNodes, function(v, i) {
                                    if (sap.ui.getCore().byId(i.id) !== undefined) {

                                        childProp = sap.ui.getCore().byId(i.id).mProperties;

                                        childElem = {
                                            "metadata": sap.ui.getCore().byId(i.id).getMetadata().getName(),
                                            "mProperties": childProp
                                        };
                                        return false;
                                    } else {
                                        childElem = {};
                                    }
                                });
                            }
                            var childPropBool = 0;

                            if (Object.keys(childElem).length !== 0 && Object.keys(ui5Obj.childProperties).length !== 0) {
                                if (ui5Obj.childProperties.metadata == childElem.metadata) {
                                    if (Object.keys(ui5Obj.childProperties.mProperties).length == 0 || Object.keys(childElem.mProperties).length == 0) {
                                        childPropBool = 1;
                                    } else {
                                        jQuery.each(ui5Obj.childProperties.mProperties, function(key, value) {
                                            if (ui5Obj.childProperties.mProperties[key] == childElem.mProperties[key]) {
                                                childPropBool = 1;
                                            } else {
                                                childPropBool = 0;
                                                return false;
                                            }
                                        });
                                    }
                                }
                            }
                            var childEmptyMpropFlag = false;
                            //var nxtSibBool = ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata && nxtSibPropBool == 1;
                            if (Object.keys(childElem).length == 0 && Object.keys(ui5Obj.childProperties).length == 0) {
                                childEmptyMpropFlag = true;
                            }

                            if (childPropBool || childEmptyMpropFlag) {
                                childMatchArr.push({
                                    elid: nxtSibMatchArrNodes.elid,
                                    parid: nxtSibMatchArrNodes.parid

                                });
                            }

                        });


                        if (childMatchArr.length == 1) {
                            elemFound = true;
                            trueNodeid = childMatchArr[0].elid;
                        } else if (childMatchArr.length > 1) {
                            elemFound = true;
                            trueNodeid = childMatchArr[index].elid;

                        }

                    }



                }
            }
        }

        if (elemFound) {

            var saptrueNodeId = sap.ui.getCore().byId(trueNodeid);
            console.log(trueNodeid);

            var ui5EventsSplit = operation.split(",");
            var operationArray = [];

            var caps = ui5EventsSplit[0].capitalize();
            var fireOpn = "fire" + caps;
            switch (saptrueNodeId.getMetadata().getName()) {
		case "sap.m.Switch":{
				function getBool(val) {
						return !!JSON.parse(String(val).toLowerCase());
						}
			    saptrueNodeId.setState(getBool(opnValue));
			saptrueNodeId.fireChange();
			}	
			break;	    
		case "sap.b.controls.floorplan.Scrollbar":{
			isNaN(opnValue) || saptrueNodeId.getPosition() === opnValue || (saptrueNodeId.setProperty("position", opnValue, !0),
			saptrueNodeId._updatePositionText(),
			saptrueNodeId.fireScroll({
						position: opnValue
						}),
			saptrueNodeId._oPopover.isOpen() || saptrueNodeId._oPopover.openBy(saptrueNodeId));
		}
		break;

                case "sap.m.SearchField":
                    saptrueNodeId.setValue(opnValue);
                    saptrueNodeId.fireSearch();
                    saptrueNodeId.fireLiveChange();
                    break;
                case "sap.m.Input":
                    saptrueNodeId.setValue(opnValue);

                    break;
                case "sap.m.TextArea":
                    saptrueNodeId.setValue(opnValue);
                    saptrueNodeId.fireLiveChange({
                        value: opnValue,
                        newValue: opnValue
                    });
                    break;

                case "sap.me.Calendar":
                    {


                        //var valString = "div[class*='sapMeCalendarMonthDay sapMeCalendarWeekDay'][id*='" + value + "']";

                        //var dateNode = document.getElementById(trueNodeid).querySelectorAll(valString);


                        if (!sap.ui.getCore().byId(trueNodeid).getEnableMultiselection()) {
                            if (sap.ui.getCore().byId(trueNodeid).getSelectionMode() == sap.me.CalendarSelectionMode.SINGLE) {
                                sap.ui.getCore().byId(trueNodeid).unselectAllDates();
                                sap.ui.getCore().byId(trueNodeid).setCurrentDate(value);
                            } else if (sap.ui.getCore().byId(trueNodeid).getSelectedDates().length > 1) {
                                sap.ui.getCore().byId(trueNodeid).unselectAllDates();
                                sap.ui.getCore().byId(trueNodeid).setCurrentDate(value);
                            }
                        }

                        sap.ui.getCore().byId(trueNodeid).unselectAllDates();
                        sap.ui.getCore().byId(trueNodeid).setCurrentDate(value);
                        setTimeout(function() {
                            var valString = "div[class*='sapMeCalendarMonthDay sapMeCalendarWeekDay'][id*='" + value + "']";

                            var dateNode = document.getElementById(trueNodeid).querySelectorAll(valString);

                            var calendarNodeId = "#" + dateNode[0].getAttribute('id');
                            jQuery(calendarNodeId).addClass("sapMeCalendarSelected");
                            var splitValue = value.split('-').join(' ');
                            sap.ui.getCore().byId(trueNodeid)._updateDatesWithClass("sapMeCalendarSelected", splitValue, true);
                            sap.ui.getCore().byId(trueNodeid).fireTapOnDate({
                                didSelect: true,
                                date: splitValue
                            });

                            //do what you need here
                        }, 2000);
                        /*var valString = "div[class*='sapMeCalendarMonthDay sapMeCalendarWeekDay'][id*='" + value + "']";

                                        var dateNode = document.getElementById(trueNodeid).querySelectorAll(valString);

                                                                                                                                                var calendarNodeId = "#" + dateNode[0].getAttribute('id');
                                        jQuery(calendarNodeId).addClass("sapMeCalendarSelected");
                                        var splitValue = value.split('-').join(' ');
                                        sap.ui.getCore().byId(trueNodeid)._updateDatesWithClass("sapMeCalendarSelected", splitValue, true);
                                        sap.ui.getCore().byId(trueNodeid).fireTapOnDate({
                                            didSelect: true,
                                            date: splitValue
                                        });*/


                    }
                    break;
                case "sap.m.List":
                    {
                        var items = saptrueNodeId.getItems().length;
                        for (var n = 0; n < items; n++) {
                            if (saptrueNodeId.getItems()[n].getTitle() == opnValue) {

                                var item = saptrueNodeId.getItems()[n].sId;
                                /*saptrueNodeId["fireSelectionChange"]({
                                    listItem: sap.ui.getCore().byId(item)
                                });*/
                                sap.ui.getCore().byId(item).jQuery().trigger("tap");
                                break;
                            }

                        }
                    }
                    break;

                case "sap.m.CheckBox":
                    {
                        if (saptrueNodeId.getSelected() == true) {
                            saptrueNodeId["fireSelect"]({
                                selected: false
                            });
                            saptrueNodeId.setSelected(false);
                        } else if (saptrueNodeId.getSelected() == false) {
                            saptrueNodeId["fireSelect"]({
                                selected: true
                            });
                            saptrueNodeId.setSelected(true);
                        }

                    }
                    break;
                case "sap.m.Select":
                    {
                        var items = saptrueNodeId.getItems().length;
                        for (var n = 0; n < items; n++) {
                            if (saptrueNodeId.getItems()[n].getText() == opnValue) {
                                var item = saptrueNodeId.getItems()[n].sId;
                                /*saptrueNodeId["fireChange"]({
                                    selectedItem: sap.ui.getCore().byId(item)*/

                                //sap.ui.getCore().byId(item).jQuery().trigger("tap");

                                var objB = saptrueNodeId;
                                var objL = sap.ui.getCore().byId(item);
                                objB.setSelection(objL);
                                objB.fireChange({
                                    selectedItem: objL
                                });
                                objB.setValue(opnValue);

                                break;

                            };

                        }

                    }
                    break;


                case "sap.m.Button" || "sap.ui.core.Icon":
                    {
                        saptrueNodeId["fireTap"](opnValue)
                        saptrueNodeId["firePress"](opnValue)
                    }

                    break;

                case "sap.m.RadioButton":
                    {
                        saptrueNodeId.fireSelect({
                            selected: true
                        });saptrueNodeId.setSelected(true)
                        //saptrueNodeId.setProperty('selected', true);
                        //var radioButtonNode=document.getElementById(trueNodeid).querySelectorAll('input');
                        //var radioInputId="#"+radioButtonNode[0].id;
                        //jQuery(radioInputId).click();
                        //jQuery(radioButtonNode[0].type:'radio').change();
                    }
                    break;
                    //ui commons controls
                case "sap.ui.commons.DropdownBox":
                    {

                        //saptrueNodeId.setValue(item.getText(), true);
                        //saptrueNodeId.setProperty("selectedKey", " ", true);
                        //saptrueNodeId.setProperty("selectedItemId", item.getId(), true);
                        //saptrueNodeId.fireChange({newValue: item.getText(), selectedItem: item});

                        //throw new Error(trueNodeid);


                        for (var i = 0; i < saptrueNodeId.getItems().length; i++) {
                            if (saptrueNodeId.getItems()[i].getText() == value) {
                                item = sap.ui.getCore().byId(saptrueNodeId.getItems()[i].sId);
                                saptrueNodeId.setValue(item.getText(), true);
                                saptrueNodeId.setProperty("selectedKey", " ", true);
                                saptrueNodeId.setProperty("selectedItemId", item.getId(), true);
                                saptrueNodeId.fireChange({
                                    newValue: item.getText(),
                                    selectedItem: item
                                });

                            }
                        }
                    }
                    break;
					//Added by Sagar
				case "sap.extent.uilib.ComboBox":
				{


                        for (var i = 0; i < saptrueNodeId.getItems().length; i++) {
                            if (saptrueNodeId.getItems()[i].getText() == value) {
                                item = sap.ui.getCore().byId(saptrueNodeId.getItems()[i].sId);
                                saptrueNodeId.setValue(item.getText(), true);
                                saptrueNodeId.setProperty("selectedKey", " ", true);
                                saptrueNodeId.setProperty("selectedItemId", item.getId(), true);
                                saptrueNodeId.fireChange({
                                    newValue: item.getText(),
                                    selectedItem: item
                                });

                            }
                        }
                    }
				break;
				//Added by Sagar
				case "sap.ui.commons.ComboBox":
				{


                        for (var i = 0; i < saptrueNodeId.getItems().length; i++) {
                            if (saptrueNodeId.getItems()[i].getText() == value) {
                                item = sap.ui.getCore().byId(saptrueNodeId.getItems()[i].sId);
                                saptrueNodeId.setValue(item.getText(), true);
                                saptrueNodeId.setProperty("selectedKey", " ", true);
                                saptrueNodeId.setProperty("selectedItemId", item.getId(), true);
                                saptrueNodeId.fireChange({
                                    newValue: item.getText(),
                                    selectedItem: item
                                });

                            }
                        }
                    }
				break;

				case "sap.b.controls.common.ComboBox":
				{

					for (var i = 0; i < saptrueNodeId.getItems().length; i++) {
                            if (saptrueNodeId.getItems()[i].getText() == value) {
                                item = sap.ui.getCore().byId(saptrueNodeId.getItems()[i].sId);
                                saptrueNodeId.setValue(item.getText(), true);
                                saptrueNodeId.setProperty("selectedKey", " ", true);
                                saptrueNodeId.setProperty("selectedItemId", item.getId(), true);
                                saptrueNodeId.fireChange({
                                    newValue: item.getText(),
                                    selectedItem: item
                                });

                            }
                        }
				}
				break;

				case "sap.b.controls.simple.DropDownListBox" :
				{
					for (var i = 0; i < saptrueNodeId.getItems().length; i++) {
                            if (saptrueNodeId.getItems()[i].getText() == value) {
                                item = sap.ui.getCore().byId(saptrueNodeId.getItems()[i].sId);
                                saptrueNodeId.setValue(item.getText(), true);
                                saptrueNodeId.setProperty("selectedKey", " ", true);
                                saptrueNodeId.setProperty("selectedItemId", item.getId(), true);
                                saptrueNodeId.fireChange({
                                    newValue: item.getText(),
                                    selectedItem: item
                                });

                            }
                        }
				}
				break;

                case "sap.ui.unified.calendar.Month":
                    {
                        var str = opnValue.replace(/-/g, "");
                        jQuery(trueNodeid + '-' + str).click();
                    }
                    break;
						case "sap.m.RatingIndicator":{
						saptrueNodeId.setValue(Number(opnValue));
						saptrueNodeId.fireChange();
				break;}
				case "sap.m.ComboBox":{
						saptrueNodeId.setSelectedKey(opnValue);
						saptrueNodeId.fireChange()
					break;}
                case "sap.m.DatePicker":
                    {
                        //saptrueNodeId.setValue(new Date(opnValue));
						saptrueNodeId.setValue(opnValue);
                    }
                    break;
                case "sap.m.Slider":
                    {

                        saptrueNodeId.setValue(Number(opnValue));

                        // new validated value
                        saptrueNodeId.fireLiveChange({
                            value: opnValue
                        });
                    }
                    break;
                default:
                    {
                        saptrueNodeId[fireOpn](opnValue);
                    };

            }
            var a = document.getElementById(trueNodeid);
            return jQuery("html");
        }
    });





		//----ui5action ends here


			
	//custom locator
	
	//Added by Sagar
	//Custom locator using metadata hierarchy
	by.addLocator('ui5m', function(ui5ControlProperties, index, parent_El, root) {

		var sapBody = document.getElementsByClassName('sapUiBody');
var nodes = document.querySelectorAll('*');
var ui5Obj = ui5ControlProperties;
var index = index || 0;
var metadata;
var trueNodeid = null;
var trueNodeids = [];
var trueNodeidsMp = [];
var elemFound = false;
var elemFoundOnlyOne = false;
var mProp;
var mPropFlag = 0;
var elemCount = 0;
var elemFoundIds = [];
var elemFoundIds1 = [];
var ParMatchArr = [];var ParMatchArrMp = [];
var MatchArr = [];var MatchArrMp = [];
var parid;
var prevSibMatchArr = [];var prevSibMatchArrMp = [];
var prevSibPropBool;
var i = 0;
var elemfoundatpar = false;
var elemfoundatprev = false;
var elemfoundatnex = false;
var elemfoundatcli = false;
var mpropfunccall = false;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
Array.prototype.filter.call(nodes, function(node) {
    if (sap.ui.getCore().byId(node.getAttribute('id')) !== undefined) {
        metadata = sap.ui.getCore().byId(node.getAttribute('id')).getMetadata().getName();
        if (metadata == ui5Obj.elementProperties.metadata) {
            elemCount++;
            elemFoundIds.push(node.getAttribute('id'));
            //console.log(elemFoundIds[i]); i++;
        }
    }
});
i = 0;
if (elemCount == 1) {
    elemFoundOnlyOne = true;
    trueNodeid = elemFoundIds[0];
	
} else if (elemCount > 1) {
	if(ui5Obj.parentProperties == undefined || ui5Obj.parentProperties.metadata == undefined)
	{
		if (ui5Obj.prevSiblingProperties == undefined || ui5Obj.prevSiblingProperties.metadata == undefined) {
            if (ui5Obj.nextSiblingProperties == undefined || ui5Obj.nextSiblingProperties.metadata == undefined) {
                if (ui5Obj.childProperties == undefined || ui5Obj.childProperties.metadata == undefined) {
                    i = 0;
                    elemFound = true;
					//console.log("inside yay")
                    while (i < elemFoundIds.length) {
                        trueNodeids.push({
                            id: elemFoundIds[i]
                        });
                        i++;
                    }
                } else {
                    call_Check_For_Child_Metadata(elemFoundIds); //Function Call
                }
            } else {
                call_Check_For_NextSibling_Metadata(elemFoundIds); //Function Call
            }
        } else {
            call_Check_For_PrevSibling_Metadata(elemFoundIds); //Function Call
        }
	}else{
		call_Check_For_Parent_Metadata(elemFoundIds);  //Function Call
	}
}

//element found
if(elemFoundOnlyOne)
{
		trueNodeid = trueNodeid;
		var saptrueNodeId = sap.ui.getCore().byId(trueNodeid);
            //var assertAttribute = "get" + attribute.capitalize();
            var obtainedValue;


            var mProperties = saptrueNodeId.mProperties;

            node = document.getElementById(trueNodeid);
            jQuery.each(mProperties, function(key, value) {
                node.setAttribute('data-' + key, value);
            });
            return node;
}else if (elemFound) {
	if(trueNodeids.length !== 0){
		//console.log("inside elements found " +trueNodeids.length);
		if(elemFoundOnlyOne == false && ui5Obj.elementProperties !== undefined && ui5Obj.elementProperties.mProperties !== undefined && Object.keys(ui5Obj.elementProperties.mProperties).length !== 0)
		{
			check_For_mProperties(trueNodeids); //Function Call
		}
		if(elemFoundOnlyOne == false && ui5Obj.parentProperties !== undefined && ui5Obj.parentProperties.mProperties !== undefined && Object.keys(ui5Obj.parentProperties.mProperties).length !== 0)
		{
			//console.log(trueNodeids.length)
			check_For_Parent_mProperties(trueNodeids); //Function Call
		}
		if(elemFoundOnlyOne == false && ui5Obj.prevSiblingProperties !== undefined && ui5Obj.prevSiblingProperties.mProperties !== undefined && Object.keys(ui5Obj.prevSiblingProperties.mProperties).length !== 0)
		{
			//console.log("inside prev")
			check_For_PrevSib_mProperties(ParMatchArr); //Function Call
		}
		if(elemFoundOnlyOne == false && ui5Obj.nextSiblingProperties !== undefined && ui5Obj.nextSiblingProperties.mProperties !== undefined && Object.keys(ui5Obj.nextSiblingProperties.mProperties).length !== 0)
		{
			check_For_NextSib_mProperties(ParMatchArr) //Function Call
		}
		if(elemFoundOnlyOne == false && ui5Obj.childProperties !== undefined && ui5Obj.childProperties.mProperties !== undefined && Object.keys(ui5Obj.childProperties.mProperties).length !== 0)
		{
			check_For_Child_mProperties(ParMatchArr); //Function Call
		}
	}
	if(elemFoundOnlyOne)
	{
		//console.log(trueNodeid);
		trueNodeid = trueNodeid;
		var saptrueNodeId = sap.ui.getCore().byId(trueNodeid);
            //var assertAttribute = "get" + attribute.capitalize();
            var obtainedValue;


            var mProperties = saptrueNodeId.mProperties;

            node = document.getElementById(trueNodeid);
            jQuery.each(mProperties, function(key, value) {
                node.setAttribute('data-' + key, value);
            });
            return node;
	}else{
		
		display_All();
		assign_All();
	}
    //console.log("I am done");
}
//console.log("I am exiting..!");


function assign_All()
{
			i = 0;
			while (i < trueNodeids.length) {
				trueNodeids[i].id = trueNodeids[i].id;
				i++;
			}
			return trueNodeids[index];
}


//function to display id's if multiple elements are returned
function display_All()
{
			i = 0;
			while (i < trueNodeids.length) {
				console.log(trueNodeids[i].id);
				i++;
			}
}


//function call_Check_For_Parent_Metadata
function call_Check_For_Parent_Metadata(elemFoundIds) {
	console.log("called 1");
    var propelemIds = [];
    var propElemCount = 0;

    jQuery.each(elemFoundIds, function(key, value) {
        var parMetadata;
        var parProp;
        var str = "id=" + "'" + value + "'";
        var par = jQuery('[' + str + ']').parent();
        parid = par.attr('id');
        var count = 0;

        var parMProp;

        while (1) {
            if (parid !== undefined) {

                if (sap.ui.getCore().byId(parid) !== undefined) {
                    parMetadata = sap.ui.getCore().byId(parid).getMetadata().getName();
                    
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

        var parBool = parMetadata === ui5Obj.parentProperties.metadata;
        if (parBool == 1) {
          
            ParMatchArr.push({
                parid: parid,
                elid: value
            });
          
        }
    });


    if (ParMatchArr.length == 1) {

        elemFoundOnlyOne = true;
        trueNodeid = ParMatchArr[0].elid;


    } else if (ParMatchArr.length > 1) {
        if (ui5Obj.prevSiblingProperties == undefined || ui5Obj.prevSiblingProperties.metadata == undefined) {
            if (ui5Obj.nextSiblingProperties == undefined || ui5Obj.nextSiblingProperties.metadata == undefined) {
                if (ui5Obj.childProperties == undefined || ui5Obj.childProperties.metadata == undefined) {
                    i = 0;
                    elemFound = true;
                    while (i < ParMatchArr.length) {
                        trueNodeids.push({
                            id: ParMatchArr[i].elid
                        });
						console.log(trueNodeids[i].id);
                        i++;
                    }
                    elemfoundatpar = true;
                } else {
                    
                    call_Check_For_Child_Metadata(ParMatchArr); //Function Call

                }
            } else {
            
                call_Check_For_NextSibling_Metadata(ParMatchArr); //Function Call

            }
        } else {
          
            call_Check_For_PrevSibling_Metadata(ParMatchArr); //Function Call
        }
    }

}



//Function call_Check_For_PrevSibling_Metadata
function call_Check_For_PrevSibling_Metadata(ParMatchArr) {
  console.log("called 2");
    jQuery.each(ParMatchArr, function(index, parmatchNode) {

        var parNodes = document.getElementById(parmatchNode.parid).querySelectorAll('*');
        var ind = 0;
        //load metadata elements into an array
        var parMetaNodeElems = []
        var parMetaNodes = [];
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
        var sibBool;
        jQuery.each(parMetaNodeElems, function(i, v) {
            if (parmatchNode.elid == v.id) {
                sibBool = true;

                //Previous Sibling Properties
                if (parMetaNodes[i - 1] != undefined) {
                    var j = i - 1;
                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                    var prevelemid = jQuery('[' + str + ']').parent();
                    var prevelempar = prevelemid.attr('id');
                    while (j <= (parMetaNodeElems.length - 1)) {

                        if (prevelempar != undefined) {
                            if (sap.ui.getCore().byId(prevelempar) !== undefined) {
                                if (parmatchNode.parid == prevelempar) {

                                    prevSibElem = parMetaNodes[j];
                                    break;
                                } else {
                                    j = j - 1;
                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
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
            }
        });
        if (!sibBool) {
            prevSibElem = {};
        }

       
        var prevSibPropBool = 0;

        if (Object.keys(prevSibElem).length !== 0) {
            if (ui5Obj.prevSiblingProperties.metadata == prevSibElem.metadata) {
         
            
                prevSibMatchArr.push({
                    elid: parmatchNode.elid,
                    parid: parmatchNode.parid
                });
              
            }
        }
    });
  
    if (prevSibMatchArr.length == 1) {
        elemFoundOnlyOne = true;
        trueNodeid = prevSibMatchArr[0].elid;
    } else if (prevSibMatchArr.length > 1) {
        if (ui5Obj.nextSiblingProperties == undefined || ui5Obj.nextSiblingProperties.metadata == undefined) {
            if (ui5Obj.childProperties == undefined || ui5Obj.childProperties.metadata == undefined) {
                i = 0;
                elemFound = true;
                while (i < prevSibMatchArr.length) {
                    trueNodeids.push({
                        id: prevSibMatchArr[i].elid
                    });
                  console.log(trueNodeids[i].id)
                    i++;
                }
                elemfoundatprev = true;
            } else {
               
                call_Check_For_Child_Metadata(prevSibMatchArr); //Function Call

            }
        } else {
           
            call_Check_For_NextSibling_Metadata(prevSibMatchArr); //Function Call

        }
    }
}



//Function call_Check_For_NextSibling_Metadata
function call_Check_For_NextSibling_Metadata(prevSibMatchArr) {
   console.log("called 3");
    var nxtSibMatchArr = [];
    jQuery.each(prevSibMatchArr, function(index, nxtSibMatchNode) {
      

        var parNodes = document.getElementById(nxtSibMatchNode.parid).querySelectorAll('*');
        var ind = 0;
        //load metadata elements into an array
        var parMetaNodeElems = []
        var parMetaNodes = [];
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

        var nextSibBool;

        var nextSibElem;
        var sibBool = false;
        jQuery.each(parMetaNodeElems, function(i, v) {
            if (nxtSibMatchNode.elid == v.id) {
                sibBool = true;
                if (parMetaNodes[i + 1] != undefined) {
                    var j = i + 1;
                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                    var nxtelemid = jQuery('[' + str + ']').parent();

                    var nxtelempar = nxtelemid.attr('id');
                    while (j <= (parMetaNodeElems.length - 1)) {

                        if (nxtelempar != undefined) {
                            if (sap.ui.getCore().byId(nxtelempar) !== undefined) {
                                if (nxtSibMatchNode.parid == nxtelempar) {

                                    nextSibElem = parMetaNodes[j];
                                    break;
                                } else {
                                    j = j + 1;
                                    if (j > (parMetaNodeElems.length - 1)) {
                                        nextSibElem = {};
                                        break;
                                    }
                                    var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                                    nxtelemid = jQuery('[' + str + ']').parent();

                                    nxtelempar = nxtelemid.attr('id');

                                }
                            } else {

                                nxtelemid = (nxtelemid).parent();
                                nxtelempar = nxtelemid.attr('id');
                            }


                        } else {

                            nxtelemid = nxtelemid.parent();
                            nxtelempar = nxtelemid.attr('id');

                        }
                    }

                } else {
                    nextSibElem = {};
                }

            }



        });
        if (!sibBool) {
            nextSibElem = {};
        }

       
        var nxtSibPropBool = 0;
        if (Object.keys(nextSibElem).length !== 0) {
            if (ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata) {
                
                nxtSibMatchArr.push({
                    elid: nxtSibMatchNode.elid,
                    parid: nxtSibMatchNode.parid
                });
               
            }
        }




    });
    if (nxtSibMatchArr.length == 1) {
        elemFoundOnlyOne = true;
        trueNodeid = nxtSibMatchArr[0].elid;
    } else if (nxtSibMatchArr.length > 1) {

        if (ui5Obj.childProperties == undefined || ui5Obj.childProperties.metadata == undefined) {
            i = 0;
            elemFound = true;
            while (i < nxtSibMatchArr.length) {
                trueNodeids.push({
                    id: nxtSibMatchArr[i].elid
                });
              //console.log(trueNodeids[i].id)
                i++;
            }
            elemfoundatnex = true;
        } else {
            call_Check_For_Child_Metadata(nxtSibMatchArr); //Function Call
           
        }
    }
}


//Function call_Check_For_Child_Metadata
function call_Check_For_Child_Metadata(nxtSibMatchArr) {
   console.log("called 4");debugger
    var childMatchArr = [];
    var childElem = {};
    jQuery.each(nxtSibMatchArr, function(index, nxtSibMatchArrNodes) {
        var childElemNodes = document.getElementById(nxtSibMatchArrNodes.elid).querySelectorAll('*');
        if (childElemNodes.length == 0) {
            childElem = {};
        } else {
            jQuery.each(childElemNodes, function(v, i) {
                if (sap.ui.getCore().byId(i.id) !== undefined) {

                    childProp = sap.ui.getCore().byId(i.id).mProperties;

                    childElem = {
                        "metadata": sap.ui.getCore().byId(i.id).getMetadata().getName(),
                        "mProperties": childProp
                    };
                    return false;
                } else {
                    childElem = {};
                }
            });
        }
        var childPropBool = 0;

        if (Object.keys(childElem).length !== 0) {
            if (ui5Obj.childProperties.metadata == childElem.metadata) {
                
                childMatchArr.push({
                    elid: nxtSibMatchArrNodes.elid,
                    parid: nxtSibMatchArrNodes.parid
                });
              
            }
        }
    });


    if (childMatchArr.length == 1) {
        elemFoundOnlyOne = true;
        trueNodeid = childMatchArr[0].elid;
    } else if (childMatchArr.length > 1) {
        i = 0;
        elemFound = true;
        while (i < childMatchArr.length) {
            trueNodeids.push({
                id: childMatchArr[i].elid
            });
           console.log(trueNodeids[i].id)
            i++;
        }
        elemfoundatcli = true;
    }
}


//Function check_For_mProperties
function check_For_mProperties(trueNodeids)
{console.log("called 5");
	//console.log("inside elem mprop");
	var elem;
	var mProp;
	var mPropFlag = false;
	i=0;
	while(i<trueNodeids.length)
	{
		//console.log(trueNodeids[i].id);
		if(ui5Obj.elementProperties.mProperties !== undefined)
		{
		elem = sap.ui.getCore().byId(trueNodeids[i].id);
		//console.log(elem);
		mProp = elem.mProperties;
		jQuery.each(mProp, function(key, val) {
            if (val == '[object Object]' || typeof(val) == 'object') {
                delete mProp[key];
            }
        });
		jQuery.each(ui5Obj.elementProperties.mProperties, function(key, value) {
			
			if(ui5Obj.elementProperties.mProperties[key] == mProp[key])
			{
				
				mPropFlag = true;
					mpropfunccall = true;
					MatchArr.push({
                    id: elem.sId
                });
			}
			else {
                    mPropFlag = false;
                    return false;
                }
		});
		i++;
		}
	}
	if(MatchArr.length == 1)
	{
		elemFoundOnlyOne = true;
		trueNodeid = MatchArr[0].id;
	}else if(mPropFlag == true){
		trueNodeids = [];
		var j=0;
		while (j < MatchArr.length) {
            trueNodeids.push({
                id: MatchArr[j].elid
            });
			console.log(trueNodeids[j].id)
            j++;
        }
	}
}


function check_For_Parent_mProperties(trueNodeids)
{console.log("called 6");
	var i = 0;
	while(i<trueNodeids.length)
	{
	//console.log(trueNodeids[i].id);
	
        var parMetadata;
        var parProp;
        var str = "id=" + "'" + trueNodeids[i].id + "'";
        var par = jQuery('[' + str + ']').parent();
        parid = par.attr('id');
		//console.log(parid);
        while (1) {
            if (parid !== undefined) {

                if (sap.ui.getCore().byId(parid) !== undefined) {
                    parMetadata = sap.ui.getCore().byId(parid).getMetadata().getName();

                    parMProp = sap.ui.getCore().byId(parid).mProperties;
                    var j = Object.keys(parMProp).length;
                    jQuery.each(parMProp, function(key, val) {
                        if (val == '[object Object]' || typeof(val) == 'object') {
                            delete parMProp[key];
                        }
                    });
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

        var parPropBool = 0;
        if (Object.keys(ui5Obj.parentProperties.mProperties).length == 0 || Object.keys(parMProp).length == 0) {
            parPropBool = 1;
        } else {
            jQuery.each(ui5Obj.parentProperties.mProperties, function(key, value) {
				//console.log(parMProp[key]);
                if (ui5Obj.parentProperties.mProperties[key] == parMProp[key]) {
                    parPropBool = 1;
					ParMatchArrMp.push({
                parid: parid,
                elid: trueNodeids[i].id
            });
                } else {
                    parPropBool = 0;
                    return false;
                }
            });
        }
	i++;//console.log(ParMatchArrMp.length)
    }
    if (ParMatchArrMp.length == 1) {
		elemFoundOnlyOne = true;
        elemFound = true;
        trueNodeid = ParMatchArrMp[0].elid;
    }

    else if (ParMatchArrMp.length > 1) {
		trueNodeids = [];
		var j=0;
		while (j < MatchArrMp.length) {
            trueNodeids.push({
                id: ParMatchArrMp[j].elid
            });
			console.log(trueNodeids[j].id);
            j++;
        }
	}

}


function check_For_PrevSib_mProperties(ParMatchArr)
{console.log("called 7");
	//console.log("inside prev")
	 var prevSibMatchArr = [];
        jQuery.each(ParMatchArr, function(index, parmatchNode) {

            var parNodes = document.getElementById(parmatchNode.parid).querySelectorAll('*');
            var ind = 0;
            //load metadata elements into an array
            var parMetaNodeElems = []
            var parMetaNodes = [];
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
            var sibBool;
            jQuery.each(parMetaNodeElems, function(i, v) {
                if (parmatchNode.elid == v.id) {
					//console.log("inside prev eq")
                    sibBool = true;

                    //Previous Sibling Properties
                    if (parMetaNodes[i - 1] != undefined) {
                        var j = i - 1;
                        var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                        var prevelemid = jQuery('[' + str + ']').parent();




                        var prevelempar = prevelemid.attr('id');
                        while (j <= (parMetaNodeElems.length - 1)) {

                            if (prevelempar != undefined) {
                                if (sap.ui.getCore().byId(prevelempar) !== undefined) {
                                    if (parmatchNode.parid == prevelempar) {

                                        prevSibElem = parMetaNodes[j];
                                        break;
                                    } else {
                                        j = j - 1;
                                        var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
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



                }
            });
            if (!sibBool) {
                prevSibElem = {};
            }

            var prevSibPropBool = 0;

            if (Object.keys(prevSibElem).length !== 0 && Object.keys(ui5Obj.prevSiblingProperties).length !== 0) {
                
                    if (Object.keys(ui5Obj.prevSiblingProperties.mProperties).length == 0 || Object.keys(prevSibElem.mProperties).length == 0) {
                        prevSibPropBool = 1;
                    } else {
                        jQuery.each(ui5Obj.prevSiblingProperties.mProperties, function(key, value) {
                            if (ui5Obj.prevSiblingProperties.mProperties[key] == prevSibElem.mProperties[key]) {
                                prevSibPropBool = 1;
                            } else {
                                prevSibPropBool = 0;
                                return false;
                            }
                        });
                    }
                
            }
            var prevSibEmptyMpropFlag = false;
            //var prevSibBool = ui5Obj.prevSiblingProperties.metadata == prevSibElem.metadata && prevSibPropBool == 1;
            if (Object.keys(prevSibElem).length == 0 && Object.keys(ui5Obj.prevSiblingProperties).length == 0) {
                prevSibEmptyMpropFlag = true;
            }

            if (prevSibPropBool || prevSibEmptyMpropFlag) {
                prevSibMatchArrMp.push({
                    elid: parmatchNode.elid,
                    parid: parmatchNode.parid
                });
            };


        });
        //console.log(prevSibMatchArr.length);
        if (prevSibMatchArrMp.length == 1) {
			elemFoundOnlyOne = true;
            elemFound = true;
            trueNodeid = prevSibMatchArrMp[0].elid;

        } else if (prevSibMatchArrMp.length > 1) {
			
			trueNodeids = [];
		var j=0;
		while (j < prevSibMatchArrMp.length) {
            trueNodeids.push({
                id: prevSibMatchArrMp[j].elid
            });
			console.log(trueNodeids[j].id);
            j++;
        }
		}
}

function check_For_NextSib_mProperties(ParMatchArr)
{console.log("called 8");
	var nxtSibMatchArr = [];var nxtSibMatchArrMp = [];
            jQuery.each(ParMatchArr, function(index, nxtSibMatchNode) {
              //  console.log(index + nxtSibMatchNode);

                var parNodes = document.getElementById(nxtSibMatchNode.parid).querySelectorAll('*');
                var ind = 0;
                //load metadata elements into an array
                var parMetaNodeElems = []
                var parMetaNodes = [];
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

                var nextSibBool;

                var nextSibElem;
                var sibBool = false;
                jQuery.each(parMetaNodeElems, function(i, v) {
                    if (nxtSibMatchNode.elid == v.id) {
                        sibBool = true;
                        if (parMetaNodes[i + 1] != undefined) {
                            var j = i + 1;
                            var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                            var nxtelemid = jQuery('[' + str + ']').parent();

                            var nxtelempar = nxtelemid.attr('id');
                            while (j <= (parMetaNodeElems.length - 1)) {

                                if (nxtelempar != undefined) {
                                    if (sap.ui.getCore().byId(nxtelempar) !== undefined) {
                                        if (nxtSibMatchNode.parid == nxtelempar) {

                                            nextSibElem = parMetaNodes[j];
                                            break;
                                        } else {
                                            j = j + 1;
                                            if (j > (parMetaNodeElems.length - 1)) {
                                                nextSibElem = {};
                                                break;
                                            }
                                            var str = "id=" + "'" + parMetaNodeElems[j].id + "'";
                                            nxtelemid = jQuery('[' + str + ']').parent();

                                            nxtelempar = nxtelemid.attr('id');

                                        }
                                    } else {

                                        nxtelemid = (nxtelemid).parent();
                                        nxtelempar = nxtelemid.attr('id');
                                    }


                                } else {

                                    nxtelemid = nxtelemid.parent();
                                    nxtelempar = nxtelemid.attr('id');

                                }
                            }

                        } else {
                            nextSibElem = {};
                        }

                    }



                });
                if (!sibBool) {
                    nextSibElem = {};
                }

               // console.log(JSON.stringify(nextSibElem) + "next sibling");
                var nxtSibPropBool = 0;
                if (Object.keys(nextSibElem).length !== 0 && Object.keys(ui5Obj.nextSiblingProperties).length !== 0) {
                    
                        if (Object.keys(ui5Obj.nextSiblingProperties.mProperties).length == 0 || Object.keys(nextSibElem.mProperties).length == 0) {
                            nxtSibPropBool = 2;
                        } else {
                            jQuery.each(ui5Obj.nextSiblingProperties.mProperties, function(key, value) {
                                if (ui5Obj.nextSiblingProperties.mProperties[key] == nextSibElem.mProperties[key]) {
                                    nxtSibPropBool = 1;
                                } else {
                                    nxtSibPropBool = 0;
                                    return false;
                                }
                            });
                        }
                    
                }
                var nextSibEmptyMpropFlag = false;
                //var nxtSibBool = ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata && nxtSibPropBool == 1;
                if (Object.keys(nextSibElem).length == 0 && Object.keys(ui5Obj.nextSiblingProperties).length == 0) {
                    nextSibEmptyMpropFlag = true;
                }

                if (nxtSibPropBool || nextSibEmptyMpropFlag) {
                    nxtSibMatchArrMp.push({
                        elid: nxtSibMatchNode.elid,
                        parid: nxtSibMatchNode.parid

                    });
                }



            });
			//console.log(nxtSibMatchArrMp.length)
            if (nxtSibMatchArrMp.length == 1) {
                elemFound = true;
				elemFoundOnlyOne = true;
                trueNodeid = nxtSibMatchArrMp[0].elid;
            } else if (nxtSibMatchArrMp.length > 1) {
				trueNodeids = [];
		var j=0;
		while (j < nxtSibMatchArrMp.length) {
            trueNodeids.push({
                id: nxtSibMatchArrMp[j].elid
            });
			//console.log(trueNodeids[j].id);
            j++;
			}
}
}



function check_For_Child_mProperties(ParMatchArr)
{console.log("called 9");
	 var childMatchArr = [];var childMatchArrMp = [];
                var childElem = {};
                jQuery.each(ParMatchArr, function(index, nxtSibMatchArrNodes) {
                    var childElemNodes = document.getElementById(nxtSibMatchArrNodes.elid).querySelectorAll('*');
                    if (childElemNodes.length == 0) {
                        childElem = {};
                    } else {
                        jQuery.each(childElemNodes, function(v, i) {
                            if (sap.ui.getCore().byId(i.id) !== undefined) {

                                childProp = sap.ui.getCore().byId(i.id).mProperties;

                                childElem = {
                                    "metadata": sap.ui.getCore().byId(i.id).getMetadata().getName(),
                                    "mProperties": childProp
                                };
                                return false;
                            } else {
                                childElem = {};
                            }
                        });
                    }
                    var childPropBool = 0;

                    if (Object.keys(childElem).length !== 0 && Object.keys(ui5Obj.childProperties).length !== 0) {
                      
                            if (Object.keys(ui5Obj.childProperties.mProperties).length == 0 || Object.keys(childElem.mProperties).length == 0) {
                                childPropBool = 2;
                            } else {
                                jQuery.each(ui5Obj.childProperties.mProperties, function(key, value) {
                                    if (ui5Obj.childProperties.mProperties[key] == childElem.mProperties[key]) {
                                        childPropBool = 1;
                                    } else {
                                        childPropBool = 0;
                                        return false;
                                    }
                                });
                            }
                        
                    }
                    var childEmptyMpropFlag = false;
                    //var nxtSibBool = ui5Obj.nextSiblingProperties.metadata == nextSibElem.metadata && nxtSibPropBool == 1;
                    if (Object.keys(childElem).length == 0 && Object.keys(ui5Obj.childProperties).length == 0) {
                        childEmptyMpropFlag = true;
                    }

                    if (childPropBool || childEmptyMpropFlag) {
                        childMatchArrMp.push({
                            elid: nxtSibMatchArrNodes.elid,
                            parid: nxtSibMatchArrNodes.parid

                        });
                    }

                });

                
                if (childMatchArrMp.length == 1) {
                    elemFound = true;
					elemFoundOnlyOne = true;
                    trueNodeid = childMatchArrMp[0].elid;
                } else if (childMatchArrMp.length > 1) {
                    trueNodeids = [];
					var j=0;
					while (j < childMatchArrMp.length) {
						trueNodeids.push({
							id: childMatchArrMp[j].elid
						});
						//console.log(trueNodeids[j].id);
						j++;
					}
                }
}

        
        //trueNodeid += '-'+opnvalue;
        if (elemFound) {

            var saptrueNodeId = sap.ui.getCore().byId(trueNodeid);
            //var assertAttribute = "get" + attribute.capitalize();
            var obtainedValue;


            var mProperties = saptrueNodeId.mProperties;

            node = document.getElementById(trueNodeid);
            jQuery.each(mProperties, function(key, value) {
                node.setAttribute('data-' + key, value);
            });
            return node;


        }

    });

//ui5m locator ends here..
	        jasmine.getEnv().addReporter({
	  //TODO consider several describe() per spec file
        suiteStarted: function(result){
			//console.log('suite started');
          // enclose all WebDriver operations in a new flow so to handle potential failures
          browser.controlFlow().execute(function() {
			  //console.log("\nUrl :"+browser.baseUrl);
			  browser.driver.manage().window().maximize();
			  var authConfigs=require('./authConfig.js');
			  //var formAuthenticator=require('./authenticator/formAuthenticator.js');
						//console.log(browser.params.auth.username);
						//console.log(browser.params.auth.formType);
						//console.log(JSON.stringify(authConfigs.authConfigs[browser.params.auth.formType]));

						  //Added for Vyper test Coverage Code
						     var thatUrl = browser.baseUrl;
									if (browser.params.coverage) {
											var UrlParser = require('../../coverage/utils/coverageHelper.js');

											browser.baseUrl='https://localhost:443/'+UrlParser.getExtendedUrl(thatUrl);

										}



						if(authConfigs.authConfigs[browser.params.auth.formType]){
								//console.log(browser.params.auth.formType);

								var authObj=browser.params.auth;
								var instanceConf=authConfigs.authConfigs[browser.params.auth.formType];
								var authenticatorFile=instanceConf.name;

								//console.log("auth"+JSON.stringify(authObj));
								//console.log("instance"+JSON.stringify(instanceConf));
								//console.log("authenticatorFile"+authenticatorFile);


								//require(authenticatorFile)(user,pass,userFieldSelector,passFieldSelector,logonButtonSelector);

								require(authenticatorFile)(authObj,instanceConf);

								//formAuthenticator.get(browser.params.auth.url)

						}
					});
	           }
		});



//Added for Vyper test Coverage Code
var istanbul = require('../../coverage/node_modules/istanbul');
var collector = new istanbul.Collector();
var reporter;
jasmine.getEnv().addReporter({
    suiteDone: function() {

        if (browser.params.coverage) {

            var promise = browser.driver.executeScript('return __coverage__;')
                .then(function(coverageResults) {
									console.log("\nWriting Coverage details");
                    collector.add(coverageResults);
                    return collector;
                }).then(function(collector) {
									console.log('Coverage report successfully generated');
                    var reportfile = 'coverageReport/json';
                    reporter = new istanbul.Reporter(undefined, reportfile);
                    reporter.add('json');
					var reportfile = 'coverageReport/html';
					 reporter.write(collector, true, function() {
                        //console.log('Coverage report successfully generated');
                    });
                    reporter = new istanbul.Reporter(undefined, reportfile);
                    reporter.add('html');
                    reporter.write(collector, true, function() {
                        //console.log('Coverage report successfully generated');
                    });

                });
        }
    }
});



	}
