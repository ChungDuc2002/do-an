import DefaultLayout from '../Layouts/DefaultLayout';
import HomePage from '../Pages/Home';
import NotFound from '../Pages/NotFound';
import Login from '../Pages/Login';
import Register from '../Pages/Register';
import AdminLayout from './../Layouts/AdminLayout/index';
import ManagerUsers from '../Pages/Admin/ManagerUsers';

import CardPage from '../Components/Card';

const InitRouters = [
  {
    path: '/',
    element: <DefaultLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '/admin/manager-users',
        element: <ManagerUsers />,
      },
    ],
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/test',
    element: <CardPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default InitRouters;
