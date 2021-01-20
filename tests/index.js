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

module.exports = {
	//basic,
	set,
	get
}

