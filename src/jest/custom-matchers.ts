import { equals } from 'expect/build/jasmineUtils';
import * as diff from 'jest-diff';
import { matcherHint, printExpected, printReceived } from 'jest-matcher-utils';
import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';
import { TestMessage } from 'rxjs/internal/testing/TestMessage';
import { Marblizer } from '../marblizer';

function canMarblize(...messages: TestMessage[][]) {
  return messages.every(message => message.filter(({ notification: { kind } }) => kind === 'N').every(isCharacter));
}

function isCharacter({ notification: { value } }: TestMessage): boolean {
  if (typeof value === 'undefined') {
    return false;
  }

  return (typeof value === 'string' && value.length === 1) || JSON.stringify(value).length === 1;
}

export const customTestMatchers = {
  toBeNotifications(actual: TestMessage[], expected: TestMessage[]) {
    let actualMarble: string | TestMessage[] = actual;
    let expectedMarble: string | TestMessage[] = expected;
    if (canMarblize(actual, expected)) {
      actualMarble = Marblizer.marblize(actual);
      expectedMarble = Marblizer.marblize(expected);
    }

    const pass = equals(actualMarble, expectedMarble);

    const message = pass
      ? () =>
          matcherHint('.not.toBeNotifications') +
          '\n\n' +
          `Expected notifications to not be:\n` +
          `  ${printExpected(expectedMarble)}\n` +
          `But got:\n` +
          `  ${printReceived(actualMarble)}`
      : () => {
          const diffString = diff(expectedMarble, actualMarble, {
            expand: true,
          });
          return (
            matcherHint('.toBeNotifications') +
            '\n\n' +
            `Expected notifications to be:\n` +
            `  ${printExpected(expectedMarble)}\n` +
            `But got:\n` +
            `  ${printReceived(actualMarble)}` +
            (diffString ? `\n\nDifference:\n\n${diffString}` : '')
          );
        };

    return { actual, message, pass };
  },

  toBeSubscriptions(actual: SubscriptionLog[], expected: SubscriptionLog[]) {
    const actualMarbleArray = Marblizer.marblizeSubscriptions(actual);
    const expectedMarbleArray = Marblizer.marblizeSubscriptions(expected);

    const pass = subscriptionsPass(actualMarbleArray, expectedMarbleArray);
    const message = pass
      ? () =>
          matcherHint('.not.toHaveSubscriptions') +
          '\n\n' +
          `Expected observable to not have the following subscription points:\n` +
          `  ${printExpected(expectedMarbleArray)}\n` +
          `But got:\n` +
          `  ${printReceived(actualMarbleArray)}`
      : () => {
          const diffString = diff(expectedMarbleArray, actualMarbleArray, {
            expand: true,
          });
          return (
            matcherHint('.toHaveSubscriptions') +
            '\n\n' +
            `Expected observable to have the following subscription points:\n` +
            `  ${printExpected(expectedMarbleArray)}\n` +
            `But got:\n` +
            `  ${printReceived(actualMarbleArray)}` +
            (diffString ? `\n\nDifference:\n\n${diffString}` : '')
          );
        };

    return { actual, message, pass };
  },

  toHaveEmptySubscriptions(actual: SubscriptionLog[] | undefined) {
    const pass = !(actual && actual.length > 0);
    let marbles: string[];
    if (actual && actual.length > 0) {
      marbles = Marblizer.marblizeSubscriptions(actual);
    }
    const message = pass
      ? () =>
          matcherHint('.not.toHaveNoSubscriptions') +
          '\n\n' +
          `Expected observable to have at least one subscription point, but got nothing` +
          printReceived('')
      : () =>
          matcherHint('.toHaveNoSubscriptions') +
          '\n\n' +
          `Expected observable to have no subscription points\n` +
          `But got:\n` +
          `  ${printReceived(marbles)}\n\n`;
    return { actual, message, pass };
  },
};

function subscriptionsPass(actualMarbleArray: string[], expectedMarbleArray: string[]): boolean {
  if (actualMarbleArray.length !== expectedMarbleArray.length) {
    return false;
  }
  let pass = true;
  for (const actualMarble of actualMarbleArray) {
    if (!expectedMarbleArray.includes(actualMarble)) {
      pass = false;
      break;
    }
  }
  return pass;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeNotifications(notifications: TestMessage[]): void;

      toBeSubscriptions(subscriptions: SubscriptionLog[]): void;

      toHaveEmptySubscriptions(): void;
    }
  }
}

expect.extend(customTestMatchers);
