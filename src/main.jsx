import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Menu from './Pages/Menu.jsx'
import Home from './Pages/Home.jsx'
import ItemDetail  from "./Pages/ItemDetail.jsx"
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import App from './App.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element:<App/>,
    children:[
      {
        path:"/",
        element:<Home/>
      },
      {
        path:"/menu",
        element:<Menu/>
      },
      {
        path: "/item/:id",      
        element: <ItemDetail />   
      },
    ]
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <RouterProvider router={router} />
  </StrictMode>,
)
