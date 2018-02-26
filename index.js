require('events').EventEmitter.prototype._maxListeners = 100;
const http = require("http");
const https = require('https');
const csv2json_f = require('csv2json');
const fs = require('fs');
const trim = require('trim');
const cheer = require('cheerio');
const $r = require('request');
const $j = $r.jar();
const Mongo = require('mongodb').MongoClient;
const mongojs = require('mongojs')
const mongoOpt = {
	'url': 'mongodb://localhost:27017/DCMALL',
	'cellection': 'biz'

}
const formatTime = require('./util/formatTime.js').formatTime;
const getNiuNiu = require('./apps/getNiuNiu.js').getNiuNiu;
let getCarList = require('./apps/getCarList.js').getCarList;
const toRelease = require('./apps/toRelease.js').toRelease;

/*getPage('http://www.chehang168.com/', function(page) {
	$ = cheer.load(page);
	//console.log($('body').html())
	console.log($);
})*/
//connMongo()
//login();
//getProvince()
//getCarList.init();//获取汽车之家车型
toRelease.init();
setInterval(() => {
	toRelease.init();
}, 60 * 30 * 1000)

toRelease.init();
//发布信息到小程序
let Niu = new getNiuNiu();;
setInterval(() => {
	Niu = null;
	Niu = new getNiuNiu();
}, 898 * 58 * 73)

function getPage(opt_or_url, cb) {
	$r.get(opt_or_url, function(err, res, body) {
		//console.log(res.headers['set-cookie'])
		cb({
			err: err,
			res: res,
			body: body
		})
	})

}

function connMongo() {
	console.log(mongoOpt.url)
	Mongo.connect(mongoOpt.url, (err, db) => {
		if(err) throw err;
		let collName = db.collection('biz');
		let doc = {
			time: Date()
		};
		collName.insert(doc, function(err, result) {
			db.close();

		})
	})

}