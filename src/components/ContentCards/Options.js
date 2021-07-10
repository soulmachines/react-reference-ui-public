import React from 'react';
import { connect } from 'react-redux';
import { sendTextMessage } from '../../store/sm/index';

const Options = ({ data, dispatchTextFromData }) => {
  const { options } = data;
  const optionsDisplay = options.map(({ label, value }) => (
    <button type="button" className="list-group-item list-group-item-action" data-trigger-text={value} onClick={dispatchTextFromData}>
      {label}
    </button>
  ));
  return (
    <div className="list-group m-2">
      {optionsDisplay}
    </div>
  );
};

const mapDispatchToProps = (dispatch) => ({
  dispatchTextFromData: (e) => dispatch(sendTextMessage({ text: e.target.dataset.triggerText })),
});

export default connect(null, mapDispatchToProps)(Options);
