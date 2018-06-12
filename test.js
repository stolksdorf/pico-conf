const test = require('pico-check');
const conf = require('./pico-conf.js');
const pckg = require('./package.json');

test('initialize', (t)=>{ conf.clear(); });

test('clear configs', (t)=>{
	conf
		.overrides({override_clear : true})
		.add({add_clear : true})
		.defaults({defaults_clear : true});
	conf.clear();
	t.throws(()=>conf.get('override_clear'));
	t.throws(()=>conf.get('add_clear'));
	t.throws(()=>conf.get('defaults_clear'));
});

test.group('add', (test)=>{
	test('setup', (t)=>{
		conf.add({
			add1 : true,
			add2__add3 : 6,
			add2 : {
				add4 : 'yes',
			},
			addoverwrite : 5
		}, {sep : '__'})
		.add({
			AUTH : true,
			addOverwrite : 7
		}, {lowercase:true});
	});

	test('basic add', (t)=>t.is(conf.get('add1'), true))
	test('merging nested objects', (t)=>t.is(conf.get('add2.add4'), 'yes'))
	test('custom separator', (t)=>t.is(conf.get('add2:add3'), 6));
	test('lowercase works', (t)=>t.is(conf.get('auth'), true));
	test('can not overwrite', (t)=>t.is(conf.get('addoverwrite'), 5));
	test('throws error for deep bad path', (t)=>{
		t.throws(()=>conf.get('not:there'));
	});
});


test.group('overrides & defaults', (test)=>{
	test('setup', (t)=>{
		conf
			.add({or1 : true, def3 : { def3a : 10}})
			.overrides({or1 : 888, or2: 999, def3: { def3c : false}})
			.defaults({def1 : 555, def2 : 222, def3 : { def3a : 5, def3b : 6}})
			.add({def1 : 444})
	});

	test('defaults works', (t)=>t.is(conf.get('def2'), 222));
	test('defaults are overriden', (t)=>t.is(conf.get('def1'), 444));

	test('overrides works', (t)=>t.is(conf.get('or2'), 999));
	test('overrides can not be overriden', (t)=>t.is(conf.get('or1'), 888));

	test('objects are merged across storage', (t)=>{
		t.is(conf.get('def3:def3a'), 10);
		t.is(conf.get('def3:def3b'), 6);
		t.is(conf.get('def3'), {
			def3a : 10,
			def3b : 6,
			def3c : false
		});
	});
});


test.group('Command line args', (test)=>{
	test('setup', (t)=>{conf.argv({sep : ':', lowercase:true})});

	test('can get command line args', (t)=>t.is(conf.get('test_arg'), 5));
	test('sep and lowercase work', (t)=>t.is(conf.get('test:arg'), 'true'));
});


test.group('Environment variables', (test)=>{
	test('setup', (t)=>{conf.env({lowercase:true})});

	test('can read env vars', (t)=>t.is(conf.get('npm_package_version'), pckg.version));
	test('lowercase works', (t)=>t.is(conf.get('node_env'), 'local'));
});

test.group('Methods', (test)=>{
	test('.has()', (t)=>{
		conf.add({has1 : 'I exist'});

		t.is(conf.has('has1'), true);
		t.is(conf.has('has47'), false);
	});

	test('arrays', (t)=>{
		conf.add({arr1 : [1,2,3]});

		t.ok(Array.isArray(conf.get('arr1')));
		t.is(conf.get('arr1').length, 3);
		t.is(conf.get('arr1'), [1,2,3]);
	});
});

test.group('Edge cases', (test)=>{
	test('merges into an non-object key', (t)=>{
		conf.add({
			a__b : 444,
			a__b__c : 333,
			empty : {}
		});
		t.not(conf.get('a:b'), 444);
		t.is(conf.get('a:b:c'), 333);
	});
	test('custom get separator', (t)=>{
		conf.sep('&&&');
		conf.add({
			custom_sep : {
				test : 5
			}
		})
		t.is(conf.get('custom_sep&&&test'), 5);
		conf.sep();
		t.is(conf.get('custom_sep.test'), 5);
	});
	test('Does not throw error if allowEmpty is set', (t)=>{
		t.no(conf.get('i__do__not__exist', true));
	});
	test('Can get an empty object', (t)=>{
		t.is(conf.get('empty'), {});
	});
});

test.group('Required', (test)=>{
	test('setup', (t)=>{conf.add({required1:'yes'})});
	test('required throws an error', (t)=>{
		let pass
		try{
			conf.required(['required1', 'required2'])
		}catch(err){ pass = true }
		t.ok(pass);
	});
	test('required does not throw if all populated', (t)=>{
		try{conf.required(['required1'])}catch(err){ t.fail() }
	});
});

module.exports = test;