var json2csv = require('json2csv');
const Mongo = require('mongodb').MongoClient;
const trim = require('trim');
const cheer = require('cheerio');
const $r = require('request');
const $j = $r.jar();
const formatTime = require('../util/formatTime.js').formatTime;
const Validator = require('jsonschema').Validator;
const $v = new Validator();
const $mongo = {
	url1: 'mongodb://221.204.25.73:6666/b2b_cars',
	release: 'carRelease'
};
Mongo.connect($mongo.url1, (err, db) => {
	if(err) throw err;
	$a.db_release = {
		db: db,
		release: db.collection('carRelease'),

	}
	let fields = ['brand', 'clazz', 'year', 'model', 'type', 'addtime_text', 'user', 'tel', 'company'];
	let dataMap = $a.db_release.release.find({
		addtime_text: /2018-/
	}, {
		brand: 1,
		clazz: 1,
		year: 1,
		model: 1,
		type: 1,
		addtime_text: 1,
		user: 1,
		tel: 1,
		company: 1
	}).toArray((err, arr) => {
		json2csv({
			data: myCars,
			fields: fields
		}, (err , csv)=> {
			
		})
	})

})