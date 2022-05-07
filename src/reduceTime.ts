import { MonoTypeOperatorFunction, SchedulerLike, asyncScheduler, SchedulerAction,
    Subscription
} from "rxjs";
import { operate } from "./lift";
import { createOperatorSubscriber } from "./OperatorSubscriber";

export function debounceTime2<T>(dueTime: number, scheduler: SchedulerLike = asyncScheduler): MonoTypeOperatorFunction<T> {
    return operate((source, subscriber) => {
      let activeTask: Subscription | null = null;
      let lastValue: T | null = null;
      let lastTime: number | null = null;
  
      const emit = () => {
        if (activeTask) {
          // We have a value! Free up memory first, then emit the value.
          activeTask.unsubscribe();
          activeTask = null;
          const value = lastValue!;
          lastValue = null;
          subscriber.next(value);
        }
      };
      function emitWhenIdle(this: SchedulerAction<unknown>) {
        // This is called `dueTime` after the first value
        // but we might have received new values during this window!
  
        const targetTime = lastTime! + dueTime;
        const now = scheduler.now();
        if (now < targetTime) {
          // On that case, re-schedule to the new target
          activeTask = this.schedule(undefined, targetTime - now);
          subscriber.add(activeTask);
          return;
        }
  
        emit();
      }
  
      source.subscribe(
        createOperatorSubscriber(
          subscriber,
          (value: T) => {
            lastValue = value;
            lastTime = scheduler.now();
  
            // Only set up a task if it's not already up
            if (!activeTask) {
              activeTask = scheduler.schedule(emitWhenIdle, dueTime);
              subscriber.add(activeTask);
            }
          },
          () => {
            // Source completed.
            // Emit any pending debounced values then complete
            emit();
            subscriber.complete();
          },
          // Pass all errors through to consumer.
          undefined,
          () => {
            // Finalization.
            lastValue = activeTask = null;
          }
        )
      );
    });
  }