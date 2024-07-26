import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";

const NotFound = ({ width = 164, height = 117 }) => {
  const theme = useTheme();
  const colorPrimaryMain = theme.palette.primary.main;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      fill="none"
      viewBox="0 0 164 117"
    >
      <path
        fill="#E6E6E6"
        d="M27.924 49.365c-13.83 2.455-23.605 14.5-22 27.715.855 7 4.32 13.215 13.235 15 23.65 4.755 112.925 22.655 130.465-8.36 13.675-24.17 5.525-40.905-7.175-51.38-12.7-10.475-39-8.3-60.765-1.13-16.185 5.345-28.22 13.615-53.76 18.155z"
        opacity="0.3"
      ></path>
      <path
        fill="#E6E6E6"
        d="M82.8 116.961c44.464 0 80.509-2.664 80.509-5.95 0-3.287-36.045-5.95-80.51-5.95-44.464 0-80.51 2.663-80.51 5.95 0 3.286 36.046 5.95 80.51 5.95z"
        opacity="0.45"
      ></path>
      <path
        fill="#FFD200"
        d="M37.66 28.4a9.57 9.57 0 100-19.14 9.57 9.57 0 000 19.14z"
      ></path>
      <path
        fill="#FFD200"
        d="M37.66 37.076c10.076 0 18.244-8.169 18.244-18.245S47.735.586 37.66.586 19.414 8.754 19.414 18.83c0 10.076 8.169 18.245 18.245 18.245z"
        opacity="0.15"
      ></path>
      <path
        fill="#245B5B"
        d="M77.845 110.734c14.13 0 25.585-11.454 25.585-25.584 0-14.13-11.455-25.586-25.585-25.586S52.26 71.02 52.26 85.15c0 14.13 11.455 25.584 25.585 25.584z"
      ></path>
      <path
        fill="#fff"
        d="M77.845 101.255c8.895 0 16.105-7.21 16.105-16.105s-7.21-16.105-16.105-16.105c-8.894 0-16.105 7.21-16.105 16.105 0 8.894 7.21 16.105 16.105 16.105z"
      ></path>
      <path
        fill={colorPrimaryMain}
        d="M46.955 91.255c1.695 0 2.305.61 2.305 2.3v2.915c0 1.695-.5 2.305-2.305 2.305H42.28v8.875c0 1.69-.61 2.3-2.305 2.3h-3.32c-1.69 0-2.3-.61-2.3-2.3v-8.875H12c-1.69 0-2.3-.61-2.3-2.305v-2.44a4.5 4.5 0 01.8-2.775L33 63.34a4.035 4.035 0 013.25-1.625H40c1.695 0 2.305.475 2.305 2.305v27.235h4.65zm-12.6-18.16L19.65 91.255h14.705v-18.16zM143.709 91.255c1.695 0 2.305.61 2.305 2.3v2.915c0 1.695-.475 2.305-2.305 2.305h-4.675v8.875c0 1.69-.61 2.3-2.305 2.3h-3.32c-1.69 0-2.3-.61-2.3-2.3v-8.875h-22.36c-1.69 0-2.3-.61-2.3-2.305v-2.44a4.509 4.509 0 01.81-2.775l22.5-27.915a4.04 4.04 0 013.25-1.625h3.725c1.695 0 2.305.475 2.305 2.305v27.235h4.67zm-12.6-18.16l-14.705 18.16h14.705v-18.16z"
      ></path>
      <path
        fill={colorPrimaryMain}
        d="M133.674 56.265s-4.255-1.16-5.18-5.125c0 0 6.595-1.33 6.785 5.475l-1.605-.35z"
        opacity="0.58"
      ></path>
      <path
        fill={colorPrimaryMain}
        d="M134.199 55.844s-2.975-4.705-.36-9.1c0 0 5 3.185 2.79 9.11l-2.43-.01z"
        opacity="0.73"
      ></path>
      <path
        fill={colorPrimaryMain}
        d="M134.965 55.85s1.57-4.97 6.325-5.91c0 0 .89 3.224-3.08 5.92l-3.245-.01z"
      ></path>
      <path
        fill="#245B5B"
        d="M131.881 55.734l.86 5.905 5.435.025.8-5.9-7.095-.03z"
      ></path>
      <path
        fill="#F4A28C"
        d="M80.94 51.556s.7 3.375.395 5.715a1.73 1.73 0 01-1.955 1.5c-1.175-.17-2.715-.74-3.31-2.5l-1.38-2.875a3.105 3.105 0 01.965-3.45c1.77-1.63 4.96-.445 5.285 1.61z"
      ></path>
      <path
        fill="#F4A28C"
        d="M74.94 53.9l-.45 11.305 6.245-.2-2.18-8.145-3.615-2.96z"
      ></path>
      <path
        fill="#245B5B"
        d="M80.105 51.796a13.688 13.688 0 01-3.185.135 2.88 2.88 0 01.37 3.135 2.34 2.34 0 01-2.7 1.26l-.465-4.41a3.499 3.499 0 011.4-3.32c.44-.33.903-.629 1.385-.895 1.205-.66 3.16-.035 4.195-1.025a.834.834 0 011.375.39c.36 1.315.37 3.45-1.355 4.395a3.183 3.183 0 01-1.02.335z"
      ></path>
      <path
        fill="#F4A28C"
        d="M77.645 54.92s-.18-1.32-1.16-1.1c-.98.22-.73 2.125.64 2.14l.52-1.04zM81.27 53.705l1.114 1.205a.555.555 0 01-.245.905l-1.28.4.41-2.51z"
      ></path>
      <path
        fill="#CE8172"
        d="M79.11 58.624a4.121 4.121 0 01-2.15-.96s.33 2.045 2.83 3.805l-.68-2.845z"
        opacity="0.31"
      ></path>
      <path
        fill={colorPrimaryMain}
        d="M74.5 65.205l6.244-.2s9.81-1.665 13.215 6.335c3.405 8-.96 19.305-.96 19.305s-3.55 11.935-18.5 10.615c0 0-12.435-.72-13.84-17.765a16.623 16.623 0 00-.34-2.21c-.57-2.665-.9-10.75 14.18-16.08z"
      ></path>
      <path
        fill="#000"
        d="M66.135 75.824s3.33.365 7.955 8.11c4.625 7.745 13.705 4.905 18.825-.825l-9.5 12.57-10.64-.855-5.785-15.4-.855-3.6z"
        opacity="0.08"
      ></path>
      <path
        fill="#FFD200"
        d="M102.6 57.898l-1.829.245.712 5.322 1.828-.244-.711-5.323z"
      ></path>
      <path
        fill="#000"
        d="M102.6 57.898l-1.829.245.712 5.322 1.828-.244-.711-5.323z"
        opacity="0.08"
      ></path>
      <path
        fill="#245B5B"
        d="M103.628 61.675l-2.81.376.913 6.834 2.81-.375-.913-6.835z"
      ></path>
      <path
        fill="#FFD200"
        d="M100.001 46.886a6.05 6.05 0 101.606 11.993A6.05 6.05 0 00100 46.886zm1.37 10.23a4.275 4.275 0 112.83-1.65 4.279 4.279 0 01-2.81 1.65h-.02z"
      ></path>
      <path
        fill="#fff"
        d="M100.834 57.196a4.295 4.295 0 100-8.59 4.295 4.295 0 000 8.59z"
      ></path>
      <path
        fill={colorPrimaryMain}
        d="M60.5 76.665a3.09 3.09 0 015.626-.84 70.818 70.818 0 016 12.195C75.7 97.55 93.23 91.265 99.7 69.045l3.69 2.295s-5.09 28.86-25.58 29.92c0 0-12.79 2.59-16.675-13.105 0 0-1-2.955-1.06-4.625l-.27-1.88c-.042-1.67.181-3.335.66-4.935l.035-.05z"
      ></path>
      <path
        fill="#fff"
        d="M60.5 76.665a3.09 3.09 0 015.626-.84 70.818 70.818 0 016 12.195C75.7 97.55 93.23 91.265 99.7 69.045l3.69 2.295s-5.09 28.86-25.58 29.92c0 0-12.79 2.59-16.675-13.105 0 0-1-2.955-1.06-4.625l-.27-1.88c-.042-1.67.181-3.335.66-4.935l.035-.05z"
        opacity="0.39"
      ></path>
      <path
        fill="#F4A28C"
        d="M100.635 69.604s.375-4.755 2.335-4.745c1.96.01 6.565 3.53-.545 5.855l-1.79-1.11z"
      ></path>
      <path
        fill="#E6E6E6"
        d="M151.745 33.3a3.38 3.38 0 00-3.925-3.334 4.55 4.55 0 00-4-2.4h-.165a5.403 5.403 0 00-.987-4.638 5.408 5.408 0 00-6.634-1.531 5.414 5.414 0 00-2.879 6.169h-.165a4.56 4.56 0 100 9.115h15.815v-.03a3.382 3.382 0 002.94-3.35zM20.35 66.754a2.9 2.9 0 00-2.9-2.9 3.5 3.5 0 00-.464.04 3.905 3.905 0 00-3.445-2.054h-.14a4.639 4.639 0 10-9 0h-.14a3.91 3.91 0 100 7.814h13.565v-.025a2.904 2.904 0 002.525-2.875z"
      ></path>
    </svg>
  );
};

NotFound.propTypes = {
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default NotFound;
