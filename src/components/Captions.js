import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';

const Captions = ({ speechState, lastPersonaUtterance, className }) => {
  const [showCaptions, setShowCaptions] = useState(false);
  // if we have a very long response, we need to cycle the displayed content
  const [captionText, setCaptionText] = useState('');
  // keep track of when we first showed this caption. captions should be on screen min 1.5s
  const [captionStartTimestamp, setCaptionStartTimestamp] = useState();
  const [captionTimeout, setCaptionsTimeout] = useState();
  const minCaptionDuration = 1500;

  useEffect(() => {
    if (speechState === 'speaking') {
      // when a new utterance starts:
      // show captions
      setShowCaptions(true);
      const sentences = lastPersonaUtterance.split('. ');
      const sentencesWithDurationEstimate = sentences.map((s) => {
        const letterCount = s.split('').length;
        const millisPerLetter = 100;
        const durationEstimate = letterCount * millisPerLetter;
        return { text: s, durationEstimate };
      });

      const displayCaption = (i) => {
        const { text, durationEstimate } = sentencesWithDurationEstimate[i];
        setCaptionText(text);
        if (sentencesWithDurationEstimate[i + 1]) {
          setTimeout(() => displayCaption(i + 1), durationEstimate);
        }
      };
      displayCaption(0);

      // record when we put captions on the screen
      setCaptionStartTimestamp(Date.now());
      // clear any previous timeout from previous captions.
      // this won't make the captions dissapear, since we're overwriting the content
      clearTimeout(captionTimeout);
    } else {
      // when the utterance ends:
      const captionsDisplayedFor = Date.now() - captionStartTimestamp;
      // check to see if the captions have been displayed for the min. amount of time
      if (captionsDisplayedFor > minCaptionDuration) setShowCaptions(false);
      // if not, set a timeout to hide them when it has elapsed
      else {
        const newCaptionTimeout = setTimeout(() => {
          setShowCaptions(false);
        }, minCaptionDuration - captionsDisplayedFor);
        setCaptionsTimeout(newCaptionTimeout);
      }
    }
  }, [speechState]);

  return (
    <div className={`${className} ${showCaptions ? '' : 'd-none '}`}>
      { captionText }
    </div>
  );
};

Captions.propTypes = {
  speechState: PropTypes.string.isRequired,
  lastPersonaUtterance: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
};

const StyledCaptions = styled(Captions)`
  margin-bottom: 1rem;

  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;

  background-color: rgba(0, 0, 0, 0.5);
  color: #FFF;

  border-radius: 2px;
`;

const mapStateToProps = (state) => ({
  speechState: state.sm.speechState,
  lastPersonaUtterance: state.sm.lastPersonaUtterance,
});

export default connect(mapStateToProps)(StyledCaptions);
