import React from 'react';
import PropTypes from 'prop-types';

const Image = ({ data }) => {
  const { url, alt } = data;
  return (
    <div style={{ width: 'auto', maxWidth: '100%' }}>
      <img src={url} alt={alt} style={{ width: '100%', height: 'auto' }} />
    </div>
  );
};

Image.propTypes = {
  data: PropTypes.shape({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }).isRequired,
};

export default Image;
