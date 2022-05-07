import * as React from 'react';
import './App.css';
import { Subject, buffer, tap, map, OperatorFunction, throttleTime } from 'rxjs';

const theSubject = new Subject<string>();
const theObservable = theSubject.asObservable();

const bufferClosingNotifier = new Subject<void>();
const bufferClosingNotifierObservable = bufferClosingNotifier.asObservable();

// function bufferTime2<T, R>(ms: number): OperatorFunction<T, R>[] {
//   const bufferClosingNotifier = new Subject<void>();
//   const bufferClosingNotifierObservable = bufferClosingNotifier.asObservable();
//   let timeout: NodeJS.Timeout | null = null;

//   return [
//     buffer<T>(bufferClosingNotifierObservable)
//   ];

//   // return [
//   //   tap(() => {
//   //     if(interval == null) {
//   //       interval = setTimeout(() => { 
//   //         bufferClosingNotifier.next();
//   //         interval = null; 
//   //       }, 500);
//   //     }
//   //   }),    
//   //   buffer(bufferClosingNotifierObservable),    
//   // ];
// }

function App() {
  React.useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const subscription = theObservable.pipe( 
      tap(() => {
        if(timeout == null) {
          timeout = setTimeout(() => { 
            bufferClosingNotifier.next();
            timeout = null;
          }, 500);
        }
      }),    
      buffer(bufferClosingNotifierObservable),
      map(buffer => buffer.join('')),
      throttleTime(2000)
    ).subscribe(v => console.log(v));

    return () => subscription.unsubscribe();
  }, []);  

  const scanWithOne = () => {
    theSubject.next("dsflajsdlfjkj2kjaskdjf");
  };

  const emitClosingNotifier = () => {
    bufferClosingNotifier.next();
  };

  const scanWithTwoEvents = () => {
    theSubject.next("fasdf");

    setTimeout(() => {
      theSubject.next("after200-should-concatenate");
    }, 200);
  };

  const testThrottle = () => {
    scanWithTwoEvents();

    setTimeout(() => {
      theSubject.next("should be ignored");
    }, 1000);
  };  

  return (
    <div>
      <button onClick={scanWithOne}>simulate scan with one event</button>
      <button onClick={scanWithTwoEvents}>simulate scan with two events in 200ms</button>
      <button onClick={testThrottle}>simulate a double scan after 1 second</button>
      {/* <button onClick={emitClosingNotifier}>emitClosingNotifier</button> */}
    </div>
  );
}

export default App;
