import React from 'react';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';

const Markdown = ({ data }) => {
  const { text } = data;
  return (
    <div className="card" style={{ maxWidth: '20rem' }}>
      <div className="card-body">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
};

Markdown.propTypes = {
  data: PropTypes.objectOf({
    text: PropTypes.string.isRequired,
  }).isRequired,
};

export default Markdown;
