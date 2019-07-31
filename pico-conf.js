const dir = require('path').dirname;
let overrides = {}, configs = {}, defaults = {}, clientPaths = [];
let getSeparator = /:|\.|__/;
const defaultOpts = {
	sep       : /:|\.|__/,
	lowercase : true,
};
const isObject = (item)=>(item && typeof item === 'object' && !Array.isArray(item));
const notSet = (val)=>!val && val !== false;

const getTrace = (offset = 0)=>{
	const stackline = (new Error()).stack.split('\n')[offset + 2];
	let name, loc = stackline.replace('at ', '').trim();
	const res = /(.*?) \((.*?)\)/.exec(loc);
	if(res){ name = res[1]; loc = res[2]; }
	const [_, filename, line, col] = /(.*?):(\d*):(\d*)/.exec(loc);
	return { filename, name, line, col };
};

const parse = (target, obj, opts = {}, paths = [])=>{
	opts = Object.assign({}, defaultOpts, opts);
	if(isObject(obj) && Object.keys(obj).length !== 0){
		Object.keys(obj).map((key)=>{
			const newKey = (opts.lowercase ? key.toLowerCase() : key);
			const temp = newKey.split(opts.sep);
			const newPaths = paths.concat(temp.length > 1 ? temp : [newKey]);
			parse(target, obj[key], opts, newPaths);
		});
	} else {
		set(target, paths, obj);
	}
};
const set = (target, paths, val)=>{
	if(paths.length == 0) return;
	if(paths.length == 1){
		if(notSet(target[paths[0]])) target[paths[0]] = val;
		return;
	}
	if(typeof target[paths[0]] !== 'object') target[paths[0]] = {};
	return set(target[paths[0]], paths.slice(1), val);
};
const get = (target, paths)=>{
	if(paths.length == 0) return target;
	if(notSet(target[paths[0]])) return;
	return get(target[paths[0]], paths.slice(1));
};
const merge = (...args)=>{
	return args.reduce((acc, obj)=>{
		if(!isObject(obj)) return notSet(obj) ? acc : obj;
		if(!isObject(acc)) acc = {};
		Object.keys(obj).forEach((key)=>{
			const accVal = acc[key];
			const objVal = obj[key];
			acc[key] = (isObject(accVal) || isObject(objVal))
				? merge(accVal, objVal)
				: objVal;
		});
		return acc;
	});
};

const Config = {
	clientVar : 'picoconf_client_configs',
	raw       : ()=>{ return { overrides, configs, defaults }; },
	env       : (opts)=>Config.add(process.env, opts),
	argv      : (opts)=>{
		const obj = process.argv.slice(2).reduce((acc, arg)=>{
			const parts = arg.split('=');
			if(parts.length == 2) acc[parts[0]] = parts[1];
			return acc;
		}, {});
		return Config.add(obj, opts);
	},
	add       : (obj, opts)=>{ parse(configs, obj, opts); return Config; },
	defaults  : (obj, opts)=>{ parse(defaults, obj, opts); return Config; },
	overrides : (obj, opts)=>{ parse(overrides, obj, opts); return Config; },
	file      : (path, opts = {})=>{
		const { filename } = getTrace(1);
		try {
			return Config.add(require(require.resolve(path, { paths : [dir(filename)] })), opts);
		} catch (err){
			if(err.message.indexOf('Cannot find module') !== -1){
				if(!opts.silent) console.error(`Can not find config file: '${path}' from '${filename}'`);
				return Config;
			}
			if(!opts.silent) console.error(`Could not load config file: '${path}' from '${filename}'`);
			throw err;
		}
		return Config;
	},
	client : (paths)=>{
		if(typeof paths !== 'string' && !Array.isArray(paths)) throw `pico-conf.client() only accepts paths and not values`;
		clientPaths = clientPaths.concat(paths);
		return Config;
	},
	sep : (newSep)=>{
		getSeparator = (!!newSep ? newSep : defaultOpts.sep);
		return Config;
	},
	required : (keys, message = '')=>{
		if(!Array.isArray(keys)) keys = [keys];
		const missing = keys.filter((key)=>notSet(Config.get(key, true)));
		if(missing.length) throw `Config values: ${missing.join(', ')} are missing and are expected to be set. ${message}`;
		return Config;
	},
	clear : ()=>{
		overrides = {}; configs = {}; defaults = {}; clientPaths = [];
		return Config;
	},
	get : (path, allowEmpty = false)=>{
		const paths = path.split(getSeparator);
		const result = merge(get(defaults, paths), get(configs, paths), get(overrides, paths));
		if(notSet(result) && !allowEmpty){
			const caller = getCaller();
			const { filename, line } = getTrace(1);
			throw `Config value: ${path} is missing/not set. \n${filename}:${line}`;
		}
		return result;
	},
	has : (path)=>{
		try {
			Config.get(path);
			return true;
		} catch (err){ return false; }
	},
};
Config.set = Config.add;

/** Client Utils **/
Config.getClientObj = ()=>{
	return clientPaths.reduce((result, path)=>{
		set(result, path.split(getSeparator), Config.get(path));
		return result;
	}, {});
};
Config.generateClientScript = ()=>`${Config.clientVar}=${JSON.stringify(Config.getClientObj())};`;
Config.loadClientScript = ()=>{
	if(typeof global !== 'undefined' && typeof global[Config.clientVar] === 'object'){
		Config.add(global[Config.clientVar]);
	}
	if(typeof window !== 'undefined' && typeof window[Config.clientVar] === 'object'){
		Config.add(window[Config.clientVar]);
	}
};

Config.loadClientScript();
module.exports = Config;