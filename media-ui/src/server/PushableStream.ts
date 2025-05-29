/** ===============================================================================
 * An async‐iterable stream that external code can push values into.
 *
 * Allows to:
 *  • .push(value)        – enqueue a new item
 *  • .close()            – terminate the stream
 *  • for await (v of s)  – consume items until closed
 *
 * If the consumer is waiting (awaiting next()), .push() will immediately
 * resolve that promise; otherwise items are buffered until consumed.
 * =============================================================================== */

export class PushableStream<T> implements AsyncIterable<T> {
  private queue: T[] = [];
  private resolvers: ((val: IteratorResult<T>) => void)[] = [];
  private closed = false;

  /** ===============================================================================
   * Enqueue one item.  
   * Resolves any pending consumer immediately.
   *
   * @param item – The value to push.
   * @throws If the stream has already been closed.
   * =============================================================================== */

  push(item: T): void {
    if (this.closed) throw new Error("Stream is closed");
    if (this.resolvers.length) {
      const resolve = this.resolvers.shift()!;
      resolve({ value: item, done: false });
    } else {
      this.queue.push(item);
    }
  }

  /** ===============================================================================
   * Close the stream.  
   * Future pushes will error; any waiting consumers receive done=true.
   * ===============================================================================*/

  close(): void {
    if (!this.closed) {
      this.closed = true;
      while (this.resolvers.length) {
        const resolve = this.resolvers.shift()!;
        resolve({ value: undefined as any, done: true });
      }
    }
  }

  /** ===============================================================================
   * Inject an error into the stream.  
   * Rejects the current consumer and closes the stream.
   * ===============================================================================*/

  public throw(err: unknown): Promise<IteratorResult<T>> {
    this.close();
    return Promise.reject(err);
  }

  /** ===============================================================================
   * Async iterator implementation.
   * Resolves buffered values immediately or waits until .push()/.close().
   * ===============================================================================*/

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => {
        if (this.queue.length > 0) {
          const value = this.queue.shift()!;
          return Promise.resolve({ value, done: false });
        }
        if (this.closed) {
          return Promise.resolve({ value: undefined as any, done: true });
        }
        return new Promise<IteratorResult<T>>(resolve =>
          this.resolvers.push(resolve)
        );
      },
      return: () => {
        this.close();
        return Promise.resolve({ value: undefined as any, done: true });
      },
      throw: (error) => this.throw(error),
    };
  }
}
