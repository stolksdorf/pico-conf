
let overrides = {};
let configs = {};
let defaults = {};

let separator = ':';

let Opts = {
	sep : ':',
	lowercase : false,

}

const notSet = (val)=>!val&&val!==false;


const Config = {
	env : (opts={})=>{
		Object.keys(process.env).each((key)=>{
			const val = process.env[key];

		});

		return Config;
	},
	argv : (opts={})=>{

		return Config;
	},
	add : (obj, opts={})=>{


		return Config;
	},

	defaults : (obj, opts={})=>{

		return Config;
	},
	overrides : (obj, opts={})=>{

		return Config;
	},

	////////////////

	sep : (newSep)=>{
		separator=newSep;
		return Config;
	},

	required : (keys, message)=>{
		if(!Array.isArray) keys = [keys];
		const missing = keys.filter((key)=>notSet(Config.get(key)));
		if(missing.length){
			throw `Config values: ${missing.join(', ')} are missing and are expected to be set.`;
		}
		return Config;
	},
	get : (path)=>{
		//split on path,
		//run a check on overrides, then configs, then defaults
	}


}


module.exports = Config;