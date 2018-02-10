let overrides = {}, configs = {}, defaults = {};
let getSeparator = /[:|\.|__]+/;
let defaultOpts = {
	sep : /[:|\.|__]+/,
	lowercase : false,
};

const notSet = (val)=>!val&&val!==false;
const parse = (target, obj, opts={}, paths=[])=>{
	opts = Object.assign({}, defaultOpts, opts);
	if(typeof obj == 'object'){
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
	let key;
	while(paths.length){
		key = paths.shift();
		if(!paths.length && notSet(target[key])) target[key] = val;
		if(!target[key]) target[key] = {};
		target = target[key];
	};
};
const get = (target, paths)=>{
	let curr = target;
	for(i=0;i<paths.length;++i){
		if(notSet(curr[paths[i]])) return;
		curr = curr[paths[i]];
	}
	return curr;
};

const Config = {
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
	sep : (newSep)=>{
		getSeparator=newSep;
		return Config;
	},
	required : (keys, message)=>{
		if(!Array.isArray) keys = [keys];
		const missing = keys.filter((key)=>notSet(Config.get(key)));
		if(missing.length) throw `Config values: ${missing.join(', ')} are missing and are expected to be set.`;
		return Config;
	},
	get : (path)=>{
		const paths = path.split(getSeparator);
		let result = get(overrides, paths);
		if(notSet(result)) result = get(configs, paths);
		if(notSet(result)) result = get(defaults, paths);
		return result;
	}
}
module.exports = Config;