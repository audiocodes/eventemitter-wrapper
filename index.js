
exports.createWrapper = (eventEmitterInstance)=>{
	var wrappedEvents = Object.create(wrapperProto);
	wrappedEvents._eventStore = {};
	wrappedEvents._eventEmitterInstance = eventEmitterInstance;
	eventEmitterInstance.on('removeListener',(eventName,listener)=>{
		if(eventName in wrappedEvents._eventStore){
			var pos = wrappedEvents._eventStore[eventName].indexOf(listener);
			if(pos!==-1) wrappedEvents._eventStore[eventName].splice(pos,1);
			if(wrappedEvents._eventStore[eventName].length===0) delete wrappedEvents._eventStore[eventName];
		}
	});
	return wrappedEvents;
};

var wrapperProto = {
	addListener: function(a,b){
		return this.on(a,b);
	},
	on: function(eventName,listener){
		if(!(eventName in this._eventStore)) this._eventStore[eventName] = [];
		this._eventStore[eventName].push(listener);
		this._eventEmitterInstance.on(eventName,listener);
		return this;
	},
	once: function(eventName,listener){
		var listener2 = (...args)=>{
			if(eventName in this._eventStore) this._eventStore[eventName].splice(this._eventStore[eventName].indexOf(listener2),1);
			return listener(...args);
		};
		if(!(eventName in this._eventStore)) this._eventStore[eventName] = [];
		this._eventStore[eventName].push(listener2);
		this._eventEmitterInstance.once(eventName,listener2);
		return this;
	},
	listeners: function(eventName){
		if(eventName in this._eventStore) return this._eventStore[eventName];
		else return [];
	},
	listenerCount: function(eventName){
		return this.listeners(eventName).length;
	},
	eventNames: function(){
		return Object.keys(this._eventStore);
	},
	emit: function(eventName,...args){
		return this._eventEmitterInstance.emit(eventName,...args);
	},
	prependListener: function(eventName,listener){
		if(!(eventName in this._eventStore)) this._eventStore[eventName] = [];
		this._eventStore[eventName].unshift(listener);
		this._eventEmitterInstance.prependListener(eventName,listener);
		return this;
	},
	prependOnceListener: function(eventName,listener){
		var listener2 = (...args)=>{
			if(eventName in this._eventStore) this._eventStore[eventName].splice(this._eventStore[eventName].indexOf(listener2),1);
			return listener(...args);
		};
		if(!(eventName in this._eventStore)) this._eventStore[eventName] = [];
		this._eventStore[eventName].unshift(listener2);
		this._eventEmitterInstance.prependOnceListener(eventName,listener2);
		return this;
	},
	removeAllListeners: function(eventName){
		if(eventName===void 0){
			for(var name in this._eventStore){
				this.removeAllListeners(name);
			}
		} else if(eventName in this._eventStore){
			for(var i=0,l=this._eventStore[eventName].length; i<l; i++){
				this.removeListener(eventName,this._eventStore[eventName][i]);
			}
		}
		return this;
	},
	removeListener: function(eventName,listener){
		// Removal from this._eventStore is done on the 'removeListener' event
		this._eventEmitterInstance.removeListener(eventName,listener);
		return this;
	}
};
