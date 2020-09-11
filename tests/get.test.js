const Config = require('../pico-conf.js');

/*
get
	- Deep nesting
	- lowercases
	- fallback func
	- fallback val

*/



module.exports = {

	deep_nesting : (t)=>{

	},
	lowercase : (t)=>{

	},
	fallback_val : (t)=>{

		t.is(Config.get('foo', true), true);
		t.is(Config.get('foo.bar', 6), 6);
		t.is(Config.get('foo:bar', [1,2,3]), [1,2,3]);
		t.is(Config.get('foo__bar__nested', {a : true}), {a : true});

	},
	fallback_func : (t)=>{

		t.is(Config.get('does.not.exist', ()=>{
			return 6
		}), 6);

		t.is(Config.get('does.not.exist', (tried_path)=>{
			return tried_path
		}), 'does.not.exist')
	}


}