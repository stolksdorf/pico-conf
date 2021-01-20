const sep = /:|\.|__/;
const isObj = (obj)=>!!obj && (typeof obj == 'object' && obj.constructor == Object);
const undef = (obj)=>typeof obj === 'undefined';
const exe = (obj, ...args)=>typeof obj=='function'?obj(...args):obj;
const put = (obj, arrPath, val)=>{
	const key = arrPath.shift();
	if(!isObj(obj[key])) obj[key] = {};
	(arrPath.length == 0) ? obj[key] = val : put(obj[key], arrPath, val);
	return obj;
};
const conf = {
	cache : {},
	get : (path, fallback)=>{
		return path.toLowerCase().split(sep).reduce((acc, part)=>{
			if(!undef(acc[part])) return acc[part];
			if(undef(fallback)) throw `No config var set at: ${path}`;
			return exe(fallback, path);
		}, conf.cache);
	},
	set : (obj)=>{
		const merge = (base, obj)=>{
			Object.entries(obj).map(([key, val])=>{
				key = key.toLowerCase();
				if(!isObj(base[key])) base[key] = {};
				if(isObj(val)) return merge(base[key], val);
				base[key] = val;
			});
			return base;
		};
		conf.cache = merge(conf.cache, obj);
		return conf;
	},
	argv : ()=>{
		conf.set(process.argv.slice(2).reduce((acc, arg)=>{
			const [key,val] = arg.split('=');
			acc[key] = undef(val) ? true : val;
			return acc;
		}, {}));
		return conf;
	},
	env : ()=>{
		Object.entries(process.env).map(([key, val])=>{
			conf.cache = put(conf.cache, key.toLowerCase().split(sep), val)
		});
		return conf;
	},
	file : (path, fallback)=>{
		try{
			return conf.set(require(require.resolve(path, { paths : [(arguments[2].parent||arguments[2]).path] })));
		}catch(err){
			if(undef(fallback)) throw `Can not find config file at: ${path}`;
			return conf.set(exe(fallback, path));
		}
	},
};
module.exports = conf;