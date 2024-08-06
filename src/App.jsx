import { Route, Routes, useNavigate} from 'react-router-dom';
import Login from './components/Login';
import Main from './components/Main';
import { useEffect, useState } from 'react';


export default function App() {

  const navigate = useNavigate();
  const [profile, setProfile] = useState(JSON.parse(localStorage.getItem('profile')));


  useEffect(() => {
    profile !== null && navigate('/main/profile');
    ((window.location.href.includes('/main/profile') || window.location.href.includes('/main/playlist') || window.location.href.includes('/main/search') || window.location.href.includes('/main')) && profile === null && !window.location.href.includes('?code=')) && navigate('/');
  }, [profile]);

  return (
    <Routes>      
      <Route path='/' element={<Login />} />
      <Route path='/main/*' element={<Main />} />
    </Routes>     

  ); 
}