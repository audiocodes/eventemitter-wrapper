"use strict";

const EventEmitter = require('node:events');

class EventEmitterWrapper {

	constructor(eventEmitter){
		if(!(eventEmitter instanceof EventEmitter)) throw new TypeError('eventEmitter must be an instance of EventEmitter');
		this._eewEventStore = new Map();
		this._eewEmitter = eventEmitter;
		this._eewRemoveListenerAttached = false;
		this._eewOnceAlias = new WeakMap();
		this._eewRemoveListenerBound = this._eewRemoveListener.bind(this);
	}

	_eewRemoveListener(eventName,listener){
		if(!(typeof eventName==='string' || eventName instanceof String)) throw new TypeError('eventName must be a string');
		if(!(listener instanceof Function)) throw new TypeError('listener must be a function');
		if(this._eewEventStore.has(eventName)){
			let listenStore = this._eewEventStore.get(eventName);
			if(listenStore.has(listener)){
				let count = listenStore.get(listener);
				if(count>1) listenStore.set(listener,count-1);
				else listenStore.delete(listener);
			}
			if('listener' in listener && this._eewOnceAlias.get(listener.listener)===listener){
				this._eewOnceAlias.delete(listener.listener);
			}
			this._eewRemoveListenerCheck();
		}
	}

	_eewRemoveListenerCheck(){
		let hasEvents = false;
		for(let listenStore of this._eewEventStore.values()){
			if(listenStore.size>0){ hasEvents = true; break; }
		}
		if(this._eewRemoveListenerAttached && !hasEvents){
			this._eewEmitter.removeListener('removeListener',this._eewRemoveListenerBound);
			this._eewRemoveListenerAttached = false;
		}
		else if(!this._eewRemoveListenerAttached && hasEvents){
			this._eewEmitter.on('removeListener',this._eewRemoveListenerBound);
			this._eewRemoveListenerAttached = true;
		}
		for(let [eventName,listenStore] of this._eewEventStore){
			if(listenStore.size===0) this._eewEventStore.delete(eventName);
		}
	}

	_eewListenEventMethod(method,eventName,listener){
		if(!(method in this._eewEmitter)) throw new TypeError('method must be a function on eventEmitter');
		if(!(typeof eventName==='string' || eventName instanceof String)) throw new TypeError('eventName must be a string');
		if(!(listener instanceof Function)) throw new TypeError('listener must be a function');
		let listenStore = this._eewEventStore.get(eventName);
		if(!listenStore) this._eewEventStore.set(eventName,listenStore = new Map());
		listenStore.set(listener,(listenStore.get(listener)||0)+1);
		this._eewEmitter[method](eventName,listener);
		this._eewRemoveListenerCheck();
	}

	_eewOnce(method,eventName,listener){
		if(!(method in this._eewEmitter)) throw new TypeError('method must be a function on eventEmitter');
		if(!(typeof eventName==='string' || eventName instanceof String)) throw new TypeError('eventName must be a string');
		if(!(listener instanceof Function)) throw new TypeError('listener must be a function');
		let onceWrapper = (...args)=>{
			this._eewRemoveListener(eventName,onceWrapper);
			return listener(...args);
		};
		onceWrapper.listener = listener;
		this._eewOnceAlias.set(listener,onceWrapper);
		this._eewListenEventMethod(method,eventName,onceWrapper);
	}

	get eventEmitter(){
		return this._eewEmitter;
	}

	addListener(eventName,listener){
		this._eewListenEventMethod('addListener',eventName,listener);
		return this;
	}

	on(eventName,listener){
		return this.addListener(eventName,listener);
	}

	once(eventName,listener){
		this._eewOnce('once',eventName,listener);
		return this;
	}

	rawListeners(eventName){
		if(this._eewEventStore.has(eventName)) return [...this._eewEventStore.get(eventName).keys()];
		return [];
	}

	listeners(eventName){
		return this.rawListeners(eventName).map((listener)=>{
			if('listener' in listener && this._eewOnceAlias.get(listener.listener)===listener) return listener.listener;
			return listener;
		});
	}

	listenerCount(eventName,listener){
		if(listener && this._eewEventStore.has(eventName)) return this._eewEventStore.get(eventName).get(listener);
		if(this._eewEventStore.has(eventName)) return this._eewEventStore.get(eventName).size;
		return 0;
	}
	
	eventNames(){
		return [...this._eewEventStore.keys()];
	}

	emit(eventName,...args){
		return this._eewEmitter.emit(eventName,...args);
	}

	prependListener(eventName,listener){
		this._eewListenEventMethod('prependListener',eventName,listener);
		return this;
	}

	prependOnceListener(eventName,listener){
		this._eewOnce('prependOnceListener',eventName,listener);
		return this;
	}

	removeAllListeners(eventName){
		if(eventName===void 0){
			for(let eventName of this._eewEventStore.keys()){
				this.removeAllListeners(eventName);
			}
		}
		else if(this._eewEventStore.has(eventName)){
			for(let listener of this._eewEventStore.get(eventName).keys()){
				this.removeListener(eventName,listener);
			}
		}
		return this;
	}

	removeListener(eventName,listener){
		if(listener && this._eewOnceAlias.has(listener)) listener = this._eewOnceAlias.get(listener);
		if(listener) this._eewEmitter.removeListener(eventName,listener);
		return this;
	}

	off(eventName,listener){
		return this.removeListener(eventName,listener);
	}

	getMaxListeners(){ return this._eewEmitter.getMaxListeners(); }

	setMaxListeners(n){ return this._eewEmitter.setMaxListeners(n); }

}

module.exports = EventEmitterWrapper;

module.exports.EventEmitterWrapper = EventEmitterWrapper;

module.exports.createWrapper = (eventEmitter)=>new EventEmitterWrapper(eventEmitter);
