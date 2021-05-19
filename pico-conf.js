const sep = /:|\.|__/;
const isObj = (obj)=>!!obj && (typeof obj == 'object' && obj.constructor == Object);
const undef = (obj)=>typeof obj === 'undefined';
const exe = (obj, ...args)=>typeof obj=='function'?obj(...args):obj;
const put = (obj, arrPath, val)=>{
	if(undef(val)) return obj;
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
			if(undef(fallback)) throw new Error(`No config var set at: ${path}`);
			return exe(fallback, path);
		}, conf.cache);
	},
	set : (obj)=>{
		if(!isObj(obj)) return conf;
		const merge = (base, obj)=>{
			Object.entries(obj).map(([key, val])=>{
				key = key.toLowerCase();
				if(isObj(val)){
					if(!isObj(base[key])) base[key] = {};
					return merge(base[key], val);
				}
				if(!undef(val)) base[key] = val;
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
			const notFoundErr = err.toString().startsWith('Error: Cannot find module');
			if(notFoundErr && !undef(fallback)) return conf.set(exe(fallback, path));
			throw err
		}
	},
};
module.exports = conf;