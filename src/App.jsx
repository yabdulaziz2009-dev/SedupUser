import React from 'react';
import { Outlet } from 'react-router-dom';
import Saidber from './Components/Saidbar.jsx';

const App = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F6F8] ">
      <Saidber />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;