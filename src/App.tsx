import * as React from 'react';
import './App.css';
import { fromEvent, bufferWhen, interval, Observable, window, Subject, mergeAll, concat,
  debounceTime,
} from 'rxjs';
import { debounceTime2 } from './reduceTime';

const theSubject = new Subject<string>();
const theObservable = theSubject.asObservable();

function App() {
  React.useEffect(() => {
    const subscription = theObservable.pipe(
      debounceTime2(1000)
    ).subscribe(v => console.log(v));

    return () => subscription.unsubscribe();
  }, []);  

  const scan = () => {
    theSubject.next("dsflajsdlfjkj2kjaskdjf");
  };

  const scanWithTwoEvents = () => {
    theSubject.next("dsflajsdlfjkj2kjaskdjf");

    setTimeout(() => {
      theSubject.next("after200-should-concatenate");
    }, 200);
  };

  return (
    <div>
      <button onClick={scan}>simulate scan</button>
      <button onClick={scanWithTwoEvents}>simulate scan with two events in 500ms</button>
    </div>
  );
}

export default App;
