const defaults = {
  data: [],
  column: 0,
  minColumns: 2,
  millerClass: 'miller',
  columnClass: 'column',
  rowClass: 'row',
  rows: new Map(),
  columns: [],
};

class Miller {

  constructor(selector, options = {}) {
    this.el = document.querySelector(selector);
    this.options = Object.assign({}, defaults, options);
    this.options.columnSize = this.options.columnSize || this.options.data.length;
    this.init();
  }

  static isLeaf(row) {
    return (typeof row[Symbol.iterator] !== 'function' || typeof row === 'string') && typeof row !== 'object';
  }

  static isEmptyColumn(column) {
    return !!column.children.length;
  }

  static createOption(row, id, className) {
    const option = document.createElement('option');
    option.setAttribute('id', id);
    option.setAttribute('value', row);
    option.setAttribute('class', className);
    option.innerText = row;
    return option;
  }

  init() {
    this.el.setAttribute('class', this.options.millerClass);
    for (let i = 0; i < this.options.minColumns; i++) {
      this.options.columns.push(this.addColumn());
    }

    this.insertRows(this.options.data, this.options.columns[0]);
  }

  addColumn() {
    const select = document.createElement('select');
    select.setAttribute('id', `column-${this.options.column}`);
    select.setAttribute('size', this.options.columnSize);
    select.setAttribute('class', this.options.columnClass);
    select.addEventListener('change', this.selectRow.bind(this));
    this.el.appendChild(select);
    this.options.column += 1;
    return select;
  }

  removeColumns(columns) {
    columns.forEach((column) => {
      this.el.removeChild(column);
      this.options.column -= 1;
    });
  }

  addRow(row, select) {
    if (Miller.isLeaf(row)) {
      const option = Miller.createOption(row, `${select.id}-row-${select.children.length}`, this.options.rowClass);
      select.appendChild(option);
      this.options.rows.set(option.id, row);
    } else if (typeof row === 'object') {
      const option = Miller.createOption(row.parent, `${select.id}-row-${select.children.length}`, this.options.rowClass);
      select.appendChild(option);
      this.options.rows.set(option.id, row);
    }
  }

  insertRows(rows, column) {
    rows.forEach((row) => {
      this.addRow(row, column);
    });
  }

  selectRow(e) {
    e && e.stopPropagation() && e.preventDefault();
    const select = e.currentTarget;
    const option = select.options[select.selectedIndex];
    const row = this.options.rows.get(option.id);
    const columnID = parseInt(select.id.substr(-1));
    this.updateColumns(row, columnID);
  }

  updateColumns(row, columnID) {
    if (Miller.isLeaf(row)) {
      this.removeColumns(this.options.columns.splice(columnID + 1));
      if (this.options.columns.length < this.options.minColumns) {
        this.options.columns.push(this.addColumn());
      }
    } else if (typeof row === 'object') {
      const last = this.options.columns.length - 1;
      if (!Miller.isEmptyColumn(this.options.columns[last])) {
        this.insertRows(row.children, this.options.columns[last]);
      } else {
        this.removeColumns(this.options.columns.splice(columnID + 1));
        const column = this.addColumn();
        this.insertRows(row.children, column);
        this.options.columns.push(column);
      }
    }
  }
}

export default Miller;
