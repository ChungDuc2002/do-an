import React, { useEffect } from 'react';
import './style.scss';

const NotFound = () => {
  useEffect(() => {
    document.title = '404 - Not Found';
  }, []);
  return (
    <div className="wrapper-not-found">
      {' '}
      <h1>404</h1>
      <h3>Not Found !</h3>
      <p>The requested resource could not be found in this server!</p>
    </div>
  );
};

export default NotFound;
