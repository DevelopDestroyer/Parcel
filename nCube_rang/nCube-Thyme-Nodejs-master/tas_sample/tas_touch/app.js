/**
 * Created by ryeubi on 2015-08-31.
 * Updated 2017.03.06
 * Made compatible with Thyme v1.7.2
 */

var net = require('net');
var util = require('util');
var fs = require('fs');
var xml2js = require('xml2js');


var wdt = require('./wdt');
//var sh_serial = require('./serial');

////var serialport = require('serialport');

//var wpi = require('wiring-pi);


var usecomport = '';
var usebaudrate = '';
var useparentport = '';
var useparenthostname = '';

var upload_arr = [];
var download_arr = [];

var conf = {};

// This is an async file read
fs.readFile('conf.xml', 'utf-8', function (err, data) {
    if (err) {
        console.log("FATAL An error occurred trying to read in the file: " + err);
        console.log("error : set to default for configuration")
    }
    else {
        var parser = new xml2js.Parser({explicitArray: false});
        parser.parseString(data, function (err, result) {
            if (err) {
                console.log("Parsing An error occurred trying to read in the file: " + err);
                console.log("error : set to default for configuration")
            }
            else {
                var jsonString = JSON.stringify(result);
                conf = JSON.parse(jsonString)['m2m:conf'];

//                usecomport = conf.tas.comport;
//                usebaudrate = conf.tas.baudrate;
                useparenthostname = conf.tas.parenthostname;
                useparentport = conf.tas.parentport;

                if(conf.upload != null) {
                    if (conf.upload['ctname'] != null) {
                        upload_arr[0] = conf.upload;
                    }
                    else {
                        upload_arr = conf.upload;
                    }
                }

                if(conf.download != null) {
                    if (conf.download['ctname'] != null) {
                        download_arr[0] = conf.download;
                    }
                    else {
                        download_arr = conf.download;
                    }
                }
            }
        });
    }
});


var tas_state = 'init';

var upload_client = null;

var t_count = 0;
var list = 2;
//////////////////////////////업로드 데이터 부분입니당///////
function upload_action(){
	
   if(tas_state == 'upload') {
      for(var i = 0; i < upload_arr.length; i++) {
// 파일명 변경시 'cnt-ccc' 수정해야함
  	if(upload_arr[i].ctname == 'cnt-ccc') {
//con 수정하면 업로드 데이터 바뀜 
		var con = {value : 'TAS' + t_count++ + ',' + '/rang/image'+list++ +'.jpg'};
		var cin = {ctname: upload_arr[i].ctname, con: con};
		//console.log('toush_value'+touch_value);
		console.log('SEND : ' + JSON.stringify(cin) + ' ---->');
		upload_client.write(JSON.stringify(cin) + '<EOF>');
		break;
	} 
      }
   }
}
//////////////////////////////////////////////////////////////
var tas_download_count = 0;

function on_receive(data) {
    if (tas_state == 'connect' || tas_state == 'reconnect' || tas_state == 'upload') {
        var data_arr = data.toString().split('<EOF>');
        if(data_arr.length >= 2) {
            for (var i = 0; i < data_arr.length - 1; i++) {
                var line = data_arr[i];
                var sink_str = util.format('%s', line.toString());
                var sink_obj = JSON.parse(sink_str);

                if (sink_obj.ctname == null || sink_obj.con == null) {
                    console.log('Received: data format mismatch');
                }
                else {
                    if (sink_obj.con == 'hello') {
                        console.log('Received: ' + line);

                        if (++tas_download_count >= download_arr.length) {
                            tas_state = 'upload';
                        }
                    }
                    else {
                        for (var j = 0; j < upload_arr.length; j++) {
                            if (upload_arr[j].ctname == sink_obj.ctname) {
                                console.log('ACK : ' + line + ' <----');
                                break;
                            }
                        }

                        for (j = 0; j < download_arr.length; j++) {
                            if (download_arr[j].ctname == sink_obj.ctname) {
                                g_down_buf = JSON.stringify({id: download_arr[i].id, con: sink_obj.con});
                                console.log(g_down_buf + ' <----');
                                ///myPort.write(g_down_buf);
				touch_(sink_obj.con);
                                break;
                            }
                        }
                    }
                }
            }
        }
    }
}
//다운로드시... 일단 넣어놓음 (sub 있을 경우)
function touch_(comm_num){
	var cmd = 'sudo ./ccc' + comm_num;
	exec(cmd , function callback(error,stdout,stderr){
		console.log(stdout);
	});
}

var SerialPort = null;
var myPort = null;

//1.5초에 1개씩 보내기 하고있음! 
function intervalFunc(){
 	console.log("1500 time..");
}


function tas_watchdog() {
    if(tas_state == 'init') {
        upload_client = new net.Socket();

        upload_client.on('data', on_receive);

        upload_client.on('error', function(err) {
            console.log(err);
            tas_state = 'reconnect';
        });

        upload_client.on('close', function() {
            console.log('Connection closed');
            upload_client.destroy();
            tas_state = 'reconnect';
        });

        if(upload_client) {
            console.log('tas init ok');
            tas_state = 'init_touch';
        }
    }
    else if(tas_state == 'init_touch') {


	    ///////touch_test///
	    /*
	wpi.setup('wpi');
	var PIR = 4; // BCM_GPIO 23
	wpi.pinMode(PIR, wpi.INPUT);
	if(wpi.digitalRead(PIR)!=0){ //detection!
		console.log("Detection!!!\n");
		touch_vaule++;
		console.log(touch_value);
	}*/

	   //1.5초에 1개씩 전송! 
	setInterval(intervalFunc,1500);
	

	tas_state = 'connect';
/*
        if(myPort) {
            console.log('tas init serial ok');
            tas_state = 'connect';
        }
	*/

    }




    else if(tas_state == 'connect' || tas_state == 'reconnect') {
        upload_client.connect(useparentport, useparenthostname, function() {
            console.log('upload Connected');
            tas_download_count = 0;
            for (var i = 0; i < download_arr.length; i++) {
                console.log('download Connected - ' + download_arr[i].ctname + ' hello');
                var cin = {ctname: download_arr[i].ctname, con: 'hello'};
                upload_client.write(JSON.stringify(cin) + '<EOF>');
            }

            if (tas_download_count >= download_arr.length) {
                tas_state = 'upload';
            }
        });
    }
}

//wdt.set_wdt(require('shortid').generate(), 2, touch_upload_action);
wdt.set_wdt(require('shortid').generate(), 3, tas_watchdog);
wdt.set_wdt(require('shortid').generate(), 3, upload_action);

var cur_c = '';
var pre_c = '';
var g_sink_buf = '';
var g_sink_ready = [];
var g_sink_buf_start = 0;
var g_sink_buf_index = 0;
var g_down_buf = '';
