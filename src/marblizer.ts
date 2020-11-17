import { SubscriptionLog } from 'rxjs/internal/testing/SubscriptionLog';
import { TestMessage } from 'rxjs/internal/testing/TestMessage';
import { MarblesGlossary } from './marbles-glossary';
import { NotificationEvent } from './notification-event';
import { NotificationKindChars, ValueLiteral } from './notification-kind';

const frameStep = 10;

export class Marblizer {
  public static marblize(messages: TestMessage[]): string {
    const emissions = Marblizer.getNotificationEvents(messages);
    let marbles = '';
    for (let i = 0, prevEndFrame = 0; i < emissions.length; prevEndFrame = emissions[i].end, i++) {
      marbles = `${marbles}${MarblesGlossary.TimeFrame.repeat(emissions[i].start - prevEndFrame) +
        emissions[i].marbles}`;
    }
    return marbles;
  }

  public static marblizeSubscriptions(logs: SubscriptionLog[]): string[] {
    return logs.map(
      log =>
        this.marblizeLogEntry(log.subscribedFrame / frameStep, MarblesGlossary.Subscription) +
        this.marblizeLogEntry(
          (log.unsubscribedFrame - log.subscribedFrame) / frameStep - 1,
          MarblesGlossary.Unsubscription
        )
    );
  }

  private static marblizeLogEntry(logPoint: number, symbol: string): string {
    if (logPoint !== Infinity) {
      return MarblesGlossary.TimeFrame.repeat(logPoint) + symbol;
    } else {
      return '';
    }
  }

  private static getNotificationEvents(messages: TestMessage[]) {
    const framesToEmissions = messages.reduce<{ [frame: number]: NotificationEvent }>((result, message) => {
      if (!result[message.frame]) {
        result[message.frame] = new NotificationEvent(message.frame / frameStep);
      }
      const event = result[message.frame];
      event.marbles += Marblizer.extractMarble(message);
      return result;
    }, {});

    const events = Object.keys(framesToEmissions).map<NotificationEvent>(frame => framesToEmissions[frame]);

    Marblizer.encloseGroupEvents(events);
    return events;
  }

  private static extractMarble(message: TestMessage) {
    let marble = NotificationKindChars[message.notification.kind];
    if (marble === ValueLiteral) marble = message.notification.value;
    return marble;
  }

  private static encloseGroupEvents(events: NotificationEvent[]) {
    events.forEach(event => {
      if (event.marbles.length > 1) {
        event.marbles = `${MarblesGlossary.GroupStart}${event.marbles}${MarblesGlossary.GroupEnd}`;
      }
    });
  }
}
