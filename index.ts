import {ColdObservable} from './src/rxjs/cold-observable';
import {HotObservable} from './src/rxjs/hot-observable';
import {Scheduler} from './src/rxjs/scheduler';
import { stripAlignmentChars } from './src/rxjs/strip-alignment-chars';

export type ObservableWithSubscriptions = ColdObservable | HotObservable;

export {Scheduler} from './src/rxjs/scheduler';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeObservable(observable: ObservableWithSubscriptions): void;

      toHaveSubscriptions(marbles: string | string[]): void;

      toHaveNoSubscriptions(): void;

      toBeMarble(marble: string): void;
    }
  }
}

export function hot<T = string>(
  marbles: string,
  values?: {
    [marble: string]: T;
  },
  error?: any
): HotObservable<T> {
  return new HotObservable(stripAlignmentChars(marbles), values, error);
}

export function cold<T = string>(
  marbles: string,
  values?: {
    [marble: string]: T;
  },
  error?: any
): ColdObservable<T> {
  return new ColdObservable(stripAlignmentChars(marbles), values, error);
}

export function time(marbles: string): number {
  return Scheduler.get().createTime(stripAlignmentChars(marbles));
}

const dummyResult = {
  message: () => '',
  pass: true
};

expect.extend({

  toHaveSubscriptions(actual: ObservableWithSubscriptions, marbles: string | string[]) {
    const sanitizedMarbles = Array.isArray(marbles) ? marbles.map(stripAlignmentChars) : stripAlignmentChars(marbles);
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe(sanitizedMarbles);
    return dummyResult;
  },

  toHaveNoSubscriptions(actual: ObservableWithSubscriptions) {
    Scheduler.get().expectSubscriptions(actual.getSubscriptions()).toBe([]);
    return dummyResult;
  },

  toBeObservable(actual: ObservableWithSubscriptions, expected: ObservableWithSubscriptions) {
    Scheduler.get().expectObservable(actual).toBe(expected.marbles, expected.values, expected.error);
    return dummyResult;
  },

  toBeMarble(actual: ObservableWithSubscriptions, marbles: string) {
    Scheduler.get().expectObservable(actual).toBe(stripAlignmentChars(marbles));
    return dummyResult;
  }
});

beforeEach(() => Scheduler.init());
afterEach(() => {
  Scheduler.get().flush();
  Scheduler.reset();
});
