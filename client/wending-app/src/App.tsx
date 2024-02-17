import React, { useEffect } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { AdminPage } from './modules/adminPage/adminPage';
import { WendingPage } from './modules/wendingPage/wendingPage';
import { useDispatch } from 'react-redux';
import { fillGoods, getNominals } from './redux/wendingSlice';
import { AppDispatch } from './redux/store';
import { getDrinks } from './redux/adminSlice';

function App() {

  const dispatch = useDispatch<AppDispatch>();

  return (
    <div className="App">
      <header className="App-header">
      </header>
      <Routes>
        <Route path='/'
          Component={() => {
            dispatch(fillGoods());
            dispatch(getNominals());
            return <WendingPage />
          }} />
        <Route path='/admin'
          Component={() => <AdminPage />} />
      </Routes>
    </div>
  );
}

export default App;
