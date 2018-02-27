var fs=require('fs');
var csv=require('../node_modules/fast-csv');




exports.
whiteList=function(whitelistFileNamesPath) {
	
	var csvdata=[];
    return new Promise(
        function (resolve, reject) {
			
           fs.createReadStream(whitelistFileNamesPath)
.pipe(csv())
.on('data',function(data){
	csvdata.push(data.toString());
 })
.on('end',function(data){
	resolve(csvdata);
	

 });
		
});
} 





/*function ignoreFile(ignoreFile){
fs.createReadStream('datasample.csv')
.pipe(csv())
.on('data',function(data){
    //console.log(data);
    console.log(data.toString());
    data=data.toString();
    if(data.includes(ignoreFile)){
        console.log('true');
        return true;
    }
    else{
        console.log('false');
    }
})
.on('end',function(data){
    console.log('read finished');
});
}*/

/*whiteList('/ui').then(function(res){
    console.log(res);
});*/
