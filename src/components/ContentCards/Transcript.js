import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import ContentCardSwitch from '../ContentCardSwitch';

const Transcript = ({ className, transcript }) => {
  const transcriptDisplay = transcript.map(({
    source, text, card, timestamp,
  }) => {
    // we don't want to wrap cards in a bubble, return as is w/ a key added
    if (card) return <ContentCardSwitch card={card} index={null} key={timestamp} />;
    return (
      <div key={timestamp} className={`transcript-entry ${source === 'user' ? 'transcript-entry-user' : ''}`}>
        <div className="transcript-entry-content">
          {text || null}
        </div>
      </div>
    );
  });

  // scroll to bottom of transcript whenever it updates
  let scrollRef;
  const [isMounting, setIsMounting] = useState(true);
  useEffect(() => {
    scrollRef.scrollIntoView({ behavior: isMounting ? 'instant' : 'smooth' });
    setIsMounting(false);
  }, [transcript]);

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
        <div ref={(el) => { scrollRef = el; }} />
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
    padding: 0.5rem 0.8rem 0.5rem 0.8rem;
    width: fit-content;
    background: #FFFFFF;
    border-radius: 1.1rem;
  }

  .transcript-entry-user {
    float: right;
    flex-direction:  row-reverse;
    .transcript-entry-content {
      background: #0d6efd;
      color: #FFFFFF;
    }
  }
`;

const mapStateToProps = ({ sm }) => ({
  transcript: sm.transcript,
});

export default connect(mapStateToProps)(StyledTranscript);
