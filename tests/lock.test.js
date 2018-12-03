'use strict';
const test = require('pico-check');
const conf = require('../pico-conf.js');

test('initialize', (t)=>{ conf.clear(); });

test.group('add', (test)=>{
	test('setup', (t)=>{
		conf.add({
			test1 : true,
			test2 : {
				test4 : 'yes',
				arr : [1,2,3]
			},
			test3 : 5
		})
		.defaults({
			test0 : 'default'
		})
		.add({
			AUTH : true,
		})
		.lock();
	});


	test('lock returns config object', (t)=>{
		const config = conf.lock();
		t.is(typeof config, 'object');
		t.is(typeof config.get, 'function');
		t.is(typeof config.lock, 'function');
	});

	test('lock does not modify structure', (t)=>{
		t.is(conf.get('test1'), true);
		t.is(conf.get('test2:arr'), [1,2,3]);
		t.is(conf.get('test3'), 5);
		t.is(conf.get('test0'), 'default');
	});

	test('can not modify objects in configs', (t)=>{
		t.throws(()=>{
			const topLevel = conf.get('test2');
			topLevel = { newObject : true};
		})
	});

	test('can not modify config arrays', (t)=>{
		t.throws(()=>{
			const array = conf.get('test2:arr');
			array.push(4);
		});

		t.throws(()=>{
			const array = conf.get('test2:arr');
			array[0]=4;
		});
	});

	test('can still cloned locked arrays', (t)=>{
		const array = conf.get('test2:arr').slice();
		array.push(4);
		t.is(array.length, 4);
		t.is(conf.get('test2:arr').length, 3)
	});

	test('can not modify nexted objects in configs', (t)=>{
		const obj = conf.get('test2');
		obj.newProp = true;
		t.not(obj, conf.get('test2'));
	});

	test('can not add more to the config', (t)=>{
		t.throws(()=>conf.add({ newProp : 6 }));
	});

	test('clear should not run if locked', (t)=>{
		conf.clear();
		t.is(conf.get('test1'), true);
	});
});

module.exports = test;