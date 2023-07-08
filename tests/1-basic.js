"use strict";

// https://mochajs.org/

const _ = require("underscore");
const chai = require("chai");
const { expect, assert, should } = chai;

const EventEmitter = require('node:events');
const EventEmitterWrapper = require('../');

describe("Misc Features",async ()=>{

	describe("Construction",async ()=>{

		it("new EventEmitterWrapper(eventEmitter)",async function(){
			let events = new EventEmitter();
			let wrapper = new EventEmitterWrapper(events);
			expect(wrapper).to.have.property('addListener');
			expect(wrapper).to.have.property('removeListener');
			events.removeAllListeners(); wrapper.removeAllListeners();
		});
	
		it("new EventEmitterWrapper.EventEmitterWrapper(eventEmitter)",async function(){
			let events = new EventEmitter();
			let wrapper = new EventEmitterWrapper.EventEmitterWrapper(events);
			expect(wrapper).to.have.property('addListener');
			expect(wrapper).to.have.property('removeListener');
			events.removeAllListeners(); wrapper.removeAllListeners();
		});
	
		it("EventEmitterWrapper.createWrapper(eventEmitter)",async function(){
			let events = new EventEmitter();
			let wrapper = EventEmitterWrapper.createWrapper(events);
			expect(wrapper).to.have.property('addListener');
			expect(wrapper).to.have.property('removeListener');
			events.removeAllListeners(); wrapper.removeAllListeners();
		});

		it("Accept instanceof eventEmitter",async function(){
			let events = new (class extendedEventEmitter extends EventEmitter {});
			let wrapper = new EventEmitterWrapper(events);
			expect(wrapper).to.have.property('addListener');
			expect(wrapper).to.have.property('removeListener');
			events.removeAllListeners(); wrapper.removeAllListeners();
		});
	
		it("Error on other objects",async function(){
			let wrapper;
			try{
				wrapper = new EventEmitterWrapper(new (class {}));
			}catch(err){
				expect(wrapper).to.be.undefined;
				expect(err).to.be.an('error');
				expect(err.message).to.equal("eventEmitter must be an instance of EventEmitter");
			}
			expect(wrapper).to.be.undefined;
		});
	
		it("Error on no eventEmitter argument",async function(){
			let wrapper;
			try{
				wrapper = new EventEmitterWrapper();
			}catch(err){
				expect(wrapper).to.be.undefined;
				expect(err).to.be.an('error');
				expect(err.message).to.equal("eventEmitter must be an instance of EventEmitter");
			}
			expect(wrapper).to.be.undefined;
		});
	
	});
	
	describe("Other",async ()=>{

		it("wrapper.eventEmitter equals original EventEmitter instance",async function(){
			let events = new EventEmitter(), wrapper = new EventEmitterWrapper(events);
			expect(wrapper).to.have.property('eventEmitter');
			expect(wrapper['eventEmitter']).to.equal(events);
			events.removeAllListeners(); wrapper.removeAllListeners();
		});
	
	});

});

describe("EventEmitter Compatability - Quick Checks",async ()=>{
	let events = null, wrapper = null;

	beforeEach("Setup events & wrapper",async function(){
		events = new EventEmitter();
		wrapper = new EventEmitterWrapper(events);
	});

	afterEach("Cleanup events & wrapper",function(){
		if(events && events.removeAllListeners) events.removeAllListeners();
		if(wrapper && wrapper.removeAllListeners) wrapper.removeAllListeners();
	});

	it("EventEmitter methods exist on wrapper",async function(){
		// this.slow(1000); this.timeout(500); this.skip();
		let methods = [], obj = events;
		while(obj && obj.constructor!==Object){
			methods = [
				...methods,
				...Object.entries(obj).filter(([k,v])=>_.isFunction(v)).map(([k,v])=>k),
				...Object.entries(Object.getOwnPropertyDescriptors(obj)).filter(([k,d])=>_.isFunction(d.get)||_.isFunction(d.set)||_.isFunction(d.value)||_.isFunction(obj[k])).map(([k,v])=>k),
			];
			obj = Object.getPrototypeOf(obj);
		}
		methods = [...new Set(methods)];
		//console.log('Methods:',[...methods]);
		for(let method of methods){
			expect(wrapper).to.have.property(method);
			expect(wrapper[method]).to.be.a('function');
			expect(wrapper[method]).to.not.equal(events[method]);
		}
		//throw new Error("error");
	});

	it("Internal properties & methods",async function(){
		let props = [], obj = wrapper;
		while(obj && obj.constructor!==Object){
			props = [
				...props,
				...Object.keys(obj),
				...Object.keys(Object.getOwnPropertyDescriptors(obj))
			];
			obj = Object.getPrototypeOf(obj);
		}
		props = [...new Set(props)];
		//console.log('props:',[...props]);
		let whitelistProps = ['eventEmitter'];
		let intProps = props.filter(k=>!(k in events));
		//console.log('intProps:',[...intProps]);
		for(let prop of intProps){
			expect(wrapper).to.have.property(prop);
			expect(events).to.not.have.property(prop);
			expect(wrapper[prop]).to.not.equal(events[prop]);
			if(whitelistProps.includes(prop)) continue;
			expect(prop).to.match(/^_/,"Invalid prefix");
		}
	});

});
