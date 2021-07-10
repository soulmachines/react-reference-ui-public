import React from 'react';
import { connect } from 'react-redux';
import Options from './ContentCards/Options';
import { setActiveCards } from '../store/sm/index';

const ContentCardDisplay = ({ activeCards, dispatchActiveCards }) => {
  const componentMap = {
    options: {
      element: Options,
      removeOnClick: true,
    },
  };
  const CardDisplay = activeCards.map((c, index) => {
    const { component: componentName, data } = c;
    if (componentName in componentMap === false) {
      const errMsg = `component ${componentName} not found in componentMap!`;
      console.error(errMsg);
      return <div className="alert alert-danger">{errMsg}</div>;
    }
    const { element: Element, removeOnClick } = componentMap[componentName];
    // for some cards, we want them to be hidden after the user interacts w/ them
    // for others, we don't
    const removeElem = (e) => {
      // we need to write our own handler, since this is not an interactive element by default
      if (e.type === 'click' || e.code === 'enter') {
        const newActiveCards = [...activeCards.slice(0, index), ...activeCards.slice(index + 1)];
        dispatchActiveCards(newActiveCards);
      }
    };
    const elem = (
      // disable no static element interactions bc if removeOnClick is true,
      // elem should have interactive children
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        onClick={removeOnClick ? removeElem : null}
        onKeyPress={removeOnClick ? removeElem : null}
      >
        {/* elements that are interactive but shouldn't be removed immediately
         can use triggerRemoval to have the card removed */}
        <Element data={data} triggerRemoval={removeElem} />
      </div>
    );
    return elem;
  });
  return (
    <div className="col-5">
      {CardDisplay}
    </div>
  );
};

const mapStateToProps = ({ sm }) => ({
  activeCards: sm.activeCards,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchActiveCards: (activeCards) => dispatch(
    setActiveCards({ activeCards, cardsAreStale: true }),
  ),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContentCardDisplay);
