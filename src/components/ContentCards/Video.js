import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Video = ({ data, className }) => {
  const { videoId, autoplay } = data;
  const containerRef = React.createRef();
  const [embedOpts, setOpts] = useState({ mounted: false });

  useEffect(() => {
    const { clientWidth: width, clientHeight: height } = containerRef.current;
    setOpts({
      mounted: true,
      width,
      height,
      playerVars: {
        autoplay: autoplay || false,
      },
    });
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {embedOpts.mounted ? <YouTube videoId={videoId} opts={embedOpts} containerClassName="video-container" /> : null}
    </div>
  );
};

Video.propTypes = {
  data: PropTypes.objectOf({
    videoId: PropTypes.string.isRequired,
    autoplay: PropTypes.bool,
  }).isRequired,
  className: PropTypes.string.isRequired,
};

export default styled(Video)`
  min-height: 18rem;
  aspect-ratio: 16 / 9;

  .video-container {
    width: 100%;
    height: 100%;
  }
`;
