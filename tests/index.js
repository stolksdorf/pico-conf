const Config = require('../pico-conf.js');




const set = require('./set.test.js');
const get = require('./get.test.js');




/*
	set
		- lowercases keys
		- overwrites
		- deep nesting
		- returns new instances (create two new from a single instance)
			- make sure they don't mutate

	get
		- Deep nesting
		- lowercases
		- fallback func
		- fallback val

	file
		- relative pathing works
		- bad path
		- bad file

	env
		- key splitting works
		- lowercasing works

	json
		- returns everything in empty
		- slices work
		- sub-objecting works


*/



// const basic = {
// 	base : (t)=>{
// 		let temp = Config.set({
// 			test : true,
// 			a : 5,
// 			b : {
// 				c : 4
// 			}
// 		})

// 		console.log(temp.get('B:c'))
// 		console.log(temp.get('b:d', 'foo'))
// 	},
// 	two_configs : (t)=>{
// 		let temp = Config.set({a : 5});
// 		let temp2 = Config.set({b : 6});

// 		t.is(temp.get('a', false), 5)
// 		t.is(temp.get('b', false), false)

// 		t.is(temp2.get('a', false), false)
// 		t.is(temp2.get('b', false), 6)
// 	},
// 	env_var : (t)=>{
// 		//Config.env()
// 	},

// 	file : (t)=>{
// 		Config.file('./local.js')
// 	}
// }





module.exports = {
	//basic,
	set,
	get
}

