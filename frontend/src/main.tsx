import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import './login.css'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import Axios from 'axios'
import Login from './login'
import { generateHeader } from './util'
import Signup from './signup'
import Home from './home'


const axios = Axios.create({
  baseURL: `http://${window.location.hostname}:3000`,
  headers: {
    Authorization: `Bearer ${generateHeader()}`
  }
})

const router = createBrowserRouter([
  // {
  //   path: '/',
  //   element: <
  // },
  {
    path: "/",
    // path: "/login",
    element: <Login axios={axios} />,
  },
  {
    path: '/signup',
    element: <Signup axios={axios} />
  },
  {
    path: 'home',
    element: <Home axios={axios} />
  }
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
