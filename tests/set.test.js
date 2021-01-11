const Config = require('../pico-conf.js');


/*
	set
		- lowercases keys
		- overwrites
		- deep nesting
		- returns new instances (create two new from a single instance)
			- make sure they don't mutate

*/

module.exports = {
	env : (t)=>{
		let conf = Config.env();
	},
	lowercase_keys :(t)=>{
		let conf = Config.set({
			ALL_CAPS : true,
			MixEd : true,
			Nested : {
				KEYS : true,
			}
		})

		t.ok(conf.get('all_caps'));
		t.ok(conf.get('mixed'));
		t.ok(conf.get('nested:keys'));
	},
	overwrites : (t)=>{
		let conf = Config.set({
			a : 5,
			b : 5,
			arr : [1,2,3],
			partial : {
				x : 5,
				y : 5
			}
		})
		conf = conf.set({
			c : 6,
			b : 6,
			arr : [4,5,6],
			partial : {
				x : 6,
				z : 6
			}
		});

		t.is(conf.get('a'), 5)
		t.is(conf.get('b'), 6)
		t.is(conf.get('c'), 6)

		t.is(conf.get('arr'), [4,5,6])

		t.is(conf.get('partial.x'), 6)
		t.is(conf.get('partial.y'), 5)
		t.is(conf.get('partial.z'), 6)

	},

	deep_nesting : (t)=>{
		let conf = Config.set({
			a : {
				b : {
					e : false,
					f : true
				},
				c : {
					d : true
				}
			}
		})

		conf = conf.set({
			a : {
				b : {
					e : true,
					f : {
						g: true
					}
				},
				c : true
			}
		});

		t.ok(conf.get('a.b.e'))
		t.ok(conf.get('a.b.f.g'))
		t.ok(conf.get('a.c'))
	},
}