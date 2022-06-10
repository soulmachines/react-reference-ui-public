import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { sendTextMessage } from '../../store/sm/index';

const Options = ({ data, dispatchTextFromData }) => {
  const { options } = data;
  const optionsDisplay = options.map(({ label, value }) => (
    <button type="button" className="btn primary-accent" data-trigger-text={value} onClick={dispatchTextFromData} key={JSON.stringify({ label, value })}>
      {label}
    </button>
  ));
  return (
    <div className="d-grid gap-2">
      {optionsDisplay}
    </div>
  );
};

Options.propTypes = {
  data: PropTypes.shape({
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })),
  }).isRequired,
  dispatchTextFromData: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchTextFromData: (e) => dispatch(sendTextMessage({ text: e.target.dataset.triggerText })),
});

export default connect(null, mapDispatchToProps)(Options);
