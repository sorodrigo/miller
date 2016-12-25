
const defaults = {
  rows: [],
  column: 0,
};

class Miller {


  constructor(selector, options = {}) {
    this.el = document.querySelector(selector);
    this.options = Object.assign({}, defaults, options);
    this.options.columnSize = this.options.columnSize || this.options.rows.length;
    this.addColumn(this.options.rows);
  }

  addColumn(rows) {
    const select = document.createElement('select');
    select.setAttribute('id', `column-${this.options.column}`);
    select.setAttribute('size', this.options.columnSize);
    this.el.appendChild(select);
    this.options.column += 1;
    rows.forEach((row) => {
      this.addRow(row, select);
    });
  }

  addRow(row, select) {
    const option = document.createElement('option');
    if ((typeof row[Symbol.iterator] !== 'function' || typeof row === 'string') && typeof row !== 'object') {
      option.setAttribute('value', row);
      option.innerHTML = row;
      select.appendChild(option);
    } else if (typeof row === 'object') {
      option.setAttribute('value', row.parent);
      option.innerHTML = row.parent;
      select.appendChild(option);
      this.addColumn(row.children);
    }
  }
}

export default Miller;
