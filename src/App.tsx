import * as React from 'react';
import './App.css';
import { Subject, buffer, tap } from 'rxjs';

const theSubject = new Subject<string>();
const theObservable = theSubject.asObservable();

const bufferClosingNotifier = new Subject<void>();
const bufferClosingNotifierObservable = bufferClosingNotifier.asObservable();

function App() {
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const subscription = theObservable.pipe( 
      tap(() => {
        if(interval == null) {
          interval = setTimeout(() => { 
            bufferClosingNotifier.next();
            interval = null; 
          }, 500);
        }
      }),    
      buffer(bufferClosingNotifierObservable)
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

  return (
    <div>
      <button onClick={scanWithOne}>simulate scan with one event</button>
      <button onClick={scanWithTwoEvents}>simulate scan with two events in 200ms</button>
      {/* <button onClick={emitClosingNotifier}>emitClosingNotifier</button> */}
    </div>
  );
}

export default App;
