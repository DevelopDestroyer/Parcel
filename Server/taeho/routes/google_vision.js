var express = require('express');

var request = require('request');

var router = express.Router();


/* GET users listing. */
router.get('/', function(req, res, next) {
	
  
	var tar_url = req.param('target_url');
	//r result_msg = "mtymy";
	

	request.post(
		'https://vision.googleapis.com/v1/images:annotate?key=AIzaSyCtCraZb4zlI8G8lij1Vi5BKbGnj1Z-NHs',
		{ json: { requests: [
		   {image:
			 { source:
			   { imageUri: tar_url}
			 },
			 features: [ { type: 'TEXT_DETECTION'}]
		   }
		  ]
		 } },
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				//console.log(JSON.stringify(body))
				
				response.on('end', function() {
					console.log(response.statusCode);
					console.log(body.toString());
					//res.send();
					//result_msg += "hhihihihi : " + body.toString();
				});
				
				//var GoogleVisionOBJ = JSON.parse(body.toString());
				//console.log("하이루 " + body.responses);
				//console.log("하이루 22 : " + JSON.stringify(body.responses));
				var GoogleVisionOBJ = JSON.parse(JSON.stringify(body.responses));
				var addressInfo = JSON.stringify(GoogleVisionOBJ[0]["fullTextAnnotation"]["text"]);
				console.log(" TEXT 영역 " + addressInfo);
				//console.log(" 빨리2222 " + JSON.stringify(GoogleVisionOBJ.textAnnotations));
				
				//console.log("하이루 33 : " + JSON.stringify(body.responses.textAnnotations));
				
				//console.log("하이루 33 : " + JSON.stringify(body.responses.fullTextAnnotation));
				
				
				res.send(addressInfo);
				
				//;
				
			}
			else{
					console.log("응답 실패 : " + response.statusCode);
					//console.log("ddd?? : " + body.toString());
			}
			
		}
	);


});

module.exports = router;
