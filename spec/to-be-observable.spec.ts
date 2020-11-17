import { merge, timer } from "rxjs";
import { concat, mapTo } from "rxjs/operators";
import { cold, hot, Scheduler, time } from "../index";

describe("toBeObservable matcher test", () => {
  it("Should concatenate two cold observables into single cold observable", () => {
    const a$ = cold("-a-|", { a: 0 });
    const b$ = cold("-b-|", { b: 1 });
    const expected = cold("-a--b-|", { a: 0, b: 1 });

    expect(a$.pipe(concat(b$))).toBeObservable(expected);
  });

  it("Should work for value objects", () => {
    const valueObject = { foo: "bar" };
    const a$ = cold("-a-|", { a: valueObject });
    const expected = cold("-a-|", { a: valueObject });

    expect(a$).toBeObservable(expected);
  });

  it("should work for multi-character literals", () => {
    const falses$ = cold("--a-----b-----|");
    const trues$ = cold("-----a-----b--|");
    const expected = cold("--f--t--f--t--|", { t: true, f: false });
    const mapped = merge(falses$.pipe(mapTo(false)), trues$.pipe(mapTo(true)));

    expect(mapped).toBeObservable(expected);
  });

  it("should work for mixed literals", () => {
    const falses$ = cold("--a-----a-----|", { a: false });
    const trues$ = cold("-----b-----b--|", { b: true });
    const characters$ = cold("-------------c-|");
    const expected = cold("--f--t--f--t-c-|", { t: true, f: false, c: "c" });
    const mapped = merge(falses$, trues$, characters$);

    expect(mapped).toBeObservable(expected);
  });
  
  it("Should work with undefined values", (  ) => {
    const values$ = cold("u|", { u: undefined });
    const expected = cold("u|", { u:undefined });
  
    expect(values$).toBeObservable(expected);
  });

  it("Should merge two hot observables and start emitting from the subscription point", () => {
    const e1 = hot("----a--^--b-------c--|");
    const e2 = hot("---d-^--e---------f-----|");
    const expected = cold("---(be)----c-f-----|");

    expect(merge(e1, e2)).toBeObservable(expected);
  });

  it("Should delay the emission by provided timeout with provided scheduler", () => {
    const delay = time("-----d|");
    const provided = timer(delay, Scheduler.get()).pipe(mapTo(0));
    const expected = hot("------(d|)", { d: 0 });

    expect(provided).toBeObservable(expected);
  });

  it("Should ignore whitespace to allow vertical alignment", () => {
    const hotInput = hot("  ---^--a|");
    const coldInput = cold("   ---a|");
    const expected = cold("    ---a|");

    expect(hotInput).toBeObservable(expected);
    expect(coldInput).toBeObservable(expected);
  });

  it("Should work with asymmetric matchers", () => {
    const e$ = hot("-a", { a: { someprop: "hey", x: { y: 1, z: 2 }, blah: "3" } });
    expect(e$).toBeObservable(cold("-b", { b: expect.objectContaining({
        x: expect.objectContaining({
          y: 1
        }),
        blah: "3"
    })}));
  });

  it("Should pass if the two objects have the same properties but in different order", () => {
    const e$ = hot("-a", { a: { someprop: "hey", b: 1 }});
    expect(e$).toBeObservable(cold("-b", { b: { b: 1, someprop: "hey" }}));
  });

});
