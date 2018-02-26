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
	url2: 'mongodb://221.204.25.73:6666/spider',
	release: 'carRelease'
};
let $a = toRelease = {
	init() {
		console.log('add wxxcx start ');
		Mongo.connect($mongo.url1, (err, db) => {
			if(err) throw err;
			$a.db_release = {
				db: db,
				release: db.collection('carRelease'),

			}
			Mongo.connect($mongo.url2, (err, db) => {
				if(err) throw err;
				$a.db_spider = {
					db: db,
					clazz: db.collection('carClazz'),
					biz: db.collection('niuniu'),
					com: db.collection('companies'),
				}
				console.log('Step1 : cennecting to mongodb , done');
				$a.getList();
				//return;
			})

		})

	},
	getList(limit = 10) {
		$a.db_spider.biz.find({
			released: false,
			short: {
				'$exists': false
			}

		}).limit(limit).toArray((err, res) => {
			if(err) {
				console.log('get list err')
			} else {
				console.log('get list ok , total : ' + res.length);
				if(res.length) {
					let i = 0;
					let itv = setInterval(() => {
						let item = res[i];
						$a.ckBrand(item);
						i++;
						if(i >= res.length) {
							clearInterval(itv)
						}
					}, 10000);
				} else {
					console.log('no data to release')
				}
			}
		})
	},
	ckBrand(item) {
		$a.db_spider.clazz.findOne({
			'querytitle': {
				$regex: item.clazz
			}
		}, (err, res) => {
			if(err) {
				console.log('Err:' + err)
			} else {
				if(res == null) {
					console.log(item.clazz + ' 未找到对应的品牌')
					$a.db_spider.biz.update({
						'_id': item._id
					}, {
						$set: {
							'short': 'brand'
						}
					}, (err, res) => {
						console.log('已标记')
					})
				} else {
					//console.log(item.clazz + ' ' + res.brand);
					$a.releaseItem(item, res);
				}

			}
		});
	},
	releaseItem(item, brand) {
		//console.log(item)
		//console.log(res);
		$a.db_spider.com.findOne({
			'com_id': item.com_id
		}, (err, res) => {
			if(err) {
				console.log('get Com Info err : ' + err)
			} else {
				//console.log(res)
				let com, name, tel;
				if(res  &&  res.users.length) {
					if(res.users[0].name == '') {
						//个人
						com = '';
						name = res.name;
						tel = res.users[0].tel

					} else {
						// 公司
						com = res.name;
						name = res.users[0].name;
						tel = res.users[0].tel

					}
					let schema_msg = {
						type: 'object',
						properties: {
							"querytitle": {
								type: 'string'
							},
							"brand": {
								type: 'string'
							},
							"clazz": {
								type: 'string'
							},
							"year": {
								type: 'number'
							},
							"gf_price": {
								type: 'number'
							},
							"gf_price_txt": {
								type: 'number'
							},
							"selltype": {
								type: 'string'
							},
							"amount": {
								type: 'number'
							},
							"sellprice": {
								type: 'number'
							},
							"type": {
								type: 'string'
							},
							"model": {
								type: 'string'
							},
							"area": {
								type: 'string'
							},
							"bookmark": {
								type: 'string'
							},
							"outColor": {
								type: 'string'
							},
							"innerColor": {
								type: 'string'
							},
							"addtime": {
								type: 'number'
							},
							"addtime_text": {
								type: 'string'
							},
							"cid": {
								type: 'string'
							},
							"isdel": {
								type: 'number'
							},
							"user": {
								type: 'string'
							},
							"tel": {
								type: ['number', 'string']
							},

							"company": {
								type: 'string'
							},
							"openid": {
								type: 'string'
							},
							"placetop": {
								type: 'number'
							},
						},
						"required": ["querytitle", 'brand', 'clazz', 'year', 'selltype', 'amount', 'sellprice', 'cid', 'openid', 'user', 'tel']
					}

					let msg = {
						"querytitle": brand.brand + ' ' + item.clazz + ' ' + item.year + ' ' + item.gf_price_txt + ' 全东西南北',
						"brand": brand.brand,
						"clazz": item.clazz,
						"year": item.year,
						"gf_price": item.gf_price * 1,
						"gf_price_txt": item.gf_price_txt * 1,
						"selltype": item.selltype,
						"amount": item.amount * 1,
						"sellprice": item.sellprice,
						"type": item.type.replace('国产', '中规'),
						"model": item.model,
						"area": "全",
						"bookmark": item.bookmark,
						"outColor": item.outColor,
						"innerColor": item.innerColor,
						"addtime": new Date().getTime(),
						"addtime_text": formatTime(new Date()),
						"cid": "os3Uj0eFI7snT3Nm4ugU1jKvdnek" + new Date().getTime(),
						"isdel": 0,
						"user": name,
						"tel": tel,
						"company": com,
						"openid": "os3Uj0eFI7snT3Nm4ugU1jKvdnek",
						"placetop": 0
					}
					let schema_res = $v.validate(msg, schema_msg);
					//console.log(res)
					if(schema_res.errors.length == 0) {
						$a.db_release.release.insert(msg, (err, res) => {
							if(err) {
								console.log('插入数据失败:' + err)
							} else {
								console.log('insert OK')
								$a.db_spider.biz.update({
									'_id': item._id
								}, {
									$set: {
										'released': true
									}
								}, (err, res) => {
									if(err) {
										console.log('update status err');
									} else {
										console.log('update status ok')
									}
								});
							}
						});
					} else {
						console.log('schema_res ck err')
						$a.db_spider.biz.update({
							'_id': item._id
						}, {
							$set: {
								'short': 'param'
							}
						}, (err, res) => {
							if(err) {
								console.log('update status err');
							} else {
								console.log('update status ok')
							}
						});
					}

				} else {
					console.log('no users')
				}
			}
		})
		/*
		 
		 * */

	},

}
module.exports = {
	toRelease: toRelease
}