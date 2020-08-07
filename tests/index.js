const config = require('../pico-conf.js');




const basic = {
	base : (t)=>{
		let temp = config.add({
			test : true,
			a : 5,
			b : {
				c : 4
			}
		})

		console.log(temp.get('B:c'))
		console.log(temp.get('b:d', 'foo'))
	},
	two_configs : (t)=>{
		let temp = config.add({a : 5});
		let temp2 = config.add({b : 6});

		t.is(temp.get('a', false), 5)
		t.is(temp.get('b', false), false)

		t.is(temp2.get('a', false), false)
		t.is(temp2.get('b', false), 6)
	},
	env_var : (t)=>{
		//config.env()
	},

	file : (t)=>{
		config.file('./local.js')
	}
}





module.exports = {
	basic,
}

