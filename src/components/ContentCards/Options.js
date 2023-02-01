import React from 'react';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { BoxArrowUpRight } from 'react-bootstrap-icons';
import { sendTextMessage } from '../../store/sm/index';

function Options({
  data, dispatchTextFromData, transcriptIndex, inTranscript,
}) {
  const { options, title } = data;
  const { transcript } = useSelector(({ sm }) => ({ ...sm }));

  const isStaleOptionsCardInTranscript = inTranscript === true
   && transcriptIndex < transcript.length - 1;

  const optionsDisplay = options.map(({ label, value }) => {
    const isLink = value.indexOf('://') > -1;
    if (isLink) {
      return (
        <a
          href={value}
          className="btn primary-accent"
          key={JSON.stringify({ label, value })}
          target="_blank"
          rel="noreferrer"
        >
          {label}
          <BoxArrowUpRight className="ms-2" size={18} />
        </a>
      );
    }
    return (
      <button
        type="button"
        className="btn primary-accent"
        data-trigger-text={value}
        onClick={dispatchTextFromData}
        key={JSON.stringify({ label, value })}
        disabled={isStaleOptionsCardInTranscript}
      >
        {label}
      </button>
    );
  });
  return (
    <div>
      {
        title ? <h3 className="text-center">{title}</h3> : null
      }
      <div className="d-grid gap-2">
        {optionsDisplay}
      </div>
    </div>
  );
}

Options.propTypes = {
  data: PropTypes.shape({
    title: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })),
  }).isRequired,
  dispatchTextFromData: PropTypes.func.isRequired,
  transcriptIndex: PropTypes.number.isRequired,
  inTranscript: PropTypes.bool.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchTextFromData: (e) => dispatch(sendTextMessage({ text: e.target.dataset.triggerText })),
});

export default connect(null, mapDispatchToProps)(Options);
