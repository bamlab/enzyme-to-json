import isPlainObject from 'lodash.isplainobject';
import omitBy from 'lodash.omitby';
import entries from 'object.entries';
import {isReactElementAlike} from 'enzyme/build/Utils';
import {typeName} from 'enzyme/build/Debug';
import {childrenOfNode, propsOfNode} from 'enzyme/build/RSTTraversal';
import {compact} from './utils';

function nodeToJson(node) {
  if (!node) {
    return node;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return node;
  }

  if (!isReactElementAlike(node)) {
    if (Array.isArray(node)) {
      return node.map(nodeToJson);
    }

    if (isPlainObject(node)) {
      return entries(node).reduce((obj, [key, val]) => {
        obj[key] = nodeToJson(val);
        return obj;
      }, {});
    } else if (
      node._reactInternalInstance /* && node._reactInternalInstance.constructor && node._reactInternalInstance.constructor.name === "ShallowComponentWrapper" */
    ) {
      return nodeToJson(node._reactInternalInstance._currentElement);
    }

    return node;
  }

  const children = compact(childrenOfNode(node).map(n => nodeToJson(n)));
  const type = typeName(node);
  const props = omitBy(
    propsOfNode(node),
    (val, key) => key === 'children' || val === undefined,
  );

  return {
    type,
    props: nodeToJson(props),
    children: children.length ? children : null,
    $$typeof: Symbol.for('react.test.json'),
  };
}

export default wrapper => {
  return wrapper.length > 1
    ? wrapper.nodes.map(nodeToJson)
    : nodeToJson(wrapper.node);
};
