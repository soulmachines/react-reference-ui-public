import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { sendTextMessage } from '../../store/sm/index';

const Options = ({ data, dispatchTextFromData }) => {
  const { options } = data;
  const optionsDisplay = options.map(({ label, value }) => (
    <button type="button" className="list-group-item list-group-item-action" data-trigger-text={value} onClick={dispatchTextFromData}>
      {label}
    </button>
  ));
  return (
    <div className="list-group">
      {optionsDisplay}
    </div>
  );
};

Options.propTypes = {
  data: PropTypes.shape({
    options: PropTypes.shape([
      PropTypes.shape({
        label: PropTypes.string,
      }),
    ]),
  }).isRequired,
  dispatchTextFromData: PropTypes.func.isRequired,
};

const mapDispatchToProps = (dispatch) => ({
  dispatchTextFromData: (e) => dispatch(sendTextMessage({ text: e.target.dataset.triggerText })),
});

export default connect(null, mapDispatchToProps)(Options);
