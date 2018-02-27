describe ( 'testScript_spec', function () {

it("step1:setValue on sap.m.SearchField", function () {
//*********************Block for sap.m.StandardListItem - Perform Assert*****************************************************************
browser.sleep(10000);
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.m.StandardListItem","mProperties":{"title":"Slider"}},
							"parentProperties":{"metadata":"sap.m.List","mProperties":{"noDataText":"No Entities Selected","mode":"SingleSelectMaster"}},
							"prevSiblingProperties":{"metadata":"sap.m.StandardListItem","mProperties":{"title":"RangeSlider"}},
							"nextSiblingProperties":{},
							"childProperties":{}
							};
var Index=0;
var attribute = "title";                //eg: title, text, value etc.
var compareValue ="Slider";             //expected value
//expect(element(by.ui5(ui5ControlProperties)).getUI5Attribute(attribute)).toBe(compareValue);
//!!*******************************************************************************************************
});


it("step2:click on sap.m.StandardListItem", function () {
//*********************Block for sap.m.StandardListItem - Perform Click*****************************************************************
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.m.StandardListItem","mProperties":{"title":"Slider"}},
							"parentProperties":{"metadata":"sap.m.List","mProperties":{"noDataText":"No Entities Selected","mode":"SingleSelectMaster"}},
							"prevSiblingProperties":{"metadata":"sap.m.StandardListItem","mProperties":{"title":"RangeSlider"}},
							"nextSiblingProperties":{},
							"childProperties":{}
							};
element(by.ui5(ui5ControlProperties)).click();
//!!*******************************************************************************************************

});




});
