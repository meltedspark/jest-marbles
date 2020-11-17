import { Notification } from 'rxjs';
import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';
import { TestMessage } from 'rxjs/internal/testing/TestMessage';
import { Marblizer } from '../src/marblizer';
import { NotificationKind } from 'rxjs/internal/Notification';

describe('Marblizer test', () => {
  it('Should marblize TestMessages', () => {
    // First dash is frame 0
    // ---(be)----c-f-----|
    const sample: TestMessage[] = [
      { frame: 30, notification: new Notification('N', 'b') },
      { frame: 30, notification: new Notification('N', 'e') },
      { frame: 110, notification: new Notification('N', 'c') },
      { frame: 130, notification: new Notification('N', 'f') },
      { frame: 190, notification: new Notification('C') }
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---(be)----c-f-----|');
  });

  it('Should marblize TestMessages with error', () => {
    const sample: TestMessage[] = [
      { frame: 30, notification: new Notification('N', 'b') },
      { frame: 30, notification: new Notification('N', 'e') },
      { frame: 110, notification: new Notification('E') }
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---(be)----#');
  });

  it('Should marblize TestMessages without completion', () => {
    const sample: TestMessage[] = [
      { frame: 30, notification: new Notification('N', 'b') },
      { frame: 110, notification: new Notification('N', 'e') }
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('---b-------e');
  });
  
   it('Should marblize Subscriptions without completion', () => {
    const sample: SubscriptionLog[] = [
     {  "subscribedFrame": 20,  "unsubscribedFrame": Infinity }
     ];

    const marble = Marblizer.marblizeSubscriptions(sample);
    expect(marble).toEqual(['--^']);
  });

  it('Should marblize TestMessages without emission (but with completion)', () => {
    const sample: TestMessage[] = [
      { frame: 110, notification: new Notification('C') }
    ];

    const marble = Marblizer.marblize(sample);
    expect(marble).toEqual('-----------|');
  });

 it('Should marblize SubscriptionLogs', () => {
    const marble = Marblizer.marblizeSubscriptions([new SubscriptionLog(30, 60), new SubscriptionLog(10, 50)]);
    expect(marble).toEqual(['---^--!', '-^---!']);
  });


});
