import './styles/miller.scss';
import Miller from './miller';

document.onreadystatechange = () => {
  if (document.readyState === 'complete') {
    /* eslint-disable no-new */
    const set = new Set([4, 6, 9999999]);
    new Miller('#miller', {
      data: ['one', 'two', 'three', 'one', 'three', 'one', 'two', 'three', 'one', 'two', 'three', {
        parent: 'cuatro',
        children: [1, {
          parent: 'list',
          children: ['two', 'three', 'one', 'two', 'three', 'one', 'two', 'three', 'one', 'two', {
            parent: 2,
            children: [2.2, { parent: 2.3, children: set }]
          }, 2.7, 2.9]
        }, 3]
      }],
      minColumns: 2,
    });
  }
};
