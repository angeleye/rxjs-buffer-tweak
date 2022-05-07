import * as React from 'react';
import './App.css';
import { Subject, buffer, tap, map, filter, throttleTime } from 'rxjs';

const theSubject = new Subject<string>();
const keyupObservable = theSubject.asObservable();

const bufferClosingNotifier = new Subject<void>();
const bufferClosingNotifierObservable = bufferClosingNotifier.asObservable();

let timeout: NodeJS.Timeout | null = null;

const keyboardListenerObservable = keyupObservable.pipe( 
  filter(ev => ev.length > 3),
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
);

function App() {
  const [scannerModalIsActive, toggleIsScannerModalActive] = React.useReducer(state => !state, false);

  React.useEffect(() => {
    const pageSpecificSubscription = keyboardListenerObservable.pipe(
      filter(ev => {
        return scannerModalIsActive;
      })
    ).subscribe(ev => console.log(ev));

    return () => pageSpecificSubscription.unsubscribe();
  }, [scannerModalIsActive]);  


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

  const simluateKeyboardInput = () => {
    theSubject.next("aa");
  };

  return (
    <div>
      <button onClick={scanWithOne}>simulate scan with one event</button>
      <button onClick={scanWithTwoEvents}>simulate scan with two events in 200ms</button>
      <button onClick={testThrottle}>simulate a double scan after 1 second</button>
      <button onClick={simluateKeyboardInput}>simulate keyboard input</button>
      <button onClick={toggleIsScannerModalActive}>scanner modal {scannerModalIsActive ? "active" : "inactive"}</button>
      {/* <button onClick={emitClosingNotifier}>emitClosingNotifier</button> */}
    </div>
  );
}

export default App;
