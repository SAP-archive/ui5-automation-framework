# Vyper
Vyper is a test automation framework for automating UI5 applications.
It is a simple browser extension which enables automation of Integration scenarios and end  to end test scenarios, using UI5 control format making automation easy and stable 
 
 
# Vyper_Report_2.7.jar
This reporter takes 2 arguements
1. Path of .json file that is in your UI5Example/json folder
2. The html file to be generated (Ex : filename.html)
ex : ex: java -jar Vyper_Report_2.7.jar "C:/Vyper-master/UI5Example/json/jasmine-test-results.json" "results/VyperReport.html"

Please Note :
-> This new reporter has Script started time and Script ended time and the time taken to execute the script.
-> This reporter also take multiple .json files as input if the first arguement is a folder name instead of a file name.
-> If the first arguement is not given, the reporter will look for .json files in the present working directory.
-> It has Better readibility with the Script file names in the left panel and in the Header.