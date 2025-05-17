import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router'
import App from './App';
import { ToastContainer } from 'react-toastify';

const router = createBrowserRouter([
  {
    path: "/",
    element: <> <ToastContainer/> <Outlet/></>,
    children: [
      {
        path: "",
        element: <App />
      },
      {
        path: "tasks",
      }
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router}>
  </RouterProvider>
)
