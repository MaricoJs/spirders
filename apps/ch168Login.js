/**
 * New node file
 */

function login() {
	getCookie();
	let url = 'http://www.chehang168.com/index.php?c=login&m=Login';
	let opt = {
		url: url,
		gzip: true,
		jar: $j,
		form: {
			name: '15010021810',
			pwd: '15010021810'
		},
		headers: {
			'Accept': '*/*',
			'Accept-Encoding': 'gzip, deflate',
			'Accept-Language': 'zh-CN,zh;q=0.8',
			'Connection': 'keep-alive',
			'Content-Length': 29,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Host': 'www.chehang168.com',
			'Origin': 'http://www.chehang168.com',
			'Referer': 'http://www.chehang168.com/index.php?c=login&m=index',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 UBrowser/6.2.3831.407 Safari/537.36',
			'X-Requested-With': 'XMLHttpRequest'
		}
	}
	$r.post(opt, function(err, res, body) {
		if(res.statusCode == 200) {
			if(body == 'success') {
				console.log('登录成功')
			} else {
				console.log(body)
			}
		} else {
			console.log('request err', err)
		}
	});

	function getCookie() {
		let url = 'http://www.chehang168.com/';
		getPage(url, function(page) {
			if(page.res.statusCode == 200) {
				console.log('cookie get OK ')
			} else {
				console.log('@f:login @f:getCookie &url:' + url + '~err:');
				console.log(err)
			}
		})
	}
}