// @ts-nocheck
const typeOf = (o) => Object.prototype.toString.call(o);
const isObject = (o) =>
  o !== null &&
  !Array.isArray(o) &&
  typeOf(o).split(' ')[1].slice(0, -1) === 'Object';

const isPrimitive = (o) => {
  switch (typeof o) {
    case 'object': {
      return false;
    }
    case 'function': {
      return false;
    }
    default: {
      return true;
    }
  }
};
export const getChanges = (previous, current) => {
  if (isPrimitive(previous) && isPrimitive(current)) {
    if (previous === current) {
      return '';
    }

    return current;
  }

  if (isObject(previous) && isObject(current)) {
    const diff = getChanges(Object.entries(previous), Object.entries(current));

    return diff.reduce((merged, [key, value]) => {
      return {
        ...merged,
        [key]: value,
      };
    }, {});
  }

  const changes = [];

  if (JSON.stringify(previous) === JSON.stringify(current)) {
    return changes;
  }

  for (let i = 0; i < current.length; i++) {
    const item = current[i];

    if (JSON.stringify(item) !== JSON.stringify(previous[i])) {
      changes.push(item);
    }
  }

  return changes;
};
