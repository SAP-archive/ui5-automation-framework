describe ( 'testScript_spec', function () {
	//browser.sleep(5000);


it("step1:setValue on sap.m.SearchField", function () {//browser.sleep(5000);
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


it("step2:click on sap.m.StandardListItem", function () {//browser.sleep(5000);
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



it("step3:click on sap.m.ColumnListItem", function () {//browser.sleep(5000);
//*********************Block for sap.m.ColumnListItem - Perform Click*****************************************************************
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.m.ColumnListItem","mProperties":{"vAlign":"Middle","type":"Navigation"}},
							"parentProperties":{"metadata":"sap.m.Table","mProperties":{"showSeparators":"Inner"}},
							"prevSiblingProperties":{"metadata":"sap.m.Label","mProperties":{"text":"Description"}},
							"nextSiblingProperties":{},
							"childProperties":{"metadata":"sap.m.Text","mProperties":{"text":"Slider"}}
							};
element(by.ui5(ui5ControlProperties)).click();
//!!*******************************************************************************************************

});


it("step4:'change on sap.m.Slider", function () {//browser.sleep(5000);
//*********************Block for sap.m.Slider - Perform Action*****************************************************************
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"parentProperties":{"metadata":"sap.ui.layout.VerticalLayout","mProperties":{}},
							"prevSiblingProperties":{},
							"nextSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"childProperties":{}
							};
var Index=0;
var value='100';  //value to be entered by user
var UI5Action='change,liveChange';
element(by.ui5Action(ui5ControlProperties,UI5Action,Index,value)).perform();
//!!*******************************************************************************************************

});

it("step5:'change on sap.m.Slider", function () {//browser.sleep(5000);
//*********************Block for sap.m.Slider - Perform Action*****************************************************************
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"parentProperties":{"metadata":"sap.ui.layout.VerticalLayout","mProperties":{}},
							"prevSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"nextSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"childProperties":{}
							};
var Index=0;
var value='100';  //value to be entered by user
var UI5Action='change,liveChange';
element(by.ui5Action(ui5ControlProperties,UI5Action,Index,value)).perform();
//!!*******************************************************************************************************

});

it("step6:'change on sap.m.Slider", function () {//browser.sleep(5000);
//*********************Block for sap.m.Slider - Perform Action*****************************************************************
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"parentProperties":{"metadata":"sap.ui.layout.VerticalLayout","mProperties":{}},
							"prevSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"nextSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"childProperties":{}
							};
var Index=2;
var value='0';  //value to be entered by user
var UI5Action='change,liveChange';
element(by.ui5Action(ui5ControlProperties,UI5Action,Index,value)).perform();
//!!*******************************************************************************************************

});

it("step7:'change on sap.m.Slider", function () {//browser.sleep(5000);
//*********************Block for sap.m.Slider - Perform Action*****************************************************************
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"parentProperties":{"metadata":"sap.ui.layout.VerticalLayout","mProperties":{}},
							"prevSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"nextSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"childProperties":{}
							};
var Index=3;
var value='0';  //value to be entered by user
var UI5Action='change,liveChange';
element(by.ui5Action(ui5ControlProperties,UI5Action,Index,value)).perform();
//!!*******************************************************************************************************

});

it("step8:'change on sap.m.Slider", function () {//browser.sleep(5000);
//*********************Block for sap.m.Slider - Perform Action*****************************************************************
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"parentProperties":{"metadata":"sap.ui.layout.VerticalLayout","mProperties":{}},
							"prevSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"nextSiblingProperties":{"metadata":"sap.m.Slider","mProperties":{}},
							"childProperties":{}
							};
var Index=4;
var value='0';  //value to be entered by user
var UI5Action='change,liveChange';
element(by.ui5Action(ui5ControlProperties,UI5Action,Index,value)).perform();
//!!*******************************************************************************************************

});

it("step9:click on sap.ui.core.Icon", function () {//browser.sleep(5000);
//*********************Block for sap.ui.core.Icon - Perform Click*****************************************************************
var ui5ControlProperties =  {
							"elementProperties":{"metadata":"sap.ui.core.Icon","mProperties":{"src":"sap-icon://nav-back"}},
							"parentProperties":{"metadata":"sap.m.Button","mProperties":{"type":"Back"}},
							"prevSiblingProperties":{},
							"nextSiblingProperties":{},
							"childProperties":{}
							};
element(by.ui5(ui5ControlProperties)).click();
//!!*******************************************************************************************************

});

browser.sleep(5000);

});
