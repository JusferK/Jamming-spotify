import { Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Main from './components/Main';

export default function App() {
  
  
  return (
    <Routes>      
      <Route path='/' element={<Login />} />
      <Route path='/main/*' element={<Main />} />
    </Routes>
  );
}