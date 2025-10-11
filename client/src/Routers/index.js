import DefaultLayout from '../Layouts/DefaultLayout';
import HomePage from '../Pages/Home';
import NotFound from '../Pages/NotFound';
import Login from '../Pages/Login';
import Register from '../Pages/Register';
import ForgotPassword from '../Pages/ForgotPassword';
import ProfilePage from '../Pages/Profile';
import RoomsPage from '../Pages/Rooms';
import PaymentPage from '../Pages/Payment';
import PaymentSuccess from '../Pages/PaymentSuccess';
import PaymentCancel from '../Pages/PaymentCancel';
import SearchPage from '../Pages/Search';
import InformationProfile from '../Pages/Profile/information';
import InfoRooms from '../Pages/Profile/rooms';
import RoomDetail from '../Pages/RoomDetail';
import FavoritePage from '../Pages/Favorite';
import AdminLayout from './../Layouts/AdminLayout';
import ManagerUsers from '../Pages/Admin/ManagerUsers';
import CreateRoomPage from './../Pages/Admin/Rooms/CreateRooms';
import ManagerRoomPage from '../Pages/Admin/Rooms/ManagerRooms';
import ManagerBookedRooms from '../Pages/Admin/Rooms/ManagerBookedRooms';

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
      {
        path: '/rooms',
        element: <RoomsPage />,
      },
      {
        path: '/search',
        element: <SearchPage />,
      },
      {
        path: '/payment/:id',
        element: <PaymentPage />,
      },
      {
        path: '/payment/success',
        element: <PaymentSuccess />,
      },
      {
        path: '/payment/cancel',
        element: <PaymentCancel />,
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
      {
        path: '/admin/manager-booked-rooms',
        element: <ManagerBookedRooms />,
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
    path: '/forgot-password',
    element: <ForgotPassword />,
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
