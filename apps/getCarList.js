/**
 * New node file
 */
const Mongo = require('mongodb').MongoClient;
const trim = require('trim');
const cheer = require('cheerio');
const $r = require('request');
const $j = $r.jar();
const formatTime = require('../util/formatTime.js').formatTime;
const Iconv = require('iconv-lite');
const brand = [];
const host = 'https://www.autohome.com.cn';

const $mongo = {
	url: 'mongodb://221.204.25.73:6666/spider',
	carClazzList: 'carClazzList',
	carClazz: 'carClazz'
}
const $c = getCarList = {
	init() {
		console.log('init');
		Mongo.connect($mongo.url, (err, db) => {
			if(err) throw err;
			$c.db = {
				db: db,
				list: db.collection('carClazzList'),
				clazz: db.collection('carClazz')
			}
			
			console.log('Step1 : cennecting to mongodb , done')

			//$c.getIndex(); //获取车系列表
			$c.getModel();
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
	getIndex() {
		let arr = [];
		for(let i = 0; i < 26; i++) {
			arr.push(String.fromCharCode((65 + i)));
		}
		let i = 0;
		let itv = setInterval(() => {
			let url = host + '/grade/carhtml/' + arr[i] + '.html';
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
			$c.get(opt, function(res) {
				if(res.err) {
					console.log(err);
				} else {
					$c.getBrand(Iconv.decode(res.body, 'gb2312').toString(), arr[i]);
				}
				i++;
				if(i >= arr.length) {
					clearInterval(itv)
				}
			})

		}, 5000);

	},
	getBrand(bd, IndexLetter) {
		//console.log(bd)
		let $ = cheer.load(bd);
		let dl = $('dl');
		//let dl0 = dl[0];

		//console.log(b)
		for(let i = 0; i < dl.length; i++) {
			let brand_obj = {
				name: $(dl[i]).find('dt').find('div').find('a').text(),
				list: [],
				from: 'niuniu',
				by: 'Marico',
				addtime: new Date().getTime(),
				datadate: formatTime(new Date())
			}
			let clazz = $(dl[i]).find('ul').find('li');
			for(let j = 0; j < clazz.length; j++) {
				let clazz_el = $(clazz[j]).find('h4').find('a')
				let clazz_opt = {
					"clazz": $(clazz_el).text(),
					"brand": $(dl[i]).find('dt').find('div').find('a').text(),
					"brandIndexLetter": IndexLetter,
					"from": 'niuniu',
					"listUrl": $(clazz_el).attr('href'),
					"by": 'Marico',
					"addtime": new Date().getTime(),
					"datadate": formatTime(new Date()),
					"deald": false,
					"failed": false
				}
				brand_obj.list.push(clazz_opt)
			}
			$c.db.list.insertMany(brand_obj.list, {
				ordered: false
			}, function(err, res) {
				if(err) {
					console.log('Error:' + err);
				} else {

					console.log('clazz 插入成功' + res.insertedCount + '条,  共' + brand_obj.list.length + '条');

				}

			});

			brand.push(brand_obj)
		}

	},
	getModel() {
		let page = 0;
		//let itv = setInterval(() => {
		$c.db.list.find({			
			'clazz': {
				$ne: ''
			}
		}).limit(2000).skip(1000).toArray((err, res) => {
			if(err) {
				console.log('get Car Model Err')
			} else {
				if(!res.length) {
					console.log('No more data')
				} else {
					console.log('本次取到车系数据:' + res.length + '条')
					//console.log(res)
					$c.dealCarModel(res);
				}
			}
			page++;
			if(res.length < 50) {
				clearInterval(itv);
				console.log('车型采集完成============')
			}
		});
		//}, 30000)

	},
	dealCarModel(arr) {
		let i = 0;
		let itv = setInterval(() => {
				let item = arr[i];
				console.log('\n');
				console.log(item.brand + '  ' + item.clazz);
				let opt = {
					url: 'http:' + item.listUrl,
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
				$c.get(opt, res => {
					if(res.err) {
						console.log('get car Model List Err')
						$c.db.list.update({
							'_id': item._id
						}, {
							$set: {
								'deald': true,
								'failed': true
							}
						}, (err, res) => {
							if(err) {
								console.log('Update clazzList err')
							} else {
								console.log('Update clazzList OK ')
							}
						});
					} else {
						i++;
						if(i >= arr.length) {
							clearInterval(itv)
						}
						res.body = Iconv.decode(res.body, 'gb2312').toString()
						let $ = cheer.load(res.body);
						let list = $c.getCarModelInfo($, item);
						//console.log(list);
						$c.db.clazz.insertMany(list, {
							ordered: false
						}, (err, res) => {
							if(err) {
								console.log('Insert Data Failed')
								$c.db.list.update({
									'_id': item._id
								}, {
									$set: {
										'deald': true,
										'failed': true
									}
								}, (err, res) => {
									if(err) {
										console.log('Update clazzList err')
									} else {
										console.log('Update clazzList OK ')
									}
								});
							} else {
								console.log('保存数据 ' + res.insertedCount + '条,  共' + list.length + '条')
								$c.db.list.update({
									'_id': item._id
								}, {
									$set: {
										'deald': true
									}
								}, (err, res) => {
									if(err) {
										console.log('Update clazzList err')
									} else {
										console.log('Update clazzList OK ')
									}
								});
							}

						})

					}

				})
			},
			1000)
	},
	getCarModelInfo($, item) {

		let models_el = $('.interval-new').find('li');
		let list = [];
		for(let j = 0; j < models_el.length; j++) {
			let model_text = $($(models_el[j]).find('p')[0]).find('a').text();
			let info = {
				model_id: $($(models_el[j]).find('p')[0]).attr('data-gcjid') * 1,
				brand: item.brand,
				clazz: item.clazz,
				year: model_text.substr(0, 4) * 1,
				model: model_text.substr(6),
				brandIndexLetter: item.brandIndexLetter,
				gf_price: trim($(models_el[j]).find('.interval01-list-guidance').find('div').text().replace('\n', '').replace('万', '').replace(' ', '')) * 1,
				from: 'autohome',
				by: 'Marico',
				addtime: new Date().getTime(),
				datadate: formatTime(new Date())
			}
			list.push(info);
		}
		return list;
	}
}
module.exports = {
	getCarList: getCarList
}