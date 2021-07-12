import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { setActiveCards, animateCamera } from '../store/sm/index';
import { calculateCameraPosition } from '../utils/camera';
import Options from './ContentCards/Options';
import Markdown from './ContentCards/Markdown';
import Link from './ContentCards/Link';

const ContentCardDisplay = ({
  activeCards, dispatchActiveCards, dispatchAnimateCamera, videoWidth, videoHeight,
}) => {
  const componentMap = {
    options: {
      element: Options,
      removeOnClick: true,
    },
    markdown: {
      element: Markdown,
      removeOnClick: false,
    },
    externalLink: {
      element: Link,
      removeOnClick: false,
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
        key={JSON.stringify(data)}
      >
        {/* elements that are interactive but shouldn't be removed immediately
         can use triggerRemoval to have the card removed */}
        <Element data={data} triggerRemoval={removeElem} />
      </div>
    );
    return elem;
  });

  if (activeCards.length > 0) {
    dispatchAnimateCamera(calculateCameraPosition(videoWidth, videoHeight, 0.7));
  } else dispatchAnimateCamera(calculateCameraPosition(videoWidth, videoHeight, 0.5));

  return (
    <div className="col-5">
      {CardDisplay}
    </div>
  );
};

ContentCardDisplay.propTypes = {
  activeCards: PropTypes.arrayOf({
    component: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
  }).isRequired,
  dispatchActiveCards: PropTypes.func.isRequired,
  dispatchAnimateCamera: PropTypes.func.isRequired,
  videoWidth: PropTypes.number.isRequired,
  videoHeight: PropTypes.number.isRequired,
};

const mapStateToProps = ({ sm }) => ({
  activeCards: sm.activeCards,
  videoWidth: sm.videoWidth,
  videoHeight: sm.videoHeight,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchActiveCards: (activeCards) => dispatch(
    setActiveCards({ activeCards, cardsAreStale: true }),
  ),
  dispatchAnimateCamera: (options, duration = 1) => dispatch(animateCamera({ options, duration })),
});

export default connect(mapStateToProps, mapDispatchToProps)(ContentCardDisplay);
