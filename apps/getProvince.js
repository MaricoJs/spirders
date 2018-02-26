/**
 * New node file
 * getProvince from qq map
 */
function getProvince(pid) {
	//46EBZ-JAQKF-ZASJP-N2ZX7-RDXQK-OFFRI
	let k = '46EBZ-JAQKF-ZASJP-N2ZX7-RDXQK-OFFRI';
	let tencentMapApiUrl
	if(pid) {
		tencentMapApiUrl = 'http://apis.map.qq.com/ws/district/v1/list?key=' + k + '&id=' + id;
	} else {
		tencentMapApiUrl = 'http://apis.map.qq.com/ws/district/v1/list?key=' + k;
	}

	getPage(tencentMapApiUrl, function(body) {
		//console.log(body);
		let addrFile = 'addr.json'
		let add = JSON.parse(body.res.body).result;

		let pr = add[0];
		let city = add[1]
		let addr = {};
		addr.pr = [];
		addr.cities = {};
		for(let i = 0; i < pr.length; i++) {
			let add_p = pr[i];
			let cities = [];
			for(let j = add_p.cidx[0]; j <= add_p.cidx[1]; j++) {
				let ci = city[j];
				if(!!ci.cidx) {
					delete ci.cidx;
					ci.location = [ci.location.lat, ci.location.lng];
					cities.push(ci);
				}
			}
			delete add_p.cidx;
			add_p.location = [add_p.location.lat, add_p.location.lng]
			addr.pr.push(add_p);
			addr.cities['ct_' + add_p.id] = cities;
		}
		fs.writeFile(addrFile, JSON.stringify(addr), function() {
			console.log('ok')
		});
	})

}
