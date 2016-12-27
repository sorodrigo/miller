const defaults = {
  data: null,
  props: {
    parent: 'parent',
    children: 'children',
  },
  column: 0,
  minColumns: 2,
  millerClass: 'miller',
  columnClass: 'column',
  rowClass: 'row',
  parentClass: '-parent',
  rows: new Map(),
  columns: [],
};

class Miller {

  constructor(selector, options = {}) {
    this.el = document.querySelector(selector);
    this.options = Object.assign({}, defaults, options);
    this.options.columnSize = this.options.columnSize || this.getColumnSize();
    this.options.propMode = !Miller.isLeaf(this.options.data);
    this.init();
  }

  static isLeaf(row) {
    return (typeof row[Symbol.iterator] !== 'function' || typeof row === 'string');
  }

  static isEmptyColumn(column) {
    return column && !column.children.length;
  }

  static createOption(id, text, value, className) {
    const option = document.createElement('option');
    option.setAttribute('id', id);
    option.setAttribute('value', value);
    option.setAttribute('class', className);
    option.innerText = text;
    return option;
  }

  init() {
    this.el.setAttribute('class', this.options.millerClass);
    for (let i = 0; i < this.options.minColumns; i++) {
      this.options.columns.push(this.addColumn());
    }

    this.insertRows(this.options.data, this.options.columns[0]);
  }

  getColumnSize() {
    return Miller.isLeaf(this.options.data) ? Object.keys(this.options.data).length
      : this.options.data.length;
  }

  addColumn() {
    const select = document.createElement('select');
    select.setAttribute('id', `column-${this.options.column}`);
    select.setAttribute('size', this.options.columnSize);
    select.setAttribute('class', this.options.columnClass);
    select.setAttribute('tabindex', this.options.column);
    select.addEventListener('change', this.selectRow.bind(this));
    this.el.appendChild(select);
    select.scrollIntoView();
    this.options.column += 1;
    return select;
  }

  removeColumns(columns) {
    columns.forEach((column) => {
      this.el.removeChild(column);
      this.options.column -= 1;
    });
  }

  addRow(text, value, style, select) {
    const computedValue = typeof value === 'object' ? text : value;
    const option = Miller.createOption(`${select.id}-row-${select.children.length}`, text,
      computedValue, style);
    select.appendChild(option);
    this.options.rows.set(option.id, value);
  }

  insertRows(rows, column) {
    const list = Miller.isLeaf(rows) ? Object.entries(rows) : rows;
    list.forEach((row) => {
      if (Miller.isLeaf(row)) {
        if (typeof row === 'object' && this.options.propMode) {
          this.addRow(row[this.options.props.parent], row,
            `${this.options.rowClass} ${this.options.parentClass}`, column);
        } else {
          this.addRow(row, row, this.options.rowClass, column);
        }
      } else {
        const style = Miller.isLeaf(row[1]) && typeof row[1] !== 'object' ? this.options.rowClass
          : `${this.options.rowClass} ${this.options.parentClass}`;
        this.addRow(row[0], row[1], style, column);
      }
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

  populateColumn(rows, columnID) {
    const next = columnID + 1;
    if (Miller.isEmptyColumn(this.options.columns[next])) {
      this.insertRows(rows, this.options.columns[next]);
    } else {
      this.removeColumns(this.options.columns.splice(columnID + 1));
      const column = this.addColumn();
      this.insertRows(rows, column);
      this.options.columns.push(column);
    }
  }

  updateColumns(row, columnID) {
    if (Miller.isLeaf(row)) {
      if (typeof row !== 'object') {
        this.removeColumns(this.options.columns.splice(columnID + 1));
        while (this.options.columns.length < this.options.minColumns) {
          this.options.columns.push(this.addColumn());
        }
      } else if (row[this.options.props.children] && this.options.propMode) {
        this.populateColumn(row[this.options.props.children], columnID);
      } else {
        this.populateColumn(row, columnID);
      }
    } else {
      this.populateColumn(row, columnID);
    }
  }
}

export default Miller;
