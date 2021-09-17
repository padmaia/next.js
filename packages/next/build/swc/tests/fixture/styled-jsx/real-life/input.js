import React from 'react';

const Component = ({
}) => {
  return (
    <div>
      <style jsx>{`
        @media only screen and (max-device-width: 780px) and (-webkit-min-device-pixel-ratio: 0) {
          button {
            ${inputSize ? 'height: calc(2 * var(--gap)) !important;' : ''}
          }
        }
      `}</style>
    </div>
  );
};