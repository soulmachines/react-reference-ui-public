import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { mute, sendTextMessage, setActiveCards } from '../../store/sm/index';


const Video = ({
  data,
  className,
  isMuted,
  dispatchMute,
  dispatchTextMessage,
  dispatchHideCards,
}) => {
  const { videoId, autoplay } = data;
  const containerRef = React.createRef();
  const [YTElem, setYTElem] = useState();
  const [fadeOut, setFadeOut] = useState(false);

  const endVideo = () => {
    setFadeOut(true);
    setTimeout(() => {
      dispatchHideCards();
      dispatchTextMessage('I\'m done watching');
    }, 500);
  };

  useEffect(() => {
    // use containerRef to size video embed to elem dimensions
    // assume 16:9 aspect ratio for video
    const { clientWidth: width } = containerRef.current;
    const computedWidth = width * 0.9;
    const computedHeight = computedWidth / (16 / 9);
    const opts = {
      width: computedWidth,
      height: computedHeight,
      playerVars: {
        autoplay: !!autoplay,
        mute: 0,
      },
    };
    const elem = (
      <YouTube
        videoId={videoId}
        opts={opts}
        containerClassName="video-container"
        onEnd={endVideo}
      />
    );
    if (!isMuted) dispatchMute(true);
    setYTElem(elem);
    return () => setYTElem(null);
  }, []);

  return (
    <div ref={containerRef} className={`${className} ${fadeOut === true ? 'fade' : ''}`} key={videoId}>
      <div>
        <div className="row">
          {YTElem}
        </div>
        <div className="row d-flex align-items-center justify-content-between mt-2">
          <span className="text-white text-center text-md-start col-md-auto">
            The Digital Person is paused while you watch this video.
          </span>
          <div className="d-flex col-md-auto justify-content-center mt-2 mt-md-0">
            <button type="button" className="btn btn-outline-light" onClick={endVideo}>I&apos;m done watching</button>
          </div>
        </div>
      </div>
    </div>
  );
};

Video.propTypes = {
  data: PropTypes.shape({
    videoId: PropTypes.string.isRequired,
    autoplay: PropTypes.string,
  }).isRequired,
  className: PropTypes.string.isRequired,
  isMuted: PropTypes.bool.isRequired,
  dispatchMute: PropTypes.func.isRequired,
  dispatchTextMessage: PropTypes.func.isRequired,
  dispatchHideCards: PropTypes.func.isRequired,
};

const mapStateToProps = ({ sm }) => ({
  isMuted: sm.isMuted,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchMute: () => dispatch(mute()),
  dispatchHideCards: () => dispatch(setActiveCards({})),
  dispatchTextMessage: (text) => dispatch(sendTextMessage({ text })),
});

const ConnectedVideo = connect(mapStateToProps, mapDispatchToProps)(Video);

export default styled(ConnectedVideo)`
  position: absolute;
  z-index: 5000;
  left: 0;
  top: 0;

  width: 100%;
  height: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  background: rgba(0,0,0,0.9);
  backdrop-filter: blur(3px);

  .sm-fade {
    transition: opacity 0.5s;
  }
  .sm-fade-out {
    opacity: 0;
  }

  span, button {
    font-size: 1.2rem;
  }

  .video-container {
    display: flex;
    justify-content: center;
  }
`;
