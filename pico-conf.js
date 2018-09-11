const dir = require('path').dirname;
let overrides = {}, configs = {}, defaults = {};
let getSeparator = /:|\.|__/;
let defaultOpts = {
	sep : /:|\.|__/,
	lowercase : true,
};
const isObject = (item)=>(item && typeof item === 'object' && !Array.isArray(item));
const notSet = (val)=>!val&&val!==false;

const getCaller = (offset=0)=>{
	const cache = Error.prepareStackTrace;
	Error.prepareStackTrace = (_, stack)=>stack;
	const target = (new Error()).stack[2+offset];
	Error.prepareStackTrace = cache;
	return target;
};

const parse = (target, obj, opts={}, paths=[])=>{
	opts = Object.assign({}, defaultOpts, opts);
	if(isObject(obj) && Object.keys(obj).length !== 0){
		Object.keys(obj).map((key)=>{
			const newKey = (opts.lowercase ? key.toLowerCase() : key);
			const temp = newKey.split(opts.sep);
			const newPaths = paths.concat(temp.length > 1 ? temp : [newKey]);
			parse(target, obj[key], opts, newPaths);
		})
	}else{
		set(target, paths, obj);
	}
};
const set = (target, paths, val)=>{
	if(paths.length == 0) return;
	if(paths.length == 1){
		if(notSet(target[paths[0]])) target[paths[0]] = val;
		return;
	}
	if(typeof target[paths[0]] !== 'object') target[paths[0]]={};
	return set(target[paths[0]], paths.slice(1), val);
};
const get = (target, paths)=>{
	if(paths.length == 0) return target;
	if(notSet(target[paths[0]])) return;
	return get(target[paths[0]], paths.slice(1));
};
const merge = (...args)=>{
	return args.reduce((acc, obj) => {
		if(!isObject(obj)) return notSet(obj) ? acc : obj;
		if(!isObject(acc)) acc = {};
		Object.keys(obj).forEach(key => {
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
	raw : ()=>{ return {overrides, configs, defaults} },
	env : (opts)=>Config.add(process.env, opts),
	argv : (opts)=>{
		const obj = process.argv.slice(2).reduce((acc, arg)=>{
			const parts = arg.split('=');
			if(parts.length==2) acc[parts[0]] = parts[1];
			return acc;
		}, {});
		return Config.add(obj, opts);
	},
	add : (obj, opts)=>{
		parse(configs, obj, opts);
		return Config;
	},
	defaults : (obj, opts)=>{
		parse(defaults, obj, opts);
		return Config;
	},
	overrides : (obj, opts)=>{
		parse(overrides, obj, opts);
		return Config;
	},
	file : (path, opts)=>{
		const caller = getCaller();
		try{
			return Config.add(require(require.resolve(path, {paths : [dir(caller.getFileName())]})), opts);
		}catch(err){
			console.error(`Can not find config file: '${path}' from '${caller.getFileName()}'`);
		}
		return Config;
	},
	sep : (newSep)=>{
		getSeparator = (!!newSep ? newSep : defaultOpts.sep);
		return Config;
	},
	required : (keys, message='')=>{
		if(!Array.isArray(keys)) keys = [keys];
		const missing = keys.filter((key)=>notSet(Config.get(key, true)));
		if(missing.length) throw `Config values: ${missing.join(', ')} are missing and are expected to be set. ${message}`;
		return Config;
	},
	clear : ()=>{ overrides={}; configs={}; defaults={}; return Config; },
	get : (path, allowEmpty=false)=>{
		const paths = path.split(getSeparator);
		const result = merge(get(defaults, paths), get(configs, paths), get(overrides, paths));
		if(notSet(result) && !allowEmpty){
			const caller = getCaller();
			throw `Config value: ${path} is missing/not set. \n${caller.getFileName()}:${caller.getLineNumber()}`;
		}
		return result;
	},
	has : (path)=>{
		try{
			Config.get(path);
			return true;
		}catch(err){ return false; }
	},
};
Config.set = Config.add;
module.exports = Config;