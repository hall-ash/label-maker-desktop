import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import Navigation from './components/Navigation';

const App = () => {

  return (
      <Router>
        <div>
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
  );
};

export default App;
