"use strict";

// https://mochajs.org/
// https://www.chaijs.com/api/bdd/
// https://gist.github.com/yoavniran/1e3b0162e1545055429e#chai
// https://www.chaijs.com/plugins/sinon-chai/
// https://sinonjs.org/

const _ = require("underscore");
const chai = require("chai");
const sinon = require("sinon");
const sinonChai = require("sinon-chai");
const { expect, assert, should } = chai;
chai.use(sinonChai);

const EventEmitter = require('node:events');
const EventEmitterWrapper = require('../');

describe("EventEmitter Compatability - Functionality",async ()=>{
	let events = null, wrapper = null;

	beforeEach("Setup events & wrapper",async function(){
		events = new EventEmitter();
		wrapper = new EventEmitterWrapper(events);
		expect(events.eventNames(),'Base Events').to.deep.eq([]);
		expect(wrapper.eventNames(),'Wrapper Events').to.deep.eq([]);
		if(wrapper._eewEventStore) expect(wrapper._eewEventStore.size).to.equal(0);
	});

	afterEach("Cleanup events & wrapper",function(){
		if(events && events.removeAllListeners) events.removeAllListeners();
		if(wrapper && wrapper.removeAllListeners) wrapper.removeAllListeners();
		expect(events.eventNames(),'Base Events').to.deep.eq([]);
		expect(wrapper.eventNames(),'Wrapper Events').to.deep.eq([]);
		if(wrapper._eewEventStore) expect(wrapper._eewEventStore.size).to.equal(0);
	});

	it("Wrapper Listen, Emit & Remove (via wrapper)",async function(){
		let listenerSpy = sinon.spy();
		wrapper.on('test',listenerSpy);
		events.emit('test');
		expect(listenerSpy).to.have.callCount(1);
		wrapper.emit('test');
		expect(listenerSpy).to.have.callCount(2);
		expect(events.eventNames(),'Base Listening Events').to.deep.eq(['test','removeListener']);
		expect(wrapper.eventNames(),'Wrapper Listening Events').to.deep.eq(['test']);
		expect(events.listeners('test'),'Base Listeners').to.deep.eq([listenerSpy]);
		expect(wrapper.listeners('test'),'Wrapper Listeners').to.deep.eq([listenerSpy]);
		expect(wrapper.listenerCount('test')).to.equal(1);
		expect(wrapper.listenerCount('test',listenerSpy)).to.equal(1);
		wrapper.removeListener('test',listenerSpy);
		expect(events.eventNames(),'After Remove From Wrapper - Base Listening Events').to.deep.eq([]);
		expect(wrapper.eventNames(),'After Remove From Wrapper - Wrapper Listening Events').to.deep.eq([]);
		expect(events.listeners('test'),'After Remove From Wrapper - Base Listeners').to.deep.eq([]);
		expect(wrapper.listeners('test'),'After Remove From Wrapper - Wrapper Listeners').to.deep.eq([]);
		expect(wrapper.listenerCount('test')).to.equal(0);
		expect(wrapper.listenerCount('test',listenerSpy)).to.equal(0);
		events.emit('test');
		expect(listenerSpy).to.have.callCount(2);
		wrapper.emit('test');
		expect(listenerSpy).to.have.callCount(2);
	});

	it("Wrapper Listen, Emit & Remove (via base)",async function(){
		let listenerSpy = sinon.spy();
		wrapper.on('test',listenerSpy);
		events.emit('test');
		expect(listenerSpy).to.have.callCount(1);
		wrapper.emit('test');
		expect(listenerSpy).to.have.callCount(2);
		expect(events.eventNames(),'Base Listening Events').to.deep.eq(['test','removeListener']);
		expect(wrapper.eventNames(),'Wrapper Listening Events').to.deep.eq(['test']);
		expect(events.listeners('test'),'Base Listeners').to.deep.eq([listenerSpy]);
		expect(wrapper.listeners('test'),'Wrapper Listeners').to.deep.eq([listenerSpy]);
		events.removeListener('test',listenerSpy);
		expect(events.eventNames(),'After Remove From Base - Base Listening Events').to.deep.eq([]);
		expect(wrapper.eventNames(),'After Remove From Base - Wrapper Listening Events').to.deep.eq([]);
		expect(events.listeners('test'),'After Remove From Base - Base Listeners').to.deep.eq([]);
		expect(wrapper.listeners('test'),'After Remove From Base - Wrapper Listeners').to.deep.eq([]);
		events.emit('test');
		expect(listenerSpy).to.have.callCount(2);
		wrapper.emit('test');
		expect(listenerSpy).to.have.callCount(2);
	});

	it("Base Listen, Emit & Remove",async function(){
		let listenerSpy = sinon.spy();
		events.on('test',listenerSpy);
		events.emit('test');
		expect(listenerSpy).to.have.callCount(1);
		wrapper.emit('test');
		expect(listenerSpy).to.have.callCount(2);
		expect(events.eventNames(),'Base Listening Events').to.deep.eq(['test']);
		expect(wrapper.eventNames(),'Wrapper Listening Events').to.deep.eq([]);
		expect(events.listeners('test'),'Base Listeners').to.deep.eq([listenerSpy]);
		expect(wrapper.listeners('test'),'Wrapper Listeners').to.deep.eq([]);
		wrapper.removeListener('test',listenerSpy);
		expect(events.eventNames(),'After Remove From Wrapper - Base Listening Events').to.deep.eq([]);
		expect(wrapper.eventNames(),'After Remove From Wrapper - Wrapper Listening Events').to.deep.eq([]);
		expect(events.listeners('test'),'After Remove From Wrapper - Base Listeners').to.deep.eq([]);
		expect(wrapper.listeners('test'),'After Remove From Wrapper - Wrapper Listeners').to.deep.eq([]);
		events.on('test',listenerSpy);
		events.removeListener('test',listenerSpy);
		expect(events.eventNames(),'After Remove From Base - Base Listening Events').to.deep.eq([]);
		expect(wrapper.eventNames(),'After Remove From Base - Wrapper Listening Events').to.deep.eq([]);
		expect(events.listeners('test'),'After Remove From Base - Base Listeners').to.deep.eq([]);
		expect(wrapper.listeners('test'),'After Remove From Base - Wrapper Listeners').to.deep.eq([]);
		events.emit('test');
		expect(listenerSpy).to.have.callCount(2);
		wrapper.emit('test');
		expect(listenerSpy).to.have.callCount(2);
	});

	it("Wrapper & Base Listen, Emit & Partial Remove (via wrapper)",async function(){
		let listenerSpyBase1 = sinon.spy();
		let listenerSpyBase2 = sinon.spy();
		let listenerSpyWrapper1 = sinon.spy();
		let listenerSpyWrapper2 = sinon.spy();
		events.on('test',listenerSpyBase1);
		events.on('test-base-unique',listenerSpyBase2);
		wrapper.on('test',listenerSpyWrapper1);
		wrapper.on('test-wrapper-unique',listenerSpyWrapper2);
		events.emit('test');
		expect(listenerSpyBase1).to.have.callCount(1);
		expect(listenerSpyWrapper1).to.have.callCount(1);
		events.emit('test-base-unique');
		expect(listenerSpyBase2).to.have.callCount(1);
		events.emit('test-wrapper-unique');
		expect(listenerSpyWrapper2).to.have.callCount(1);
		wrapper.emit('test');
		expect(listenerSpyBase1).to.have.callCount(2);
		expect(listenerSpyWrapper1).to.have.callCount(2);
		wrapper.emit('test-base-unique');
		expect(listenerSpyBase2).to.have.callCount(2);
		wrapper.emit('test-wrapper-unique');
		expect(listenerSpyWrapper2).to.have.callCount(2);
		expect(events.eventNames(),'Base Listening Events').to.deep.eq(['test','test-base-unique','removeListener','test-wrapper-unique']);
		expect(wrapper.eventNames(),'Wrapper Listening Events').to.deep.eq(['test','test-wrapper-unique',]);
		expect(events.listeners('test'),'Base Listeners - test').to.deep.eq([listenerSpyBase1,listenerSpyWrapper1]);
		expect(wrapper.listeners('test'),'Wrapper Listeners - test').to.deep.eq([listenerSpyWrapper1]);
		expect(events.listeners('test-base-unique'),'Base Listeners - test-base-unique').to.deep.eq([listenerSpyBase2]);
		expect(wrapper.listeners('test-base-unique'),'Wrapper Listeners - test-base-unique').to.deep.eq([]);
		expect(events.listeners('test-wrapper-unique'),'Base Listeners - test-wrapper-unique').to.deep.eq([listenerSpyWrapper2]);
		expect(wrapper.listeners('test-wrapper-unique'),'Wrapper Listeners - test-wrapper-unique').to.deep.eq([listenerSpyWrapper2]);
		wrapper.removeAllListeners('test');
		expect(events.eventNames(),'Base Listening Events').to.deep.eq(['test','test-base-unique','removeListener','test-wrapper-unique']);
		expect(wrapper.eventNames(),'Wrapper Listening Events').to.deep.eq(['test-wrapper-unique',]);
		expect(events.listeners('test'),'Base Listeners - test').to.deep.eq([listenerSpyBase1]);
		expect(wrapper.listeners('test'),'Wrapper Listeners - test').to.deep.eq([]);
		events.emit('test');
		expect(listenerSpyBase1).to.have.callCount(3);
		expect(listenerSpyWrapper1).to.have.callCount(2);
		wrapper.emit('test');
		expect(listenerSpyBase1).to.have.callCount(4);
		expect(listenerSpyWrapper1).to.have.callCount(2);
	});

	it("Wrapper & Base Listen, Emit & Remove (via base)",async function(){
		let listenerSpyBase1 = sinon.spy();
		let listenerSpyWrapper1 = sinon.spy();
		events.on('test',listenerSpyBase1);
		wrapper.on('test',listenerSpyWrapper1);
		events.emit('test');
		expect(listenerSpyBase1).to.have.callCount(1);
		expect(listenerSpyWrapper1).to.have.callCount(1);
		wrapper.emit('test');
		expect(listenerSpyBase1).to.have.callCount(2);
		expect(listenerSpyWrapper1).to.have.callCount(2);
		events.removeAllListeners('test');
		expect(events.listeners('test'),'Base Listeners - test').to.deep.eq([]);
		expect(wrapper.listeners('test'),'Wrapper Listeners - test').to.deep.eq([]);
		events.emit('test');
		expect(listenerSpyBase1).to.have.callCount(2);
		expect(listenerSpyWrapper1).to.have.callCount(2);
		wrapper.emit('test');
		expect(listenerSpyBase1).to.have.callCount(2);
		expect(listenerSpyWrapper1).to.have.callCount(2);
	});

});
