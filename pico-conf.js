//const dir = require('path').dirname;
//let overrides = {}, configs = {}, defaults = {}, clientPaths = [];


//let getSeparator = /:|\.|__/;


const sep = /:|\.|__/;
//const client_var = 'picoconf_client_configs';

const execute = (val, ...args)=>typeof val ==='function' ? val(...args) : val;
const isUndef = (val)=>typeof val === 'undefined'
const isObj   = (val)=>(!!val) && (val.constructor === Object);


const put = (obj, arrPath, val)=>{
	const key = arrPath.shift();
	if(!isObj(obj[key])) obj[key] = {};
	(arrPath.length == 0)
		? obj[key] = val
		: put(obj[key], arrPath, val);
	return obj;
};

const merge = (base, obj)=>{
	Object.entries(obj).map(([key, val])=>{
		key = key.toLowerCase();
		if(!isObj(base[key])) base[key] = {};
		if(isObj(val)){
			merge(base[key], val);
		}else{
			base[key] = val;
		}
	});
	return base;
};


/*
const dig = (obj, path)=>{
		if(path.length == 0) return obj = value;
		const key = path.shift();
		if(typeof obj[key] === 'undefined'){
			obj[key] = typeof key === 'number' ? [] : {};
		}
		return dig(obj[key], path, value);
	}
	return dig(obj, makePath(path));
*/

const create = (conf={})=>{

	const split = (path)=>path.toLowerCase().split(Config.sep);

	const Config = {
		sep,
		//client_var,
		file : (path, fallback=(err)=>{throw new Error(err)})=>{
			let contents;
			try{
				//TODO: this might not work.... check that arguments 2 works each time... maybe grab the last valid one?
				contents = require(require.resolve(path, { paths : [arguments[2].parent.path] }));
			}catch(err){
				contents = execute(fallback, err)
			}
			return Config.set(contents);
		},
		argv : ()=>{
			const obj = process.argv.slice(2).reduce((acc, arg)=>{
				const parts = arg.split('=');
				if(parts.length == 2) acc[parts[0]] = parts[1];
				return acc;
			}, {});
			return Config.set(obj);
		},
		env : ()=>{
			let _base = {...conf};
			Object.entries(process.env).map(([key, val])=>{
				_base = put(_base, key.split(Config.sep), val);
			});
			return create(_base);
		},
		set : (obj)=>{
			return create(merge({...conf}, obj));
		},
		get : (path, fallback=(p)=>{throw new Error(`config '${p}' is not set`)})=>{
			let val = split(path)
				.reduce((acc, part)=>isUndef(acc) ? undefined : acc[part], conf);
			if(isUndef(val)) return execute(fallback, path)
			return val;
		},

		// Write up example about sending these client-side
		json : (...paths)=>{
			if(paths.length == 0) return conf;
			return paths.reduce((acc, path)=>{
				return put(res, split(path), Config.get(path));
			}, {});
		},

		/* Isomorphic Example

			// in html rendering

			`window.clientsafe_configs = ${JSON.stringify(config.json(
				'not_a_secret',
				'proj.clientsafe',
				'really.nested.value'
			))};`


			//in config index.js
			if(typeof window !=== 'undefined'){
				module.exports = conf.set(window.clientsafe_configs);
			}else{

				module.exports = conf
					.file('./defaults.js')
					.
			}
		*/





		// These can probably be removed To be honest
		/*
			A simple injectable script at bundle should work, just give an example of it
		*/
		// getScript : (...paths)=>{
		// 	let obj = {}
		// 	//for each path, get the value, and set it to the object at the same heirarchy

		// 	return `${Config.client_var}=${JSON.stringify(obj)};`;
		// },
		// //call global?
		// loadScript : ()=>{
		// 	if(typeof global !== 'undefined' && typeof global[Config.client_var] === 'object'){
		// 		return Config.set(global[Config.client_var]);
		// 	}
		// 	if(typeof window !== 'undefined' && typeof window[Config.client_var] === 'object'){
		// 		return Config.set(window[Config.client_var]);
		// 	}
		// 	throw new Error('could not find globally stored Config.')
		// }
	}

	return Config;
}


module.exports = create();
