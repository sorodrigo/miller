import './styles/miller.scss';
import Miller from './miller';

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    /* eslint-disable no-new */
    const set = new Set([4, 6, 9999999]);
    new Miller('#miller', {
      data: {
        one: 1,
        two: { a: { as: 'A' }, b: { baz: 'B' } },
        three: 3,
        four: set,
        five: { parent: 'dsds', children: ['a', 'b', 'c'] },
        array: [1, 2, 3]
      },
    });
  }
};

/**
 ['one', 'two', 'three', 'two', 'three', 'one', 'two', 'three', {
        parent: 'cuatro',
        children: [1, {
          parent: 'list',
          children: ['two', 'three', 'one', 'two', 'three', 'one', 'two', 'three', 'one', 'two', {
            parent: 2,
            children: [2.2, { parent: 2.3, children: set }]
          }, 2.7, 2.9]
        }, 3]
      }]

 { one: 1, two: 2, three: 3, four: set, five: { parent: 'dsds',
 subarray: ['a', 'b', 'c'] }, array: [1, 2, 3] }

 [1, 2, 3, 4, 5, ['a', 'b', 'c'], { one: 1, two: 2, three: 3 }]
 */
