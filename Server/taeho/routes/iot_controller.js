var express = require('express');

var request = require('request');

var router = express.Router();

var app = express();
var http = require('http').Server(app); //1
var io = require('socket.io')(http);    //1

const multer = require("multer");
 
let upload = multer({
  dest: "public/upload/"
})


io.on('connection', function(socket){ //3
  console.log('user connected: ', socket.id);  //3-1
  var name = "user" + count++;                 //3-1
  io.to(socket.id).emit('change name',name);   //3-1

  socket.on('disconnect', function(){ //3-2
    console.log('user disconnected: ', socket.id);
  });

  socket.on('send message', function(name,text){ //3-3
    var msg = name + ' : ' + text;
    console.log(msg);
    io.emit('receive message', msg);
  });
});


 /*
 
const upload = multer({

storage : multer.diskStorage({
        destination: function(req,file,cb)
        {
                //cb(null,'../../static/images/');
				cb(null,'C:\Program Files\nodejs\taeho\upload');
				//C:\Program Files\nodejs\taeho\upload
        },
        filename: function(req,file,cb)
        {
                cb(null,new Date().valueOf() + path.extname(file.originalname));
        }
}),
});
*/
/* GET users listing. */
/*
router.post('/', function(req, res, next) {
	
	
	var multer = require('multer'); // multer모듈 적용 (for 파일업로드)
	var storage = multer.diskStorage({
	  destination: function (req, file, cb) {
		cb(null, 'uploads/') // cb 콜백함수를 통해 전송된 파일 저장 디렉토리 설정
	  }
	  filename: function (req, file, cb) {
		cb(null, file.originalname) // cb 콜백함수를 통해 전송된 파일 이름 설정
	  }
	})
	var upload = multer({ storage: storage })
	res.send("ok!");

});
*/


router.post('/', upload.single("imgFile"), function(req, res, next) {
 
 let file = req.file
 
  let result = {
    originalName : file.originalname,
    size : file.size,
  }
 
  res.json(result);
  
  /*lll
        var originalPath = 'upload/';
        var filename = originalPath + req.file.filename;
		console.log("머라뜨냐 : " +filename);
        res.status(200).json({ result : 'success', path : filename });
	*/	
	console.log("머라뜨냐 : " +file.originalname);
		var fs = require('fs'); fs.rename('public/upload/' + req.file.filename, 'public/upload/'+file.originalname, function (err) 
		{ if (err) throw err; console.log('renamed complete'); 
		});
		
		
		

		
});





module.exports = router;
