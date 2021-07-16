import React from 'react';
import PropTypes from 'prop-types';

const Image = ({ data }) => {
  const { url, alt } = data;
  return (
    <div style={{ maxWidth: '100%' }}>
      <img src={url} alt={alt} style={{ width: 'auto', height: 'auto' }} />
    </div>
  );
};

Image.propTypes = {
  data: PropTypes.objectOf({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
  }).isRequired,
};

export default Image;
