# pico-conf
A tiny config manager for javascript. Inspired by [nconf](https://www.npmjs.com/package/nconf).

[![NPM](https://nodei.co/npm/pico-conf.png)](https://nodei.co/npm/pico-conf/)

```js
const config = require('pico-conf')
  .argv()
  .env({lowercase:true})
  .add(require(`./${process.env.NODE_ENV}.js`))
  .defaults(require('./defaults.js'));

config.get('auth:token');
```


```js
const config = require('pico-conf')
  .add({ // Set up some basic defaults
    some_setting : true
    also : {
      nesting : {
        is : {
          Supported : true
        }
      }
    }
  })
  // try to load a local config with an empty fallback
  .file('./local.config.json', {})
  .env() //Load in environment variables
  .argv() //And any commandline arguments last


---

config.get('some_setting'); //

config.get('also__nesting.IS:supported'); // true

config.get('I__dont.exist', [1,2,3,4]) // Provides fallback

config.get('important__value', ()=>{
  console.warn('⚠ You should really set this up before doing anything serious ⚠')
  return 'foo'
})

```



#### `.add(obj)`

Adds the `obj` and returns a new `pico-conf` instance. Recursively loops through the object and merges it with whatever was within the existing instance. Lowercases all keys, and overwrites any value with the same path.


#### `.file(path_to_file, [fallback = throws])`

Attempts to `require()` the provided `path_to_file` and uses `.add()` to update and return a new `pico-conf` instance. Uses the caller's file location for relative file paths.

If it can't the file, or they was any issue with reading the file, it will call and use the `fallback` instead. If `fallback` is a value, that will be added, if it's a function, it will be called first and it's returned value will be used. this is useful if you'd like to print helpful warning or error messages if your system was expecting a config to be loaded.

`fallback` defaults to throwing an error.


#### `.env()`



#### `.sep = /:|\.|__/`

The separator string used to parse heirarchy from flat config keys. Defaults to a regex that matches on `.`, `:`, or `__`. You can overwrite this to change `.get()` and `.add()`s key splitting behaviour





#### `.json([...paths])`

Returns a JSON object of all the stored configs in the `pico-conf` instance. If one or more `paths` is provided it will _only_ return an object made from the provided `paths`.

This function is used to create safe and controlled subsets of your config that then you can send to different parts of your system. Primarily for web development, where you would only want to send a select handful of configs client-side.







### Isomorphic Configs

With server-side rendering

```js
{
  client_safe : {
    save_timeout : 500,
    tracking_code : 'abc123'
  },
  user : {
    pwd : {
      salt : 'SECRET',
      min_length : 6
      max_length : 10000
    }
  },
  aws : {
    s3_bucket_key : 'ALSO_SECRET'
  }
}


```


```js

window.clientsafe_configs = config.json(
  'client_safe',
  'user.pwd.min_length',
  'user.pwd.max_length'
);




let config = require('pico-conf');

if(typeof window !== 'undefined'){ //is client side

  config = config.add(window.clientsafe_configs)


}else{
  config = config
    .file('./defaults.js')
    .file('./production.js')
    .env()
}

module.exports =
```









------------------------


*Features*
- No dependacies
- Under 80 lines
- Agnostic to storage method; Just takes JS objects
- Can be transpiled to work on the browser
- Customizable separators for both getting and storing per source
- always forces lowercase tp prevent casing issues


## API
Each function will return the instance of the library to allow chaining.

### opts
You can pass the following options:
- `sep` - a custom separator pattern to be used for just that source. Useful for parsing values from environment with limited character sets. *default: `/:|\.|__/`*, macthes on `:`, `.` or `__`
- `lowercase` - a boolean to set if you would like all the keys from the source to be lowercase. *default: `false`*



### setting

#### `.add(configObj, [opts])`
Parses the `configObj` and adds it into `pico-conf`s memory. It will not overwrite existing values, use `.override()` or `.defaults()` to control precendence order.
```js
config.add({ alpha: 0.8, test : 6 })
  .add({ alpha: false, 'yo-yo' : true }, {sep : '-'});

config.get('alpha'); // 0.8
config.get('yo:yo'); // true
```

#### `.file(configFilePath, [opts])`
Tries to `require` a config file located at `configFilePath` and then `.add()` it. Fails gracefully if it can't find it. Pass `opts.silent=true` to hide any console error messages.
```js
config.file('../package.json');

config.get('name'); // 'pico-conf'
```

#### `.env([opts])`
Parses the environment variables and adds it into `pico-conf`s memory using `.add()`.
```js
config.env({lowercase : true});
config.get('node_env');
```

#### `.argv([opts])`
Parses the commandline args and adds it into `pico-conf`s memory using `.add()`. It only uses arguments that use the assignment operator, eg. `auth=true`.
```js
config.argv();
config.get(auth);
```

#### `.defaults(configObj, [opts])`
Parses the `configObj` and adds it into `pico-conf`s defaults memory using `.add()`, which will be looked up last when using `.get()`.
```js
config.defaults({a : 1, b : 5})
  .add({a : 6});

config.get('a'); // 6
config.get('b'); // 5
```

#### `.overrides(configObj, [opts])`
Parses the `configObj` and adds it into `pico-conf`s overrides memory using `.add()`, which will be looked up first when using `.get()`.

#### `.clear()`
Completely clears out all configs set, including `overrides` and `defaults`.

#### `.lock()`
Locks down all value within the config so they can not be further added to or overwritten. Recurisvely calls [Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) on the internal config structure. Will throw proper errors if using `strict mode`.

```js
const config = require('pico-check')
  .add({ test : { a : 6 }})
  .lock();

const val = config.get('test');
val = { a : 8 }; //Will throw
```


### getting

#### `.get(configPath, [allowEmpty])`
Separates the `configPath` and looks up the corresponding value in the override, then config, then default memory. Uses the separator set by using `.sep()`.

#### `.has(configPath)`
Returns either `true` or `false` depending on whether the config value has been set or not.

By default if the `configPath` is not set this will throw an error. You can turn off this behaviour by passing `true` as the second parameter. eg. `config.get('not:set', true)`

#### `.sep(separatorPattern)`
Sets the separator pattern used for `.get()`. Defaults to the regex to match on `:`, `.`, or `__`. If you pass nothing it will reset back to the default.

#### `.required(configPaths)`
Takes an array of config paths and ensures that they are set. If not it will throw an error listing which config paths are not set.

```js
try{
  config.add({a : true})
    .required(['a', 'b', 'c'])
}catch(err){
  console.log(err); //Config values: b, c are missing and are expected to be set.
}
```

### client-side
Exposing client-side configs safely can be difficult. `pico-conf` comes with utilities for opt-ing in which configs should be exposed client-side.

#### `.client(path) / .client([paths])`
Flags the `path` or array of `paths` to be allowed to be exposed client-side.

#### `.getClientObj()`
Returns an object with all the client-side paths `.get()`;

#### `.generateClientScript()`
Returns a string of the js-code of `.getClientObj()` JSON-stringified and set to `.clientVar`. When generating your HTML to send client-side, call this function in a `<script>` tag in the `<head>`. This will store and expose your client-side configs globally.


#### `.loadClientScript()`
Attempts to load any config data stored at `.clientVar` into `pico-conf` using `.add()`. It will look at either `window` or `global` to try and find the config. This function is called whenever `pico-conf` is loaded, so if client data has already been populated in the global scope, it will be implictly added.



## Best practices

### Use `.js` or `.yaml` for configs

`json` is not a great format for configuration. Configs usually come in two varieties:

```js
const yaml = requrie('require-yml');

const config = require('pico-config')
  .add(yaml('./config/user-settings.yaml'))
  .add()

```
