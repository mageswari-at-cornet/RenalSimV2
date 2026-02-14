import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Cockpit } from './views/Cockpit';
import { PatientView } from './views/PatientView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Cockpit />} />
        <Route path="/patient/:patientId" element={<PatientView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;