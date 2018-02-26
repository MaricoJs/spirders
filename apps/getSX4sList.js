/**
 * 获取山西4s店列表
 */
const Mongo = require('mongodb').MongoClient;
const trim = require('trim');
const cheer = require('cheerio');
const $r = require('request');
const $j = $r.jar();
const formatTime = require('../util/formatTime.js').formatTime;
const Iconv = require('iconv-lite');
const brand = [];
const host = 'https://dealer.autohome.com.cn';
const Validator = require('jsonschema').Validator;
const $v = new Validator();
const $mongo = {
	url: 'mongodb://221.204.25.73:6666/spider',
	list: '4sList',
}
const $f = get4sList = {
	init() {
		console.log('get  4s list start ');
		Mongo.connect($mongo.url, (err, db) => {
			if(err) throw err;
			$f.db = {
				db: db,
				list: db.collection('4sList'),

			}
			let i = 0;
			let itv1 = setInterval(() => {
				$f.getListPage(i++);
				if(i >= 36) {
					clearInterval(itv1);
				}
			}, 3 * 1000)
			let itv2 = setInterval(() => {
				$f.get4s4Gps()
			}, 5 * 1000)

		})

	},
	getListPage(page) {
		let url = host + '/shanxi?countyId=0&brandId=0&seriesId=0&factoryId=0&pageIndex=' + page + '&kindId=1&orderType=0&isSales=0';
		let opt = {
			url: url,
			gzip: true,
			jar: $j,
			headers: {
				'Accept': '*/*',
				'Accept-Language': 'zh-CN,zh;q=0.8',
				'Accept-charset': 'gb2312',
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3831.407 Safari/537.36',
				'X-Requested-With': 'XMLHttpRequest'
			},
			encoding: null,
		}
		$f.get(opt, function(res) {
			if(res.err) {
				console.log(err);
			} else {
				$f.getList(Iconv.decode(res.body, 'utf-8').toString())
				//$c.getBrand(Iconv.decode(res.body, 'gb2312').toString(), arr[i]);
			}

		})
	},
	getList(body) {
		//console.log(body)
		let $ = cheer.load(body);
		let list = []
		let listEl = $('.list-box').find('.list-item');
		console.log('本页共有 4s店 ' + listEl.length + ' 条')
		for(let i = 0; i < listEl.length; i++) {
			let s4El = $(listEl[i]);
			let nameEl = s4El.find(".tit-row").find('a');
			/*
			 str.match(/id(\S*)ff/)
			 * */
			let s4 = {
				s4_id: nameEl.attr('href').match(/dealer.autohome.com.cn\/(\S*)\//)[1] * 1,
				name: nameEl.find('span').text(),
				type: s4El.find(".tit-row").find('.green').text(),
				brand: $(s4El.find(".info-wrap").find('li')[1]).find('em').text(),
				tel: s4El.find('.tel').text().replace(/\-/g, ''),
				gps: [],
				province: '',
				city: '',
				conty: '',
				addr: s4El.find('.info-addr').text(),
				completed: false,
				addtime: formatTime(new Date(), true),
				by: 'Marico',
				form: 'autohome.com.cn'
			}
			list.push(s4)
		}
		$f.db.list.insertMany(list, {
			ordered: false
		}, (err, res) => {
			console.log('保存数据 ' + res.insertedCount + '条,  共' + list.length + '条 \n')
			/*if(err) {
				console.log('保存数据 ' + res.insertedCount + '条,  共' + list.length + '条')
			} else {
				console.log('保存数据 ' + res.insertedCount + '条,  共' + list.length + '条')
			}*/
		})

	},
	get(opt_or_url, cb) {
		$r.get(opt_or_url, function(err, res, body) {
			cb({
				err: err,
				res: res,
				body: body
			})
		})

	},
	get4s4Gps() {
		$f.db.list.find({
			completed: false,
			gps: []
		}, {
			_id: 1,
			s4_id: 1
		}).limit(3).toArray((err, list) => {
			//s4List = list;
			if(err) {
				console.log(err)
			} else {
				let i = 0;
				let itv = setInterval(() => {
					let s4id = list[i].s4_id;
					let url = host + '/' + s4id + '/contact.html';
					let opt = {
						url: url,
						gzip: true,
						jar: $j,
						headers: {
							'Accept': '*/*',
							'Accept-Language': 'zh-CN,zh;q=0.8',
							'Accept-charset': 'gb2312',
							'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3831.407 Safari/537.36',
							'X-Requested-With': 'XMLHttpRequest'
						},
						encoding: null,
					}
					$f.get(opt, function(res) {
						if(res.err) {
							console.log(err);
						} else {
							let $ = cheer.load(Iconv.decode(res.body, 'utf-8').toString());
							let arr = 0;
							try {
								arr = eval(trim($($('script')[5]).html().replace('var dealerlist=', '').replace(';', '')))
								let lat = arr[0].MapLatBaidu;
								let lng = arr[0].MapLonBaidu;
								$f.db.list.update({
									s4_id: s4id
								}, {
									$set: {
										gps: [lat, lng]
									}
								}, (err, res) => {
									if(err) {
										console.log(err)
									} else {
										console.log('4s: ' + s4id + ' update ok')
									}
								})
							} catch(e) {
								//TODO handle the exception
								console.log(e)
							}

							//.match(/var dealerlist\=\[(\S*)\]/)[1];
							//console.log(body.match(/var dealerlist\=\[(\S*)\]/)[1])
						}

					})
					i++;
					if(i >= list.length) {
						clearInterval(itv);
					}
				}, 1500)
			}

		})
	},
	get4sGps(s4_id) {

	},

}
module.exports = {
	s4: get4sList
}