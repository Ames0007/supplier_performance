import { describe, it, expect, vi } from "vitest";
import { EventBus, Outbox, createEvent } from "./event-bus";

describe("EventBus", () => {
  it("delivers published events to subscribers", async () => {
    const bus = new EventBus();
    const received: string[] = [];
    bus.subscribe("Ping", (event) => {
      received.push(event.name);
    });
    await bus.publish(createEvent("Ping", { n: 1 }));
    expect(received).toEqual(["Ping"]);
  });

  it("stops delivery after unsubscribe", async () => {
    const bus = new EventBus();
    const handler = vi.fn();
    const off = bus.subscribe("X", handler);
    off();
    await bus.publish(createEvent("X", {}));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("Outbox", () => {
  it("flush publishes buffered events (post-commit)", async () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe("Y", handler);
    const outbox = new Outbox();
    outbox.add(createEvent("Y", {}));
    expect(handler).not.toHaveBeenCalled();
    await outbox.flush(bus);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("discard drops buffered events (rollback)", async () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.subscribe("Z", handler);
    const outbox = new Outbox();
    outbox.add(createEvent("Z", {}));
    outbox.discard();
    await outbox.flush(bus);
    expect(handler).not.toHaveBeenCalled();
  });
});
