import * as React from 'react';
import './App.css';
import { Subject, buffer, tap, map, filter, throttleTime, pipe, UnaryFunction, Observable, fromEvent } from 'rxjs';

const theSimulatedKeyboard = new Subject<string>();
const simulatedKeyupObservable = theSimulatedKeyboard.asObservable();

/**
 * Like bufferTime but the buffer duration starts on the first event
 * https://stackoverflow.com/questions/50907458/rxjs-observable-reusing-logic
 * https://blog.hackages.io/rxjs-5-5-piping-all-the-things-9d469d1b3f44
 */
function bufferTimeLeading<T>(duration: number): UnaryFunction<Observable<T>, Observable<T[]>> {
  const closingNotifier = new Subject<void>();
  let timeout: NodeJS.Timeout | null = null;

  return pipe(
    tap<T>(() => {
      if(timeout == null) {
        timeout = setTimeout(() => { 
          closingNotifier.next();
          timeout = null;
        }, duration);
      }
    }),    
    buffer<T>(closingNotifier)
  );
}

const simulatedScannerObservable = simulatedKeyupObservable.pipe( 
  filter(ev => ev.length > 3),
  bufferTimeLeading(500),
  map(buffer => buffer.join('')),
  throttleTime(1500)
);

const scannerObservable = fromEvent<KeyboardEvent>(document, "keyup")
  .pipe(
    filter(ev => ev.key !== undefined),
    map(ev => ev.key),
    bufferTimeLeading(500),
    map(buffer => buffer.join('')),
    throttleTime(1500)
  );

type ExpectedPageScanTypeState = "WristBand" | "NurseBadge";

function App() {
  const [scannerModalIsActive, toggleIsScannerModalActive] = React.useReducer(state => !state, false);
  const [scanType, setScanType] = React.useState<ExpectedPageScanTypeState>("WristBand");

  React.useEffect(() => {
    const pageSpecificSubscription = simulatedScannerObservable.pipe(
      filter(ev => {
        return scannerModalIsActive;
      })
    ).subscribe(ev => {
      switch(scanType) {
        case 'WristBand':
          console.log(`I handled WristBand scan: ${ev}`);
          break;
        case 'NurseBadge':
          console.log(`I handled NurseBadge scan: ${ev}`);
          break;
      }
    });

    return () => pageSpecificSubscription.unsubscribe();
  }, [scannerModalIsActive, scanType]);  


  const scanWithOne = () => {
    theSimulatedKeyboard.next("dsflajsdlfjkj2kjaskdjf");
  };

  // const emitClosingNotifier = () => {
  //   bufferClosingNotifier.next();
  // };

  const scanWithTwoEvents = () => {
    theSimulatedKeyboard.next("fasdf");

    setTimeout(() => {
      theSimulatedKeyboard.next("after200-should-concatenate");
    }, 200);
  };

  const testThrottle = () => {
    scanWithTwoEvents();

    setTimeout(() => {
      theSimulatedKeyboard.next("should be ignored");
    }, 1000);
  };  

  const simluateKeyboardInput = () => {
    theSimulatedKeyboard.next("aa");
  };

  return (
    <div>
      <button onClick={scanWithOne}>simulate scan with one event</button>
      <button onClick={scanWithTwoEvents}>simulate scan with two events in 200ms</button>
      <button onClick={testThrottle}>simulate a double scan after 1 second</button>
      <button onClick={simluateKeyboardInput}>simulate keyboard input</button>
      <button onClick={toggleIsScannerModalActive}>scanner modal {scannerModalIsActive ? "active" : "inactive"}</button>
      <button onClick={() => setScanType('WristBand')}>WristBand</button>
      <button onClick={() => setScanType('NurseBadge')}>NurseBadge</button>
      <p>
        ScanType: {scanType}
      </p>
      {/* <button onClick={emitClosingNotifier}>emitClosingNotifier</button> */}
    </div>
  );
}

export default App;
