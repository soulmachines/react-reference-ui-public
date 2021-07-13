import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { mediaStreamProxy } from '../proxyVideo';

const CameraPreview = ({ connected, className }) => {
  const videoRef = React.createRef();
  const stream = mediaStreamProxy.getUserMediaStream();
  const [aspectRatio, setAspectRatio] = useState(1);
  useEffect(() => {
    if (stream !== null) {
      videoRef.current.srcObject = stream;
      // compute aspect ratio of video, constrain elem size to value
      const { width, height } = stream.getVideoTracks()[0].getSettings();
      setAspectRatio(width / height);
    }
  }, [connected]);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        muted
        autoPlay
        playsInline
        style={{ aspectRatio }}
      />
    </div>
  );
};

CameraPreview.propTypes = {
  connected: PropTypes.bool.isRequired,
  className: PropTypes.string.isRequired,
};

const StyledCameraPreview = styled(CameraPreview)`
  video {
    /* accepts numeric value for size that dictates height of video elem */
    height: ${({ size }) => size || 4}rem;
    transform: rotateY(180deg);
  }
`;

const mapStateToProps = ({ sm }) => ({
  connected: sm.connected,
});

export default connect(mapStateToProps)(StyledCameraPreview);
