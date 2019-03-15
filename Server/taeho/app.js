/*
var createError = require('http-errors');
//var express = require('express'),http = require('http');
var express = require('express');



 //var socket = require('socket.io');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testapiRouter = require('./routes/testapi');
var googleVisionRouter = require('./routes/google_vision');
var iotControllerRouter = require('./routes/iot_controller');


var app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/testapi', testapiRouter);

app.use('/google_vision', googleVisionRouter);
app.use('/iot_controller', iotControllerRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
	  console.log('유저가 뭐라고 썼음');
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
  console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('Connected at 3000');
});
module.exports = app;
*/






const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
var path = require('path');
var express = require('express');
var moment = require('moment');
var urlencode = require('urlencode');

//아이오티 컨트롤러
const multer = require("multer");

let upload = multer({
  dest: "public/upload/"
})
//아이오티 컨트롤러 끝
//구글 비전
var request = require('request');
//구글 비전

app.use(express.static(path.join(__dirname, 'public')));
/*
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/public/test.html');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/test.html');
});
*/


io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
	  console.log('유저가 뭐라고 썼음');
    io.emit('chat message', msg);
  });

  socket.on('disconnect', () => {
  console.log('user disconnected');
  });
});

http.listen(3000, () => {
  console.log('Connected at 3000');
});




app.get('/so_test', function(req, res, next) {
	//var your_msg = req.param('msg');

	//시간 계산
  /*
	var m = moment();
	// format으로 출력한다
	var now_time = m.format("YYYY년 MM월 DD일 HH:mm:ss");



	io.emit('chat message', {"image_url" : "http://13.209.141.208:3000/upload/" + "test.png", "parcel_id" : "100" + getRandomInt(1000000,9000000), "line_id" : "" + getRandomInt(100,500), "line_condition":"" + getRandomInt(1,3),"time" : now_time});


	res.send("ㅇㅇㅇ");
  */


  request.post(
    'http://localhost:3000/iot_controller',
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
        var addressInfo = "";// = JSON.stringify(GoogleVisionOBJ[0]["fullTextAnnotation"]["text"]);
        //예외처리 1
		if(GoogleVisionOBJ[0]["fullTextAnnotation"]["text"] == null){
			console.log("* 예외처리 : 구글비전API에서 text 필드가 유효하지 않습니다!!!");
           	io.emit('chat message', {"image_url" : "http://13.209.141.208:3000/upload/error.jpg", "parcel_id" : "사진을 다시 찍어주세요", "line_id" : "이미지를 텍스로 변환하기에 부적합합니다.", "line_condition":"10000","time" : "--"});

			return;
		}
		else{
			addressInfo = JSON.stringify(GoogleVisionOBJ[0]["fullTextAnnotation"]["text"]);
		}
		
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


app.get('/google_vision', function(req, res, next) {


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

app.post('/iot_controller', upload.single("imgFile"), function(req, res, next) {

 let file = req.file

  let result = {
    originalName : file.originalname,
    size : file.size,
  }

	res.json(result);


	console.log("파일명 : " +file.originalname);
		var fs = require('fs'); fs.rename('public/upload/' + req.file.filename, 'public/upload/'+file.originalname, function (err)
		{ if (err) throw err; console.log('renamed complete');
		});


    //파일저장 완료
    ////////////////////////////////////////
    //구글 비전 API사용
    ////////////////////////////////////////
    googleapi("http://13.209.141.208:3000/upload/" + file.originalname, file.originalname);
    ////////////////////////////////////////
    //구글 비전 API사용끝
    ////////////////////////////////////////










});



app.post('/iot_controller2', upload.single("imgFile"), function(req, res, next) {

 let kjkj = req.param('test');

 console.log("위사랑 : " + kjkj);


});





function getRandomInt(min, max) { //min ~ max 사이의 임의의 정수 반환
    return Math.floor(Math.random() * (max - min)) + min;
}


function sendTelegramMsg(chat_id, user_name, parcel_id, line_address){
		var letter = user_name + " 고객님의 " + parcel_id + "에 도착예정인 택배가 현재 " + line_address + "에 집하되고 있습니다!" ;

		//console.log(urlencode('변환'));
		//console.log(urlencode.decode('%EB%B3%80%ED%99%98'));

	request('https://api.telegram.org/bot752536018:AAH5ddvKDQfxN-yf4H4z_WPzkSAunSbMSKg/sendmessage?chat_id=' + chat_id + '&text=' + urlencode(letter), function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body) // Print the google web page.
		}
		else{
			console.log(body) // Print the google web page.

		}
	});
/*
		request.get(
		'https://api.telegram.org/bot752536018:AAH5ddvKDQfxN-yf4H4z_WPzkSAunSbMSKg/sendmessage?chat_id=' + chat_id + '&text=' + letter,
		function (error, response, body) {
			if (!error && response.statusCode == 200) {
				response.on('end', function() {
				});
				console.log("메시지 전송 완료");

			}
			else{
					console.log("메시지 전송 실패");
			}

		}
	);
	*/

	//https://api.telegram.org/bot752536018:AAH5ddvKDQfxN-yf4H4z_WPzkSAunSbMSKg/sendmessage?chat_id=705398333&text=ㅇㅇㅎㅇㅎ
}

function googleapi(t_url, img_name){
  var tar_url = t_url;
  //r result_msg = "mtymy";
  console.log("구글 API에 다음과 같은 유알엘 전달 : " + t_url);

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
        //var addressInfo = JSON.stringify(GoogleVisionOBJ[0]["fullTextAnnotation"]["text"]);
		var addressInfo = "";// = JSON.stringify(GoogleVisionOBJ[0]["fullTextAnnotation"]["text"]);
        //예외처리 1
		try {
			GoogleVisionOBJ[0]["fullTextAnnotation"]["text"];
		} catch (exception) {
			// do something else
				
			console.log("* 예외처리 : 구글비전API에서 text 필드가 유효하지 않습니다!!!");
           	io.emit('chat message', {"image_url" : "http://13.209.141.208:3000/upload/error.jpg", "parcel_id" : "사진을 다시 찍어주세요. 이미지를 텍스트로 변환하기에 부적합 합니다.", "line_id" : "부적합", "line_condition":"3","time" : "--"});
			return;
		}
/*		if(GoogleVisionOBJ[0]["fullTextAnnotation"]["text"] == null){
			console.log("* 예외처리 : 구글비전API에서 text 필드가 유효하지 않습니다!!!");
           	io.emit('chat message', {"image_url" : "http://13.209.141.208:3000/upload/error.jpg", "parcel_id" : "사진을 다시 찍어주세요", "line_id" : "이미지를 텍스로 변환하기에 부적합합니다.", "line_condition":"3","time" : "--"});

			return;
		}*/
//		else{
			addressInfo = JSON.stringify(GoogleVisionOBJ[0]["fullTextAnnotation"]["text"]);
//		}
		
		
        console.log(" TEXT 영역 " + addressInfo);
		var rec_user_name = "";
		var rec_user_chat_id = "";
		
		if(addressInfo.indexOf("이태호") != -1 || addressInfo.indexOf("태호") != -1 || addressInfo.indexOf("태 호") != -1){
			rec_user_name = "이태호";
			rec_user_chat_id = "705398333";
		}
		else if(addressInfo.indexOf("위사랑") != -1 || addressInfo.indexOf("사랑") != -1 || addressInfo.indexOf("사 랑") != -1){
			rec_user_name = "위사랑";
			rec_user_chat_id = "703872814";
		}
		else if(addressInfo.indexOf("이부형") != -1 || addressInfo.indexOf("부형") != -1 || addressInfo.indexOf("부 형") != -1 || addressInfo.indexOf("무 형") != -1 || addressInfo.indexOf("무형") != -1|| addressInfo.indexOf("이푸") != -1 || addressInfo.indexOf("이 푸") != -1|| addressInfo.indexOf("푸형") != -1|| addressInfo.indexOf("푸 형") != -1){
			//rec_user_name = "이수연";
			//rec_user_chat_id = "383728937";
			
			rec_user_name = "이부형";
			rec_user_chat_id = "694100670";			
			
		}
		else if(addressInfo.indexOf("이수연") != -1 || addressInfo.indexOf("수연") != -1 || addressInfo.indexOf("수 연") != -1){
			
			rec_user_name = "이수연";
			rec_user_chat_id = "383728937";
		}
		else{
			rec_user_name = "이 태호";
			rec_user_chat_id = "705398333";
		}
		
		
        connector(addressInfo, img_name, rec_user_name, rec_user_chat_id);
        //console.log(" 빨리2222 " + JSON.stringify(GoogleVisionOBJ.textAnnotations));

        //console.log("하이루 33 : " + JSON.stringify(body.responses.textAnnotations));

        //console.log("하이루 33 : " + JSON.stringify(body.responses.fullTextAnnotation));


        //res.send(addressInfo);

        //;

      }
      else{
          console.log("응답 실패 : " + response.statusCode);
          //console.log("ddd?? : " + body.toString());
      }

    }
  );
}

//connector

function connector(proc_addr, img_name, receipt_user_name, receipt_user_chat_id){
        var elk_host = '127.0.0.1:9200';
        var elk_index = 'lineinfo1';
        var elk_type = 'doc';
        var logging = 'trace';
        var elasticsearch = require('elasticsearch');
        var client = new elasticsearch.Client({
                host: elk_host,
                log: logging
        });

        client.ping({
                requestTimeout: 1000
        },
                function(error){
                        if(error){
                                console.trace('elasticseach is down!');
                        }else{
                                console.log('elasticsearch starts!');
                        }
        }
        );

        client.search({
                index: elk_index,
                type: elk_type,
                body: {
                        query: {
                                multi_match: {
                                        query: proc_addr,
                                        type: "most_fields",
                                        fields : ["addr", "addr_big", "addr_mid", "addr_sml", "addr_dtl"],
                                        tie_breaker: 0.3
                                }
                        }
                }
        }).then(function (resp) {
			
				try {
					resp.hits.hits[0]._source;
				} catch (exception) {
					// do something else
					console.log("* 예외처리 로그 : ELK 결과물에서 _source가 유효하지 않습니다.");
		           	io.emit('chat message', {"image_url" : "http://13.209.141.208:3000/upload/error.jpg", "parcel_id" : "사진을 다시 찍어주세요. 이미지를 텍스트로 변환하기에 부적합 합니다.", "line_id" : "부적합", "line_condition":"10000","time" : "--"});
					return;
				}

				/*
				if(resp.hits.hits[0]._source == null){
					console.log("* 예외처리 로그 : ELK 결과물에서 _source가 유효하지 않습니다.");
		           	io.emit('chat message', {"image_url" : "http://13.209.141.208:3000/upload/error.jpg", "parcel_id" : "사진을 다시 찍어주세요", "line_id" : "이미지를 텍스로 변환하기에 부적합합니다.", "line_condition":"3","time" : "--"});

					return 0;
				}
				*/
                console.log("결과물이 나오나?? : " + JSON.stringify(resp));
                console.log("결과물이 나오나22 : " + JSON.stringify(resp.hits.hits[0]._source.addr));
                console.log("결과물이 나오나22 : " + JSON.stringify(resp.hits.hits[0]._source.addr_big));
                console.log("결과물이 나오나22 : " + JSON.stringify(resp.hits.hits[0]._source.dft_line));
                //console.log("결과물이 나오나22 : " + JSON.stringify(resp.hits.hits[0]._source[0].addr));
                //console.log("결과물이 나오나33 : " + JSON.stringify(resp.hits.hits[0]._source[0].dft_line));
                ////////////////////////////////////////////////////////////
                //시간 계산
              	var m = moment();
              	// format으로 출력한다
              	var now_time = m.format("YYYY년 MM월 DD일 HH:mm:ss");

                //connector();

              	//io.emit('chat message', {"image_url" : "http://13.209.141.208:3000/upload/" + img_name, "parcel_id" : "100" + getRandomInt(1000000,9000000), "line_id" : "" + getRandomInt(100,500), "line_condition":"" + getRandomInt(1,4),"time" : now_time});
              	io.emit('chat message', {"image_url" : "http://13.209.141.208:3000/upload/" + img_name, "parcel_id" : JSON.stringify(resp.hits.hits[0]._source.addr), "line_id" : "" + JSON.stringify(resp.hits.hits[0]._source.dft_line), "line_condition":"" + getRandomInt(1,4),"time" : now_time});

				//if()
				//sendTelegramMsg("705398333", "이태호", getRandomInt(1000000,9000000), "강서구 허브");
				sendTelegramMsg(receipt_user_chat_id, receipt_user_name, resp.hits.hits[0]._source.addr, resp.hits.hits[0]._source.addr_big + " 허브");
				//sendTelegramMsg("703872814", "위사랑", JSON.stringify(resp.hits.hits[0]._source.addr), JSON.stringify(resp.hits.hits[0]._source.addr_big) + " 허브");
				//sendTelegramMsg("383728937", "이수연", JSON.stringify(resp.hits.hits[0]._source.addr), JSON.stringify(resp.hits.hits[0]._source.addr_big) + " 허브");
				//sendTelegramMsg("694100670", "이부형", JSON.stringify(resp.hits.hits[0]._source.addr), JSON.stringify(resp.hits.hits[0]._source.addr_big) + " 허브");
				mobi_add(resp.hits.hits[0]._source.addr, resp.hits.hits[0]._source.dft_line, now_time, resp.hits.hits[0]._source.addr_big + " 허브")
//chat_id, user_name, parcel_id, line_address


                return resp;
        }, function (err) {
                console.trace(err.message);
        });



}

function mobi_add(r_addr, r_line, r_date, r_hub){
	
	var request = require("request");

	var options = { method: 'POST',
	  url: 'http://13.209.141.208:7579/Mobius/PRO/analy_item',
	  headers: 
	   { 'Postman-Token': 'a701419d-cc2e-40bc-bd37-2ce149dc5dfa',
		 'cache-control': 'no-cache',
		 'Content-Type': 'application/vnd.onem2m-res+json; ty=4',
		 'X-M2M-Origin': 'rangtest1',
		 'X-M2M-RI': '12345',
		 Accept: 'application/json' },
	  body: '{\n    "m2m:cin": {\n        "con": {"id" : "xxxx", "product_id" : "xxx", "sent_address" : "xx", "reception_address" : "'+r_addr+'", "hub_id" : "'+r_hub+'", "line_id" : "'+r_line+'", "date" : "'+r_date+'", "staff_id" : "위사랑"}\n    }\n}' };

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);
	});


}





module.exports = app;
