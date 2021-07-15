import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ContentCardSwitch from '../ContentCardSwitch';

const Transcript = ({ className, transcript }) => {
  const transcriptDisplay = transcript.map(({
    source, text, card, timestamp,
  }) => (
    <li key={timestamp} className="list-group-item">
      <span className="source">{card ? '' : `${source}: `}</span>
      {text || null}
      {card
        ? <ContentCardSwitch card={card} index={null} />
        : null}
    </li>
  ));
  return (
    <div className={className}>
      <ul className="list-group transcript-list-group">
        {transcriptDisplay.length > 0 ? transcriptDisplay : (
          <li className="list-group-item">
            No items to show, say something!
          </li>
        ) }
      </ul>
    </div>
  );
};

Transcript.propTypes = {
  className: PropTypes.string.isRequired,
  transcript: PropTypes.arrayOf(PropTypes.shape({
    source: PropTypes.string,
    text: PropTypes.string,
    timestamp: PropTypes.string,
  })).isRequired,
};

const StyledTranscript = styled(Transcript)`
  .transcript-list-group {
    flex-shrink: 1;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .source{
    text-transform: capitalize;
  }
`;

const mapStateToProps = ({ sm }) => ({
  transcript: sm.transcript,
});

export default connect(mapStateToProps)(StyledTranscript);
