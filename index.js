
exports.createWrapper = (eventEmitterInstance)=>{
	var wrappedEvents = Object.create(wrapperProto);
	wrappedEvents._eventStore = new Map();
	wrappedEvents._eventEmitterInstance = eventEmitterInstance;
	wrappedEvents._eventRemoveListener = (eventName,listener)=>{
		if(wrappedEvents._eventStore.has(eventName)){
			if(wrappedEvents._eventStore.size===0) wrappedEvents._eventStore.delete(eventName);
		}
	};
	wrappedEvents._eventRemoveListenerAttached = false;
	wrappedEvents._eventOnceAlias = new WeakMap();
	return wrappedEvents;
};

var wrapperProto = {
	_eventRemoveListenerCheck: function(){
		var hasEvents = false;
		for(let [eventName,set] of this._eventStore){
			if(set.size>0){ hasEvents = true; break; }
		}
		if(this._eventRemoveListenerAttached && !hasEvents){
			this._eventEmitterInstance.removeListener('removeListener',this._eventRemoveListener);
			this._eventRemoveListenerAttached = false;
		}
		else if(!this._eventRemoveListenerAttached && hasEvents){
			this._eventEmitterInstance.on('removeListener',this._eventRemoveListener);
			this._eventRemoveListenerAttached = true;
		}
		for(let [eventName,set] of this._eventStore){
			if(set.size===0) this._eventStore.delete(eventName);
		}
	},
	addListener: function(a,b){
		return this.on(a,b);
	},
	on: function(eventName,listener){
		if(!this._eventStore.has(eventName)) this._eventStore.set(eventName,new Set());
		this._eventStore.get(eventName).add(listener);
		this._eventEmitterInstance.on(eventName,listener);
		this._eventRemoveListenerCheck();
		return this;
	},
	once: function(eventName,listener){
		var listener2 = (...args)=>{
			if(this._eventStore.has(eventName)) this._eventStore.get(eventName).delete(listener2);
			return listener(...args);
		};
		this._eventOnceAlias.set(listener,listener2);
		if(!this._eventStore.has(eventName)) this._eventStore.set(eventName,new Set());
		this._eventStore.get(eventName).add(listener2);
		this._eventEmitterInstance.once(eventName,listener2);
		this._eventRemoveListenerCheck();
		return this;
	},
	listeners: function(eventName){
		if(this._eventStore.has(eventName)) return this._eventStore.get(eventName).values();
		else return [];
	},
	listenerCount: function(eventName){
		return this.listeners(eventName).length;
	},
	eventNames: function(){
		return this._eventStore.keys();
	},
	emit: function(eventName,...args){
		return this._eventEmitterInstance.emit(eventName,...args);
	},
	prependListener: function(eventName,listener){
		if(!this._eventStore.has(eventName)) this._eventStore.set(eventName,new Set());
		this._eventStore.get(eventName).add(listener);
		this._eventEmitterInstance.prependListener(eventName,listener);
		this._eventRemoveListenerCheck();
		return this;
	},
	prependOnceListener: function(eventName,listener){
		var listener2 = (...args)=>{
			if(this._eventStore.has(eventName)) this._eventStore.get(eventName).delete(listener2);
			return listener(...args);
		};
		this._eventOnceAlias.set(listener,listener2);
		if(!this._eventStore.has(eventName)) this._eventStore.set(eventName,new Set());
		this._eventStore.get(eventName).add(listener2);
		this._eventEmitterInstance.prependOnceListener(eventName,listener2);
		this._eventRemoveListenerCheck();
		return this;
	},
	removeAllListeners: function(eventName){
		if(eventName===void 0){
			for(let [eventName,set] of this._eventStore){
				this.removeAllListeners(eventName);
			}
		} else if(this._eventStore.has(eventName)){
			let set = this._eventStore.get(eventName);
			for(let listener of set){
				this.removeListener(eventName,listener);
			}
		}
		this._eventRemoveListenerCheck();
		return this;
	},
	removeListener: function(eventName,listener){
		// Removal from this._eventStore is done on the 'removeListener' event
		if(listener){
			this._eventEmitterInstance.removeListener(eventName,listener);
			if(this._eventOnceAlias.has(listener)){
				this._eventEmitterInstance.removeListener(eventName,this._eventOnceAlias.get(listener));
				this._eventOnceAlias.delete(listener);
			}
		}
		this._eventRemoveListenerCheck();
		return this;
	},
	setMaxListeners: function(n){ return this._eventEmitterInstance.setMaxListeners(n); }
};
