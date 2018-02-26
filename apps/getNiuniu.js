/**
 * New node file
 */

const Mongo = require('mongodb').MongoClient;
const trim = require('trim');
const cheer = require('cheerio');
const $r = require('request');
const $j = $r.jar();
const formatTime = require('../util/formatTime.js').formatTime;

function getNiuNiu() {

	let $n = this;
	$n.setting = {
		debug: true
	}
	$n.count = {
		biz: 0,
		com: 0,
		time_start: new Date().getTime(),
		time: 0
	}
	$n.usrs = [{
		"tel": '18660050334',
		"cookie2": '_bl_uid=CejLhcXF9hXs7R1UXqUst5vt1e8k; td_cookie=18446744072675224622; Hm_lvt_9e0791875b44c6cb9634aaf00c1d4986=1515631800; Hm_lpvt_9e0791875b44c6cb9634aaf00c1d4986=1515743587; remember_user_token=W1sxMzI4MjddLCIkMmEkMTAkR2lxaG9NQVZuZmVaNnB1ZWtCTHd0TyJd--7c07241421f78e636f3b5d8a342ebbe4b01d9d49; Hm_lvt_9e884c78bd7bfb5c8bee0f9c00fa772f=1515631754; Hm_lpvt_9e884c78bd7bfb5c8bee0f9c00fa772f=1515743828; _niu_niu_session=WFhqLy9jVS8vMEhEZkl3T0JhRk0wL3owRzRObVYvdTFBT0JHUGNvUFAxTVQrR2FzNlZHYkVDdnB4MGVKajNxRUxIQUtRd0RRV1RPY21JalpEQXN3Y1htNC91OE9KME01V1dKWmIzVTE1Y21qM1NvZW1UaTNmN0dibVUrdnVPdlZoMGlkTFhoV1RWRlhWSWRHb1FKbUg4NEllSm5yeDZDQlhMYjBYWUE2T3Y1T3gwU0V4L0tYUDhjekt0N1JMNml1T2JWbTJYREpHWW13R1JtUkVXeDRUWGNKTVhVakR0NUJ0T0cvamNVOWZLRmErSlBGS0J3MHpPUlNvelBpd3FWMi0teGRuMFp5RWZhR09KS3FxR3pHQ2lqQT09--600beae6fe3080fab290b4e6224d8f470adfd510; SERVERID=8a9626b5940df00f9a9360e60b5c790c|1515744323|1515744323',
		"cookie1": '_bl_uid=CejLhcXF9hXs7R1UXqUst5vt1e8k; Hm_lvt_9e884c78bd7bfb5c8bee0f9c00fa772f=1515631754; Hm_lpvt_9e884c78bd7bfb5c8bee0f9c00fa772f=1515633911; Hm_lvt_9e0791875b44c6cb9634aaf00c1d4986=1515631800; Hm_lpvt_9e0791875b44c6cb9634aaf00c1d4986=1515633911; td_cookie=18446744072675224622; _niu_niu_session=a21iSHhkVnNkN2RXdzNkQnI0OUw3dEJyQWlsTHVpb0lFcStvZStoQVVKYUc4a1dreE9JeG04cldQQ0d6bWJFNkF0VFpKM1hFeHc1TUlRVXA4eTlNVk9Jcko3T2h5cVB3bUVnaGs1QWljQXpKOXA4OFZoUE43SElnaTVoRW9acjhXaEpXUGZweUdmbGY5b3Vrc3J1MGsyTUtLK0F1dktsRzJ0dzhqNWREdlU2ZFNXNkc0elBnR09MaU1CLy83aGV0dW5rVTh2MUlmSUZqbUJBbVZmRFBDWW13Y1JwQXZwSUJOcFNFZlJtV0ZWaGlyZzJqVTB4eVB4SUZvWEJML09SSHFwb1UwVDUwdmw1S2pHQzRWTDhyT3RzaE9aNlJzZjVHWWZ3d1lOdUh0NVdRZU1POUZCSHY2dmlvVTQ2b2oxS3AtLTF5SkRsZHhLcjRoOEM3ejEzL3BsT1E9PQ%3D%3D--0cec495e2a3644daa43c0e92b1650fc8849cfda0; SERVERID=8a9626b5940df00f9a9360e60b5c790c|1515715703|1515715703',
		"User-Agent": 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3964.2 Safari/537.36',
	}]
	$n.mongo = {
		url: 'mongodb://221.204.25.73:6666/spider',
		collection: 'niuniu'
	}
	$n.baseUrl = 'http://www.niuniuqiche.com'
	$n.url = $n.baseUrl + '/v2/sell_cars';
	$n.init = () => {
		Mongo.connect($n.mongo.url, (err, db) => {
			if(err) throw err;
			$n.db = {
				db: db,
				biz: db.collection('niuniu'),
				com: db.collection('companies')
			}

			/*
			 * collName.insert(doc, function(err, result) {
							console.log(err);
							console.log(result)
							db.close();
			})
			*/
			console.log('Step1 : cennecting to mongodb , done')
			$n.getList(17);
			//$n.getList(17);
			//$n.getBizItemEmpty()
			let i = 1;
			let itv = setInterval(() => {
				$n.getList(i);
				i++;
				if(i >= 5) {
					clearInterval(itv)
					//return ;
				}
			}, 983 * 23 * 5)

		})

	}

	$n.getList = (i) => {
		let opt = $n.getOpt($n.url + '?page=' + i);
		console.log('page: ' + i + ' start' + formatTime(new Date(), true) )
		$n.get(opt, function(res) {
			if(res.err) {
				return
			} else {}
			let $ = cheer.load(res.body);
			let listDiv = $('.listing-cars');
			let list = listDiv.find('.item');
			console.log('Step2 : getting list , done , length : ' + list.length)
			let biz = [];
			let com = [];
			let biz_id_set = [];
			let com_id_set = [];
			for(let i = 0; i < list.length; i++) {
				let item = $(list[i]);
				let biz_id = item.find('.car-title').find('a').attr('href').replace('/v2/cars/', '') * 1
				if(biz_id_set.indexOf(biz_id) == -1) {
					biz_id_set.push(biz_id)
					/*biz.push({
						biz_id: biz_id,
						loaded: false,
						adddate: formatTime(new Date(), true),
						addtime: new Date().getTime()
					});*/
				}
				let com_id = item.find('.user-info').find('a').attr('href').replace('/v2/users/', '').replace('/post_list', '') * 1

				if(com_id_set.indexOf(com_id) == -1) {
					com_id_set.push(com_id)
					/*com.push({
						com_id: com_id,
						from: 'niuniu',
						loaded: false,
						adddate: formatTime(new Date(), true),
						addtime: new Date().getTime()
					});*/
				}

			}
			//console.log(biz_id_set)
			//console.log(com_id_set)
			$n.rmExistList(biz_id_set, com_id_set, function(list_to_get) {
				if(list_to_get.biz.list.length) {
					$n.getBizInfo($);
				}
				if(list_to_get.com.list.length) {
					$n.getComInfo(list_to_get.com.list);
				}
			});

			return

		})

	}
	$n.getBizInfo = ($) => {
		let listDiv = $('.listing-cars');
		let items = listDiv.find('.item');
		let list = [];

		for(let i = 0; i < items.length; i++) {
			let info = {
				"biz_id": "", //19
				"querytitle": "", //1
				"brand": "", //2
				"clazz": "", //3
				"year": "", //4
				"gf_price": "", //5
				"gf_price_txt": "", //6
				"selltype": "", //7
				"amount": '', //8
				"sellprice": "", //9
				"type": "", //10
				"model": "", //11
				"area": "", //12
				"bookmark": "", //13
				"outColor": "", //14
				"innerColor": "", //15
				"addtime": new Date().getTime(), //16
				"addtime_text": formatTime(new Date()), //17				
				"com_id": "", //18
				"released": false,
				"from": 'niuniu',
				"by": "Marico"

			}
			let item = $(items[i]);
			//1
			info.querytitle = item.find('.car-title').find('a').text();
			let title = $n.dealItemUtils.dealTitle(info.querytitle);
			//3
			info.clazz = title.clazz;
			//4
			info.year = title.year;
			//11
			info.model = title.model
			let str_prices = item.find('.car-guide-price').text().split('/');
			//5
			info.gf_price = str_prices[0].replace('万', '').replace('指导价:', '') * 1;
			//6
			info.gf_price_txt = (info.gf_price + '').replace('.', '') * 1;
			let price = $n.dealItemUtils.dealPrice(str_prices[1]);
			//7
			info.selltype = price.type;
			//8
			info.amount = price.amount;

			//9
			info.sellprice = item.find(".car-price").text().replace('万', '') * 1;
			//13
			info.bookmark = trim(item.find(".car-remark").find('p').text().replace('备注:', ''));
			let color_and_type = $n.dealItemUtils.dealColorAndType(item.find('.car-subtitle').find('span').text());
			//10
			info.type = color_and_type.type;
			//14
			info.outColor = color_and_type.outColor;
			//15
			info.innerColor = color_and_type.innerColor;
			//18
			info.com_id = item.find('.user-info').find('a').attr('href').replace('/v2/users/', '').replace('/post_list', '') * 1
			//19
			info.biz_id = item.find('.car-title').find('a').attr('href').replace('/v2/cars/', '') * 1
			list.push(info)

		}
		if(list.length) {
			$n.db.biz.insertMany(list, {
				ordered: false
			}, function(err, res) {
				if(err) {
					console.log('Error:' + err );
					console.log('biz 此次插入' + res.insertedCount + '条');
				} else {
					if($n.setting.debug) {
						//console.log(res)
					}
					console.log('biz 插入成功' + res.insertedCount + '条');

				}
			});
		}

	}
	$n.getComInfo = (list) => {
		//console.log(list)
		let index = 0;
		let itv = setInterval(() => {
			setTimeout(function() {
				$n.getComData(list[index]);
				index++;
				if(index >= list.length) {
					clearInterval(itv);
				}
			}, Math.random() * 10000)

		}, (1000 * 60 + Math.random() * 5000))

	}
	$n.getComData = (com_id) => {
		console.log('Getting com ' + com_id + ' ......' )
		let loadUrlOpt = $n.getOpt($n.baseUrl + '/v2/users/' + com_id + '/post_list', 0, $n.baseUrl + $n.url);
		$n.get(loadUrlOpt, function(res) {
			if(res.err) {
				console.log('Com page load err \n');
			} else {
				//console.log('Getting com ' + com_id + ' OK ')
				let $ = cheer.load(res.body);
				let com = {
					com_id: com_id, //list[0]
					name: '',
					mainBrand: [],
					sellCount: '',
					sellCountOver: '',
					score: '',
					scored_user: '',
					users: [],
					addtime: new Date().getTime(),
					adddate: formatTime(new Date()),
					from: 'niuniu',
					by: 'Marico'

				}; {
					com.name = $('.user-name').text();
					let mainBrand = $('.user-main-brand').text().replace('主营:', '').replace(/[\~|\!|\@|\*|\;|\'|\"|\.|\?|，|、|。|？|！|～|＄|％|＠|＆|＃|＊|?|；|∶|…|¨|，]/g, ',').replace(' ', '').split(',');
					com.mainBrand = mainBrand;
					let com_details = $('.user-detail').find('dl');
					com.sellCount = $($(com_details[0]).find('font')[0]).text().replace('单', '') * 1;
					com.sellCountOver = $($(com_details[0]).find('font')[1]).text().replace('超过', '').replace('用户', '').replace('%', '') / 100;
					com.score = $($(com_details[1]).find('font')[0]).text().replace('分', '') * 1;
					com.scored_user = $($(com_details[1]).find('font')[1]).text().replace('人评价', '') * 1;
				}
				let getTelOpt = {
					Authorization: $("meta[name=csrf2-token]").attr('content'),
					token: $('.btn-mobile').attr('data-token'),
					token2: $("meta[name=csrf-token]").attr('content'),

				}
				$n.getTel(getTelOpt, function(res) {
					if(res.err) {
						console.log('Err:' + err)
					} else {
						console.log('Get com ' + com_id + ' tel OK')
						let result = JSON.parse(res.body);
						if(result.status == 200) {
							let users = result.mobile.split('<br/>');
							for(let i = 0; i < users.length; i++) {
								let user = users[i].split(':');
								if(user.length > 1) {
									com.users.push({
										name: user[0],
										tel: trim(user[1])
									})
								} else {
									com.users.push({
										name: '',
										tel: trim(user[0])
									})
								}
							}
							$n.updateCom(com);
						} else {
							console.log('get mobile faild ');
						}
						//console.log(com)
						//console.log(info)
					}
				})
			}
		})
	}
	$n.rmExistList = (biz, com, cb) => {
		let list = {
			biz: {
				ok: false,
				list: []
			},
			com: {
				ok: false,
				list: []
			}
		};
		if(biz.length) {
			$n.db.biz.find({
				"biz_id": {
					$in: biz
				}
			}, {
				"biz_id": 1,
				"_id": 0
			}).toArray((err, res) => {
				if(res.length) {
					res.map(function(v, k) {
						res[k] = v.biz_id
					})
				}
				if(err) {
					list.biz.ok = true;
				} else {
					list.biz.ok = true;
					list.biz.list = $n.getArrMinus(biz, res);
				}
				ck_complete();
			});
		} else {
			console.log('No biz you want to get ');
		}
		if(com.length) {
			let com_list = $n.db.com.find({
				"com_id": {
					$in: com
				}
			}, {
				"com_id": 1,
				"_id": 0
			}).toArray((err, res) => {
				if(res.length) {
					res.map(function(v, k) {
						res[k] = v.com_id
					})
				}
				if(err) {
					list.com.ok = true;
				} else {
					list.com.ok = true;
					list.com.list = $n.getArrMinus(com, res);
				}
				ck_complete();
			});
		} else {
			console.log('No com you want to get ');
		}

		function ck_complete() {
			if(list.biz.ok && list.com.ok) {
				//console.log(list)
				console.log("Step3 : Ckeck if Exist , done , Biz:" + list.biz.list.length + ' Com:' + list.com.list.length + " to get data")
				cb(list);
			} else {
				//not yet
			}
		}

	}
	$n.getArrMinus = (arr1, arr2) => {
		let arr = []
		for(let i = 0; i < arr1.length; i++) {
			if(arr2.indexOf(arr1[i]) == -1) {
				arr.push(arr1[i])
			}
		}
		return arr;
	}

	$n.dealItemUtils = {
		dealPrice(str) {
			let type = {
				type: '',
				amount: ''
			};
			if(str != undefined && str != 'undefined') {
				let type1 = str[0];
				let type2 = str[str.length - 1];
				if(type1 == '下' && type2 == '点') {
					type.type = 'pct';
					type.amount = str.replace('下', '').replace('点', '') * 1;
				} else if(type1 == '下' && type2 == '万') {
					type.type = 'minus';
					type.amount = str.replace('下', '').replace('万', '') * 1;
				} else if(type1 == '加') {
					type.type = 'plus';
					type.amount = str.replace('加', '').replace('万', '') * 1;
				}
			}
			return type
		},
		dealTitle(title) {
			//昂科雷 14款 3.6L 四驱智享旗舰型
			let title_arr = title.split(' ');
			return {
				clazz: title_arr[0],
				year: (('20' + title_arr[1]).replace('款', '')) * 1,
				model: trim(title.replace(title_arr[0], '').replace(title_arr[1], ''))
			}
		},
		dealColorAndType(str) {
			let arr = str.split('|');
			let color = arr[1].split('/');
			return {
				type: arr[0].split('/')[0],
				outColor: color[0],
				innerColor: color[1]
			}
		}
	}
	$n.updateCom = (com) => {
		$n.db.com.update({
				com_id: com.com_id
			}, {
				$set: com
			}, {
				upsert: true
			},
			function(err, res) {
				if(err) {
					console.log('update com ' + com.com_id + '  err')
				} else {
					console.log('update com ' + com.com_id + '  ok')
				}
			})
	}
	$n.updateBiz = (info) => {
		$n.db.biz.update({
			biz_id: info.biz_id,
			loaded: false
		}, {
			$set: info
		}, function(err, res) {
			if(err) {
				console.log('update biz ' + info.biz_id + 'err')
			} else {
				console.log('update biz ' + info.biz_id + 'ok')
			}
		})
	}
	$n.getTel = (opt, cb) => {
		let params = {
			url: $n.baseUrl + '/users/mobile',
			gzip: true,
			jar: $j,
			headers: {
				'Accept': '*/*',
				'Authorization': opt.Authorization,
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'zh-CN,zh;q=0.8',
				'Connection': 'keep-alive',
				'Content-Length': 20,
				'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
				'Cookie': $n.usrs[0].cookie1,
				'Origin': 'http://www.niuniuqiche.com',
				'Host': 'www.niuniuqiche.com',
				'Referer': 'http://www.niuniuqiche.com/v2/cars/' + opt.biz_id,
				'Upgrade-Insecure-Requests': 1,
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3831.407 Safari/537.36',
				'X-CSRF-Token': opt.token2,
				'X-Requested-With': 'XMLHttpRequest',
			},

			form: {
				token: opt.token
			}

		}
		$r.post(params, function(err, res, body) {
			cb({
				err: err,
				res: res,
				body: body
			})
		})
		//$n.get(params, cb)
	}
	$n.getOpt = (url, userIndex = 0, Referer = $n.baseUrl + '/v2') => {
		return {
			url: url,
			gzip: true,
			jar: $j,
			headers: {
				'Accept': '*/*',
				'Accept-Encoding': 'gzip, deflate',
				'Accept-Language': 'zh-CN,zh;q=0.8',
				'Connection': 'keep-alive',
				'Cache-Control': 'max-age=0',
				'Cookie': $n.usrs[userIndex].cookie1,
				'Referer': Referer,
				'Host': 'www.niuniuqiche.com',
				'Upgrade-Insecure-Requests': 1,
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3831.407 Safari/537.36',
				'X-Requested-With': 'XMLHttpRequest'
			}
		};
	}
	$n.get = (opt_or_url, cb) => {
		$r.get(opt_or_url, function(err, res, body) {
			cb({
				err: err,
				res: res,
				body: body
			})
		})
	}
	$n.test = () => {
		var ProgressBar = require('progress');
		var https = require('https');

		var req = https.request({
			host: 'download.github.com',
			port: 443,
			path: '/visionmedia-node-jscoverage-0d4608a.zip'
		});

		req.on('response', function(res) {
			var len = parseInt(res.headers['content-length'], 10);

			console.log();
			var bar = new ProgressBar('  downloading [:bar] :rate/bps :percent :etas', {
				complete: '=',
				incomplete: ' ',
				width: 20,
				total: len
			});

			res.on('data', function(chunk) {
				bar.tick(chunk.length);
			});

			res.on('end', function() {
				console.log('\n');
			});
		});

		req.end();
	}
	$n.init();

}

module.exports = {
	getNiuNiu: getNiuNiu
}