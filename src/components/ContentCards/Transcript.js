import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ContentCardSwitch from '../ContentCardSwitch';

const Transcript = ({ className, transcript }) => {
  const transcriptDisplay = transcript.map(({
    source, text, card, timestamp,
  }) => (
    <div key={timestamp} className={`transcript-entry ${source === 'user' ? 'transcript-entry-user' : ''}`}>
      <div>
        <div className={`source ${source === 'user' ? 'source-user' : ''}`}>{source[0]}</div>
      </div>
      <div className="transcript-entry-content">
        {text || null}
        {card
          ? <ContentCardSwitch card={card} index={null} />
          : null}
      </div>
    </div>
  ));
  return (
    <div className={className}>
      <div className="transcript-list-group">
        {transcriptDisplay.length > 0
          ? transcriptDisplay
          : (
            <li className="list-group-item">
              No items to show, say something!
            </li>
          )}
      </div>
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
    width: 100%;
  .transcript-list-group {
    flex-shrink: 1;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  .transcript-entry {
    clear: both;
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
  }

  .transcript-entry-content {
    padding: 0.3rem 0.5rem 0.3rem 0.5rem;
    width: fit-content;
    background: #FFFFFF;
    border-radius: 3px;
  }

  .transcript-entry-user {
    float: right;
    flex-direction:  row-reverse;
    .transcript-entry-content {
      background: #0d6efd;
      color: #FFFFFF;
    }
  }

  .source{
    text-transform: capitalize;
    background: #343a40;
    color: #FFFFFF;
    aspect-ratio: 1;
    width: 3rem;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1.5rem;
    margin-right: 0.6rem;
  }
  .source-user {
    margin-right: 0;
    margin-left: 0.6rem;
  }
`;

const mapStateToProps = ({ sm }) => ({
  transcript: sm.transcript,
});

export default connect(mapStateToProps)(StyledTranscript);
