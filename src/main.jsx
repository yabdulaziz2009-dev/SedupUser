import { StrictMode } from 'react'
import Menu from './Pages/Menu.jsx'
import ItemDetail  from "./Pages/ItemDetail.jsx"
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";


import App from './App.jsx'
import Home from './pages/Home.jsx'
import './index.css'
import Calendar from './Pages/Mealorder.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <Home />,
      },
      {
        path:"/menu",
        element:<Menu/>
      },
      {
        path: "/item/:id",      
        element: <ItemDetail />   

      },
      {
        path: "/calendar",      
        element: <Calendar />   

      },
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);