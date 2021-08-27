import React from 'react';
import PropTypes from 'prop-types';

const Image = ({ data }) => {
  const { url, alt, id } = data;
  return (
    <div style={{ maxWidth: '100%' }}>
      <img src={url} alt={alt} style={{ width: 'auto', height: 'auto' }} data-sm-content={id} />
    </div>
  );
};

Image.propTypes = {
  data: PropTypes.objectOf({
    url: PropTypes.string.isRequired,
    alt: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
};

export default Image;
