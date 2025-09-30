import React from 'react';
import Icon from '@ant-design/icons';

const ErrorMessageSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
  >
    <g id="alert-circle" clipPath="url(#clip0_8858_32549)">
      <path
        id="Icon"
        d="M9.99935 6.66675V10.0001M9.99935 13.3334H10.0077M18.3327 10.0001C18.3327 14.6025 14.6017 18.3334 9.99935 18.3334C5.39698 18.3334 1.66602 14.6025 1.66602 10.0001C1.66602 5.39771 5.39698 1.66675 9.99935 1.66675C14.6017 1.66675 18.3327 5.39771 18.3327 10.0001Z"
        stroke="#EB5757"
        strokeWidth="1.66667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_8858_32549">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const ErrorMessageIcon = (props) => (
  <Icon component={ErrorMessageSvg} {...props} />
);

export default ErrorMessageIcon;
