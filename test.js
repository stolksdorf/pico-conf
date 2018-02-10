const test = require('pico-check');
const conf = require('./pico-config.js');
const pckg = require('./package.json');

test.group('add', (test)=>{
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

	test('basic add', (t)=>t.is(conf.get('add1'), true))
	test('merging nested objects', (t)=>t.is(conf.get('add2:add4'), 'yes'))
	test('custom separator', (t)=>t.is(conf.get('add2:add3'), 6));
	test('lowercase works', (t)=>t.is(conf.get('auth'), true));
	test('can not overwrite', (t)=>t.is(conf.get('addoverwrite'), 5));
	test('returns undefined for deep bad path', (t)=>t.is(conf.get('not:there'), undefined));
});

test.group('overrides & defaults', (test)=>{
	conf
		.add({or1 : true})
		.overrides({or1 : 888, or2: 999})
		.defaults({def1 : 555, def2 : 222})
		.add({def1 : 444})

	test('defaults works', (t)=>t.is(conf.get('def2'), 222));
	test('defaults are overriden', (t)=>t.is(conf.get('def1'), 444));

	test('overrides works', (t)=>t.is(conf.get('or2'), 999));
	test('overrides can not be overriden', (t)=>t.is(conf.get('or1'), 888));
});


test.skip().group('Comamnd line args', (test)=>{
	conf.argv({sep : ':', lowercase:true});

	test('can get command line args', (t)=>t.is(conf.get('test_arg'), 5));
	test('sep and lowercase work', (t)=>t.is(conf.get('test:arg'), 'true'));
});


test.group('Environment variables', (test)=>{
	conf.env({lowercase:true});

	test('can read env vars', (t)=>t.is(conf.get('npm_package_version'), pckg.version));
	test('lowercase works', (t)=>t.is(conf.get('node_env'), 'local'));
});


test.group('edge cases', (test)=>{
	test.skip('merges into an non-object key', (t)=>{

	});
	test.skip('custom get separator', (t)=>{

	})
	test('required throws an error', (t)=>{
		let pass
		try{
			conf.required(['add1', 'required1'])
		}catch(err){ pass = true }
		t.ok(pass);
	});
	test('required does not throw if all populated', (t)=>{
		try{conf.required(['add1'])}catch(err){ t.fail() }
	});
})

module.exports = test;

