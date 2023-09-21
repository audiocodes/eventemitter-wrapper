# eventemitter-wrapper - Nodejs Module
> Control event groups

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]
[![Tests][github-tests-badge]][github-tests-url]

## What is this?

This module lets you group event listeners so you can seperate/isolate listeners from other listeners, such that you can call `removeAllListeners` and it will only remove the listeners on the current event wrapper. No need to keep track of specific groups of listeners when this can do it for you.

## Why use this?

If you have an `EventEmitter` which has important event listeners on it, and you have a module that you want others to use without them removing those said event listeners by mistake, then this will let you protect them by exporting the wrapped `EventEmitter` instead of the main one.

Or, in the case of why I needed this module, I have portions of my applications as reloadable, and each time some code unloads, I have the events on a wrapper that I simply remove the listeners from without effecting other parts of my application.

## Installation

**Install via NPM:** with the [NPM package][npm-url]
```
npm install eventemitter-wrapper
```

**Install via NPM from Github:** with a [GitHub Tag][github-tags] to specify version (specifed as #hash)
```
npm install jashepp/eventemitter-wrapper#v2.0.1
```

Or [download the latest release][github-releases], or [use github packages](https://github.com/Jashepp/eventemitter-wrapper/pkgs/npm/eventemitter-wrapper), or git clone the [repository on GitHub][github-url].

This module is written with ES6 features.

## How To Use / API

This module is available as both CommonJS and ES Module. The ES Module calls the CommonJS file under the hood.

Require or import the module, wrap an existing `EventEmitter` instance, and use methods as you usually would.

This should behave like the [original EventEmitter](https://nodejs.org/api/events.html), with the same methods and functionality, since it wraps it and uses it under the hood.

CommonJS Method:

```javascript
const EventEmitter = require('node:events');
const EventEmitterWrapper = require('eventemitter-wrapper');

const events = new EventEmitter();
const eventsWrapped = new EventEmitterWrapper(events);
// ...
```

ES Module Method:

```javascript
import { EventEmitter } from 'node:events';
import { EventEmitterWrapper } from 'eventemitter-wrapper';

const events = new EventEmitter();
const eventsWrapped = new EventEmitterWrapper(events);
// ...
```

The passed argument for `EventEmitterWrapper` can be any object that is an EventEmitter directly or prototyped.

The old `v1.0` method of creating the wrapped EventEmitter is still available:

```javascript
const eventsWrapped = EventEmitterWrapper.createWrapper(events);
```

### Methods & Properties

API for the wrapped instance created via `new EventEmitterWrapper(events);`

Only `eventEmitter` is new, along with unlisted internal methods & properties.

| Method / Property | Type | Notes |
|-|-|-|
| `eventEmitter` | prop | Original `EventEmitter` |
| [`addListener(eventName,listener)`](https://nodejs.org/api/events.html#emitteraddlistenereventname-listener) | method | Listens on `original` & `wrapped` |
| [`on(eventName,listener)`](https://nodejs.org/api/events.html#emitteroneventname-listener) | method | Listens on `original` & `wrapped` |
| [`once(eventName,listener)`](https://nodejs.org/api/events.html#emitteronceeventname-listener) | method | Listens on `original` & `wrapped` |
| [`prependListener(eventName,listener)`](https://nodejs.org/api/events.html#emitterprependlistenereventname-listener) | method | Listens on `original` & `wrapped` |
| [`prependOnceListener(eventName,listener)`](https://nodejs.org/api/events.html#emitterprependoncelistenereventname-listener) | method | Listens on `original` & `wrapped` |
| [`rawListeners(eventName)`](https://nodejs.org/api/events.html#emitterrawlistenerseventname) | method | Lists only `wrapped` listeners |
| [`listeners(eventName)`](https://nodejs.org/api/events.html#emitterlistenerseventname) | method | Lists only `wrapped` listeners |
| [`listenerCount(eventName[,listener])`](https://nodejs.org/api/events.html#emitterlistenercounteventname-listener) | method | Counts only `wrapped` listeners |
| [`eventNames()`](https://nodejs.org/api/events.html#emittereventnames) | method | Lists only `wrapped` listeners |
| [`emit(eventName[,...args])`](https://nodejs.org/api/events.html#emitteremiteventname-args) | method | Directly calls `original` method |
| [`removeAllListeners([eventName])`](https://nodejs.org/api/events.html#emitterremovealllistenerseventname) | method | Removes only `wrapped` listeners |
| [`removeListener(eventName,listener)`](https://nodejs.org/api/events.html#emitterremovelistenereventname-listener) | method | Removes on both `original` & `wrapped` |
| [`off(eventName,listener)`](https://nodejs.org/api/events.html#emitteroffeventname-listener) | method | Removes on both `original` & `wrapped` |
| [`getMaxListeners()`](https://nodejs.org/api/events.html#emittergetmaxlisteners) | method | Directly calls `original` method |
| [`setMaxListeners(n)`](https://nodejs.org/api/events.html#emittersetmaxlistenersn) | method | Directly calls `original` method |

When the wrapper has events listening on the original EventEmitter, a `removeListener` event will be internally listened on for clean-up after an event is removed.

On this wrapper, there are internal methods & properties prefixed with '`_eew`'. These are available (see source code) to use, but they may change in future releases.

### Examples

```javascript
// Require modules
const EventEmitter = require('node:events');
const EventEmitterWrapper = require('eventemitter-wrapper');

// Create instances
const events = new EventEmitter();
const eventsWrapped = new EventEmitterWrapper(events);

// Attach a listener to original EventEmitter
events.on('original',(...args)=>{
	console.log('original:',...args);
});

// Fire event on either original or wrapped
events.emit('original','foo');
// Logs: original: foo

// Attach a listener to wrapped EventEmitter
eventsWrapped.on('wrapped',(...args)=>{
	console.log('wrapped:',...args);
});

// Fire event on either original or wrapped
events.emit('wrapped','bar');
// Logs: wrapped: bar

// Fetch a list of events on the original
// "removeListener" event is used by the wrapper for event clean-up
console.log(events.eventNames());
// Logs: [ 'original', 'wrapped', 'removeListener' ]

// Fetch a list of events on the wrapper
console.log(eventsWrapped.eventNames());
// Logs: [ 'wrapped' ]

// Remove all listeners on the wrapper
eventsWrapped.removeAllListeners();

// Fetch a list of events on the original
console.log(events.eventNames());
// Logs: [ 'original' ]

// Fetch a list of events on the wrapper
console.log(eventsWrapped.eventNames());
// Logs: []
```

## Tests

Tests are located within `./tests/` on the git [repository on GitHub][github-url] or locally if pulled. NPM version does **not** include tests.

To get started with tests, we need to install some dev dependencies. Enter local directory of this repository and run:
```
npm install --only=dev
```

To run the tests, run:
```
npm run test
```

To continuously run tests while editing, run:
```
npm run test-watch
```

## Contributors

To submit a contribution, create issues or pull requests on the [GitHub repository][github-url].

Please be sure to run tests after any changes.

All help is appreciated. Even if it's just improvements to this readme or the tests.

## License

MIT License

Copyright (c) 2023 Jason Sheppard @ https://github.com/Jashepp

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Links

Github Repository: [https://github.com/Jashepp/eventemitter-wrapper](https://github.com/Jashepp/eventemitter-wrapper)

NPM Package: [https://www.npmjs.com/package/eventemitter-wrapper](https://www.npmjs.com/package/eventemitter-wrapper)

[npm-image]: https://img.shields.io/npm/v/eventemitter-wrapper.svg?style=flat-square
[npm-url]: https://npmjs.org/package/eventemitter-wrapper
[npm-downloads]: https://img.shields.io/npm/dm/eventemitter-wrapper.svg?style=flat-square
[github-url]: https://github.com/Jashepp/eventemitter-wrapper
[github-releases]: https://github.com/Jashepp/eventemitter-wrapper/releases
[github-tags]: https://github.com/Jashepp/eventemitter-wrapper/tags
[github-tests-badge]: https://github.com/Jashepp/eventemitter-wrapper/actions/workflows/run-tests.yml/badge.svg
[github-tests-url]: https://github.com/Jashepp/eventemitter-wrapper/actions/workflows/run-tests.yml
