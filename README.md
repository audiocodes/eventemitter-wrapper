# eventemitter-wrapper - Nodejs Module
> Control event groups

[![NPM Version][npm-image]][npm-url]
[![Downloads Stats][npm-downloads]][npm-url]
[![Tests][github-tests-badge]][github-tests-url]

## What is this?

This module lets you group event listeners so you can seperate/isolate listeners from other listeners, such that you can call `removeAllListeners` and it will only remove the listeners on the current event wrapper. No need to keep track of specific groups of listeners when this can do it for you.

## Why use this?

If you have an EventEmitter which has important event listeners on it, and you have a module that you want others to use without them removing those said event listeners by mistake, then this will let you protect them by exporting the wrapped EventEmitter instead of the main one.

Or, in the case of why I needed this module, I have portions of my applications as reloadable, and each time some code unloads, I have the events on a wrapper that I simply remove the listeners from without effecting other parts of my application.

## Installation

Install the module via [NPM](https://www.npmjs.com/package/eventemitter-wrapper)
```
npm install eventemitter-wrapper --save
```
Or [download the latest release](https://github.com/Jashepp/eventemitter-wrapper/releases), or git clone the [repository on GitHub](https://github.com/Jashepp/eventemitter-wrapper).

This module is written with ES6 features.

### How to use

Require the module, wrap an existing eventEmitter instance, and use methods as you usually would.

```javascript
const eventEmitter = require('events');
const eventEmitterWrapper = require('eventemitter-wrapper');

const events = new eventEmitter();
const eventGroup1 = eventEmitterWrapper.createWrapper(events);
const eventGroup2 = eventEmitterWrapper.createWrapper(events);
...
```

The first argument for `createWrapper`, can be any object that is an EventEmitter directly or prototyped.

The methods are meant to be identical to [Node.js's EventEmitter](https://nodejs.org/api/events.html) (minus deprecated features).

Methods on the wrapper: `addListener`, `on`, `once`, `listeners`, `listenerCount`, `eventNames`, `emit`, `prependListener`, `prependOnceListener`, `removeAllListeners`, `removeListener`

Internal properties: `_eventStore` (object key store of events and listeners), `_eventEmitterInstance` (the main EventEmitter)

## Example

```javascript
// Require modules
const eventEmitter = require('events');
const eventEmitterWrapper = require('eventemitter-wrapper');

// Create EventEmitter instance
const events = new eventEmitter();

// Attach a listener to `events`
events.on('logSomething',(...args)=>{
	console.log('events:',...args);
});

// Create a wrapped events instance
const eventGroup1 = eventEmitterWrapper.createWrapper(events);

// All events on the main EventEmitter are still emittable
// Any wrapper or the main EventEmitter can call .emit to run any listener
eventGroup1.emit('logSomething','Hello','World!');
// Logs: events: Hello World!

// Any event listener can be created, even if there are other listeners on the main EventEmitter or on other wrappers.
eventGroup1.on('logSomething',()=>{
	console.log('eventGroup1: No, I have joined the dark side');
});
eventGroup1.on('dance',()=>{
	console.log('eventGroup1: Okay');
});

// Emit again (same with eventGroup1.emit...)
events.emit('logSomething','Foo Bar');
// Logs: events: Foo Bar!
// Logs: eventGroup1: No, I have joined the dark side

// Emit again (same with eventGroup1.emit...)
// The emit method falls directly to the main EventEmitter, so it will also work across all wrappers
events.emit('dance');
// Logs: eventGroup1: Okay

// Fetch a list of event names on the main EventEmitter
// Notice that the main EventEmitter contains all listeners, including those on a wrapper
// The "removeListener" event is attached internally via a wrapper
console.log(events.eventNames())
// Logs: ["logSomething", "removeListener", "dance"]

// Fetch a list of event names on the wrapper
// Notice that the wrapper ignores all listeners outside this wrapper
console.log(eventGroup1.eventNames())
// Logs: ["logSomething", "dance"]

// Remove all listeners on the wrapper
eventGroup1.removeAllListeners()

// List event names on the main EventEmitter
// Notice that "dance" has been removed, also the "logSomething" event now only has 1 listener instead of 2
console.log(events.eventNames())
// Logs: ["logSomething", "removeListener"]

// List event names on the wrapper
// All events attached via the wrapper have been removed
console.log(eventGroup1.eventNames())
// Logs: []

```

## Tests

Tests are located within `./tests/` on the git [repository on GitHub][github-branch] or locally if pulled. NPM version does **not** include tests.

To get started with tests, enter local directory of this repository and run:
```
npm install --only=dev
```

To run the tests, run:
```
npm run test
```

To continuously run tests while editing, run:
```
npm run watch:test
```

## Contributors

Create issues on the GitHub project or create pull requests.

All the help is appreciated.

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
[github-branch]: https://github.com/Jashepp/eventemitter-wrapper
[github-tests-badge]: https://github.com/Jashepp/eventemitter-wrapper/actions/workflows/run-tests.yml/badge.svg
[github-tests-url]: https://github.com/Jashepp/eventemitter-wrapper/actions/workflows/run-tests.yml
