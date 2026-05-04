import { StrictMode } from 'react'
import Menu from './Pages/Menu.jsx'
import ItemDetail  from "./Pages/ItemDetail.jsx"
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import App from "./App.jsx";
import Home from "./Pages/Home.jsx";
import "./index.css";

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
    ]
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);