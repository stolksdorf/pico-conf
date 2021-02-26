const Config = require('../pico-conf.js');




const set = require('./set.test.js');
const get = require('./get.test.js');


const file = {
	pckg_req : (t)=>{
		Config.file('../package.json');
		t.is(Config.get('name'), 'pico-conf')
	},
	fallback : (t)=>{
		Config.file('../packaggggge.json', {
			name : 'fallback'
		});
		t.is(Config.get('name'), 'fallback');
	},
	not_found : (t)=>{
		t.throws(()=>{
			Config.file('../packaggggge.json');
		})
	},
	bad_parse : (t)=>{
		t.throws(()=>{
			Config.file('./bad_formatted.config.js');
		})
	},
	bad_parse_with_fallback : (t)=>{
		t.throws(()=>{
			Config.file('./bad_formatted.config.js', {name : 'fallback'});
		})
	}
}




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

module.exports = {
	//basic,
	set,
	get,
	file,
}

