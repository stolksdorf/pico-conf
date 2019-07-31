const test = require('pico-check');
const conf = require('../pico-conf.js');


test('initialize', (t)=>{ conf.clear(); });


test('client only accepts paths', (t)=>{
	t.throws(()=>conf.client({ a : true }));
});

test('setting client with string', (t)=>{
	conf.clear();
	conf.add({ b : true,  a : true  })
		.client('a');

	t.is(conf.get('b'), true);
	t.is(conf.get('a'), true);

	t.is(conf.getClientObj(), { a : true });
});

test('setting client with array', (t)=>{
	conf.clear();

	conf.add({ b : true,  a : false, c : { d : 5, e : 7 }  })
		.client(['a', 'c:d']);

	t.is(conf.getClientObj(), { a : false, c : { d : 5 } });
	t.not(conf.getClientObj(), { b : true,  a : false, c : { d : 5, e : 7 }  });
});


test('generate and load', (t)=>{
	conf.clear();
	conf.add({ b : true,  a : false, c : { d : 5, e : 7 }  })
		.client(['a', 'c:d']);

	eval(`conf.clear(); ${conf.generateClientScript()}; conf.loadClientScript();`);

	t.is(conf.get('a'), false);
	t.is(conf.get('c:d'), 5);
	t.throws(()=>conf.get('b'));
	t.throws(()=>conf.get('c:e'));

});








module.exports = test;