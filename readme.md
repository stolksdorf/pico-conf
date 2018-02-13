# pico-conf
A tiny config manager for javascript. Inspired by [nconf](https://www.npmjs.com/package/nconf).

[![NPM](https://nodei.co/npm/pico-conf.png)](https://nodei.co/npm/pico-conf/)

```js
const config = require('pico-conf')
  .argv()
  .env({lowercase:true})
  .add(require(`./config/${process.env.NODE_ENV}.js`))
  .defaults(require('./config/defaults.json'));

config.get('auth:token');
```


*Features*
- No dependacies
- Under 80 lines
- Agnostic to storage method; Just takes JS objects
- Can be transpiled to work on the browser
- Has overrides and default layers
- Will consider falsey (but not `false`) values to be "not set" for purposes of overwriting and require checks.
- Customizable separators for both getting and storing per source

*Anti-features*
- No mutation of existing configs (just overwriting)
- Can not remove configs once added
- Does not read in from the file system. You must provide the JS objects.



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



### getting

#### `.get(configPath)`
Separates the `configPath` and looks up the corresponding value in the override, then config, then default memory. Uses the separator set by using `.sep()`.

#### `.sep(separatorPattern)`
Sets the separator pattern used for `.get()`. Defaults to the regex to match on `:`, `.`, or `__`.

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




## Best practices

### Use `.js` or `.yaml` for configs

`json` is not a great format for configuration. Configs usually come in two varieties:

```js
const yaml = requrie('require-yml');

const config = require('pico-config')
  .add(yaml('./config/user-settings.yaml'))
  .add()

```