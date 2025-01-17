import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AgentVideoScreen from './components/Video/AgentVideoBox';
import UserVideoScreen from './components/Video/UserVideoBox.js';
import StepperForm from './components/StepperForm';
import MainScreen from './components/Video/index.js';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<MainScreen />} />
      <Route path="/agent" element={<AgentVideoScreen />} />
      <Route path="/user" element={<UserVideoScreen />} />
    </Routes>
  </Router>
);

export default App;
