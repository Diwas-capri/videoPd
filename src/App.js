import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AgentVideoScreen from './components/Video/AgentVideoBox';
import UserVideoScreen from './components/Video/UserVideoBox.js';
import StepperForm from './components/StepperForm';
import MainScreen from './components/Video/index.js';
import { SocketProvider } from './context/SocketContext.js';
import ErrorBoundary from './ErrorBoundary.js';

const App = () => (
  <ErrorBoundary>
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainScreen />} />
          <Route path="/agent" element={<AgentVideoScreen />} />
          <Route path="/user" element={<UserVideoScreen />} />
        </Routes>
      </Router>
    </SocketProvider>
  </ErrorBoundary>
    
);

export default App;
