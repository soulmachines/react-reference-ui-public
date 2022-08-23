import React from 'react';
import PropTypes from 'prop-types';

function Image({ data }) {
  const { url, alt, caption } = data;
  return (
    <div style={{ width: 'auto', maxWidth: '100%' }}>
      <img src={url} alt={alt} style={{ width: '100%', height: 'auto' }} />
      {
        caption ? <div className="text-center mt-1">{caption}</div> : null
      }
    </div>
  );
}

Image.propTypes = {
  data: PropTypes.shape({
    url: PropTypes.string,
    alt: PropTypes.string,
    caption: PropTypes.string,
  }).isRequired,
};

export default Image;
