import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { setActiveCards, animateCamera } from '../store/sm/index';
import { calculateCameraPosition } from '../utils/camera';
import Transcript from './ContentCards/Transcript';
import ContentCardSwitch from './ContentCardSwitch';

const ContentCardDisplay = ({
  activeCards, dispatchAnimateCamera, videoWidth, videoHeight, showTranscript, className,
}) => {
  if (!activeCards) return null;
  const CardDisplay = activeCards.map((c, index) => (
    <div className="m-2" key={JSON.stringify(c)}>
      <ContentCardSwitch card={c} index={index} />
    </div>
  ));

  if (activeCards.length > 0 || showTranscript === true) {
    dispatchAnimateCamera(calculateCameraPosition(videoWidth, videoHeight, 0.7));
  } else dispatchAnimateCamera(calculateCameraPosition(videoWidth, videoHeight, 0.5));

  return (
    <div className={className}>
      { showTranscript ? <Transcript /> : CardDisplay }
    </div>
  );
};

ContentCardDisplay.propTypes = {
  activeCards: PropTypes.arrayOf(PropTypes.object).isRequired,
  dispatchAnimateCamera: PropTypes.func.isRequired,
  videoWidth: PropTypes.number.isRequired,
  videoHeight: PropTypes.number.isRequired,
  showTranscript: PropTypes.bool.isRequired,
};

const StyledContentCardDisplay = styled(ContentCardDisplay)`
  max-height: 100%;
  width: 100%;
`;

const mapStateToProps = ({ sm }) => ({
  activeCards: sm.activeCards,
  videoWidth: sm.videoWidth,
  videoHeight: sm.videoHeight,
  showTranscript: sm.showTranscript,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchActiveCards: (activeCards) => dispatch(
    setActiveCards({ activeCards, cardsAreStale: true }),
  ),
  dispatchAnimateCamera: (options, duration = 1) => dispatch(animateCamera({ options, duration })),
});

export default connect(mapStateToProps, mapDispatchToProps)(StyledContentCardDisplay);
