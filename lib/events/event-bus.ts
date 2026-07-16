/**
 * In-process domain-event bus (ARCHITECTURE_BLUEPRINT: no external broker yet).
 * Bounded contexts communicate via published events, never by reading each
 * other's internals. The Outbox buffers events so they publish only AFTER a
 * transaction commits (flush) and are dropped on rollback (discard).
 */

export interface DomainEvent<TName extends string = string, TPayload = unknown> {
  readonly name: TName;
  readonly occurredAt: string;
  readonly payload: TPayload;
}

export type EventHandler<E extends DomainEvent = DomainEvent> = (event: E) => void | Promise<void>;

export function createEvent<TName extends string, TPayload>(
  name: TName,
  payload: TPayload,
): DomainEvent<TName, TPayload> {
  return { name, occurredAt: new Date().toISOString(), payload };
}

export class EventBus {
  private readonly handlers = new Map<string, Set<EventHandler>>();

  subscribe(name: string, handler: EventHandler): () => void {
    const set = this.handlers.get(name) ?? new Set<EventHandler>();
    set.add(handler);
    this.handlers.set(name, set);
    return () => {
      set.delete(handler);
    };
  }

  async publish(event: DomainEvent): Promise<void> {
    const set = this.handlers.get(event.name);
    if (!set) return;
    for (const handler of set) {
      await handler(event);
    }
  }
}

/** Process-wide singleton bus. */
export const eventBus = new EventBus();

/**
 * Transactional outbox: collect events during a unit of work, then `flush`
 * after the DB transaction commits, or `discard` on rollback.
 */
export class Outbox {
  private buffer: DomainEvent[] = [];

  add(event: DomainEvent): void {
    this.buffer.push(event);
  }

  get pending(): readonly DomainEvent[] {
    return this.buffer;
  }

  async flush(bus: EventBus = eventBus): Promise<void> {
    const events = [...this.buffer];
    this.buffer = [];
    for (const event of events) {
      await bus.publish(event);
    }
  }

  discard(): void {
    this.buffer = [];
  }
}
