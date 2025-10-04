import DefaultLayout from '../Layouts/DefaultLayout';
import HomePage from '../Pages/Home';
import NotFound from '../Pages/NotFound';
import Login from '../Pages/Login';
import Register from '../Pages/Register';
import ProfilePage from '../Pages/Profile';
import InformationProfile from '../Pages/Profile/information';
import InfoRooms from '../Pages/Profile/rooms';
import RoomDetail from '../Pages/RoomDetail';
import FavoritePage from '../Pages/Favorite';
import AdminLayout from './../Layouts/AdminLayout';
import ManagerUsers from '../Pages/Admin/ManagerUsers';
import CreateRoomPage from './../Pages/Admin/Rooms/CreateRooms';
import ManagerRoomPage from '../Pages/Admin/Rooms/ManagerRooms';

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
      {
        path: '/profile/:tabKey',
        element: <ProfilePage />,
      },
      {
        path: '/profile',
        element: <InformationProfile />,
      },
      {
        path: '/profile',
        element: <InfoRooms />,
      },
      {
        path: '/rooms/:id',
        element: <RoomDetail />,
      },
      {
        path: '/favorite',
        element: <FavoritePage />,
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
      {
        path: '/admin/create-room',
        element: <CreateRoomPage />,
      },
      {
        path: '/admin/manager-rooms',
        element: <ManagerRoomPage />,
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
