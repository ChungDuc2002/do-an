import DefaultLayout from '../Layouts/DefaultLayout';
import HomePage from '../Pages/Home';
import NotFound from '../Pages/NotFound';
import Login from '../Pages/Login';
import Register from '../Pages/Register';
import ForgotPassword from '../Pages/ForgotPassword';
import ProfilePage from '../Pages/Profile';
import RoomsPage from '../Pages/Rooms';
import ContactPage from '../Pages/Contact';
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
import StatisticalPage from '../Pages/Admin/Statistical';
import ManagerContact from './../Pages/Admin/Trang-Chu/ManagerConntact/index';
import ManagerSlider from '../Pages/Admin/Trang-Chu/ManagerBanner';
import ChatBoxPage from '../Pages/Admin/Chat';

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
      {
        path: '/contact',
        element: <ContactPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '/admin',
        element: <StatisticalPage />,
      },
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
      {
        path: '/admin/manager-contact',
        element: <ManagerContact />,
      },
      {
        path: '/admin/manager-banner',
        element: <ManagerSlider />,
      },
      {
        path: '/admin/chat',
        element: <ChatBoxPage />,
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
    path: '*',
    element: <NotFound />,
  },
];

export default InitRouters;
