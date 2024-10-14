// types/eventemitter-wrapper.d.ts

import { EventEmitter } from 'events';

type Listener = (...args: any[]) => void;

export class EventEmitterWrapper {
  constructor(eventEmitter: EventEmitter);

  // Getter
  readonly eventEmitter: EventEmitter;

  // Methods
  addListener(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  prependListener(eventName: string, listener: Listener): this;
  prependOnceListener(eventName: string, listener: Listener): this;
  rawListeners(eventName: string): Listener[];
  listeners(eventName: string): Listener[];
  listenerCount(eventName: string, listener?: Listener): number;
  eventNames(): string[];
  emit(eventName: string, ...args: any[]): boolean;
  removeAllListeners(eventName?: string): this;
  removeListener(eventName: string, listener: Listener): this;
  off(eventName: string, listener: Listener): this;
  getMaxListeners(): number;
  setMaxListeners(n: number): this;
}

export function createWrapper(eventEmitter: EventEmitter): EventEmitterWrapper;
