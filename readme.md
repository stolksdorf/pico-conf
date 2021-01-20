# 🎛️ pico-conf
A tiny config manager for javascript. Inspired by [nconf](https://www.npmjs.com/package/nconf).

[![NPM](https://nodei.co/npm/pico-conf.png)](https://nodei.co/npm/pico-conf/)


*Features*
- No dependacies
- Under 60 lines of easy-to-follow code
- Utils for reading in commandline arguments, environment variables, and requiring in files
- Fallbacks when it can't find values you are looking for
- Agnostic to storage method; Just takes JS objects
- Can be transpiled to work on the browser
- Always forces lowercase tp prevent casing issues



```js
const config = require('pico-conf')
  .set({
    auth : {
      type : 'basic'
      token : 'defaultdefaultdefault'
    }
  })
  .env()
  .file('./local.js', {})
  .argv();

config.get('auth:token');
```


```js
const config = require('pico-conf')
  .set({ // Set up some basic defaults
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

config.get('some_setting'); // true

config.get('also__nesting.IS:supported'); // nesting is supported through ':', '.', or '__'

config.get('I__dont.exist', [1,2,3,4]) // Provides fallback

config.get('important__value', ()=>{ // Fallbacks can be functions too
  console.warn('⚠ You should really set this up before doing anything serious ⚠')
  return 'foo'
})

```


## Install

I suggest just coping and pasting the `pico-conf.js` file into your project. It's a single 60 line file with no dependacies, so you can review and easily modify the source as you see fit.

However it is hosted on npm if that tickles your fancy: `npm install pico-conf`



## API

#### `.get(path, [fallback])`
Lowercases and splits the path, then searches through the `.cache` to find the config value and return it. If it can not find it, it runs/returns the `fallback` instead. The `fallback` defaults to throwing an error.


#### `.set(obj)`
Parses and adds the `obj` to the `.cache` and returns the `pico-conf` instance. Recursively loops through the object and merges it with whatever was within the existing instance. Lowercases all keys, and overwrites any value with the same path.

```js
config.set({ alpha: 0.25, test : 6 })
  .set({ alpha: 0.8, 'yo__yo' : true });

config.get('alpha'); // 0.8
config.get('yo:yo'); // true
```


#### `.file(path_to_file, [fallback = throws])`
Attempts to `require()` the provided `path_to_file` and uses `.set()` to update and returns the `pico-conf` instance. Uses the caller's file location for relative file paths.

If it can't find the file, or they was any issue with reading the file, it will call and use the `fallback` instead. If `fallback` is a value, that will be added, if it's a function, it will be called first and it's returned value will be used. this is useful if you'd like to print helpful warning or error messages if your system was expecting a config to be loaded.

`fallback` defaults to throwing an error.

```js
config.file('../package.json');

config.get('name'); // 'pico-conf'
```


#### `.env()`
Loops through and parses then adds each environment variable to the `.cache`. Lowercases keys and splits into sub-objects based on the separator. Returns the `pico-conf` instance to allow for chaining.

```js
config.env();
config.get('node_env');
```


#### `.argv()`
Reads in the commandline arguments and splits them by `=`. Parses and adds each one to the `.cache`. If no `=` value was set, it's defaulted to `true`. Returns the `pico-conf` instance to allow for chaining.

```js
// node test.js --auth --foo__bar=6

config.argv();
config.get('foo.bar'); //6
config.get('auth'); //true
```


