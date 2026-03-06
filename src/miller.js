const defaults = {
  minColumns: 2,
  millerClass: 'miller',
  columnClass: 'miller__column',
  rowClass: 'miller__row',
};

class Miller {

  constructor(selector, options = {}) {
    this.el = document.querySelector(selector);
    this.config = { ...defaults, ...options };
    this.rows = new Map();
    this.columns = [];
    this.columnCount = 0;
    this.anchor = null;
    this.init();
  }

  static isLeaf(row) {
    return typeof row !== 'object' || !row.children;
  }

  init() {
    this.el.className = this.config.millerClass;
    this.el.setAttribute('role', 'navigation');
    this.el.setAttribute('aria-label', 'Miller columns browser');

    this.toolbar = document.createElement('nav');
    this.toolbar.className = 'miller__toolbar';
    this.toolbar.setAttribute('aria-label', 'Breadcrumb');
    const ol = document.createElement('ol');
    ol.className = 'miller__breadcrumbs';
    this.toolbar.appendChild(ol);
    this.el.appendChild(this.toolbar);

    this.body = document.createElement('div');
    this.body.className = 'miller__body';
    this.el.appendChild(this.body);

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    this.el.appendChild(this.liveRegion);

    for (let i = 0; i < this.config.minColumns; i++) {
      this.columns.push(this.createColumn());
    }
    this.insertRows(this.config.data, this.columns[0]);
    this.updateColumnLabels();
    this.updateBreadcrumbs();
  }

  announce(message) {
    this.liveRegion.textContent = '';
    requestAnimationFrame(() => {
      this.liveRegion.textContent = message;
    });
  }

  updateColumnLabels() {
    const total = this.columns.length;
    this.columns.forEach((col, i) => {
      col.setAttribute('aria-label', `Column ${i + 1} of ${total}`);
    });
  }

  createColumn() {
    const ul = document.createElement('ul');
    ul.id = `column-${this.columnCount}`;
    ul.className = this.config.columnClass;
    ul.setAttribute('role', 'listbox');
    ul.setAttribute('aria-multiselectable', 'true');
    ul.addEventListener('keydown', (e) => this.onKeydown(e, ul));
    this.body.appendChild(ul);
    this.columnCount += 1;
    return ul;
  }

  focusColumn(column) {
    const target = this.getSelectedRow(column) || column.querySelector('.miller__row');
    if (target) target.focus();
  }

  removeColumns(columns) {
    columns.forEach((column) => {
      this.body.removeChild(column);
      this.columnCount -= 1;
    });
  }

  createRow(text, id, hasChildren) {
    const li = document.createElement('li');
    li.id = id;
    li.className = this.config.rowClass;
    li.setAttribute('role', 'option');
    li.setAttribute('tabindex', '-1');
    if (hasChildren) li.classList.add('miller__row--parent');

    const label = document.createElement('span');
    label.className = 'miller__row-label';
    label.textContent = text;
    li.appendChild(label);

    if (hasChildren) {
      const chevron = document.createElement('span');
      chevron.className = 'miller__row-chevron';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.textContent = '\u203A';
      li.appendChild(chevron);
    }

    li.addEventListener('click', (e) => {
      e.stopPropagation();
      if (e.shiftKey) {
        this.shiftSelect(li);
      } else {
        this.activateRow(li);
      }
    });

    return li;
  }

  addRow(row, column) {
    const isLeaf = Miller.isLeaf(row);
    const text = isLeaf ? row : row.parent;
    const li = this.createRow(text, `${column.id}-row-${column.children.length}`, !isLeaf);
    column.appendChild(li);
    this.rows.set(li.id, row);
  }

  insertRows(rows, column) {
    const wasEmpty = column.children.length === 0;
    rows.forEach((row) => this.addRow(row, column));
    if (wasEmpty && column.children.length > 0) {
      column.children[0].setAttribute('tabindex', '0');
    }
  }

  getSelectedRow(column) {
    return column.querySelector('.miller__row--selected');
  }

  getSelectedRows(column) {
    return [...column.querySelectorAll('.miller__row--selected')];
  }

  getItemsInColumn(column) {
    return [...column.querySelectorAll('.miller__row')];
  }

  clearSelection(column) {
    this.getSelectedRows(column).forEach((row) => {
      row.classList.remove('miller__row--selected');
      row.removeAttribute('aria-selected');
      row.setAttribute('tabindex', '-1');
    });
  }

  markSelected(li) {
    li.classList.add('miller__row--selected');
    li.setAttribute('aria-selected', 'true');
  }

  selectRange(column, from, to) {
    const items = this.getItemsInColumn(column);
    const fromIdx = items.indexOf(from);
    const toIdx = items.indexOf(to);
    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);

    this.clearSelection(column);
    for (let i = start; i <= end; i++) {
      this.markSelected(items[i]);
    }

    to.setAttribute('tabindex', '0');
    to.focus();
  }

  shiftSelect(li) {
    const column = li.parentElement;

    if (!this.anchor || this.anchor.parentElement !== column) {
      this.anchor = li;
      this.highlightRow(li);
      return;
    }

    this.selectRange(column, this.anchor, li);
    this.updateBreadcrumbs();
  }

  highlightRow(li) {
    const column = li.parentElement;
    this.clearSelection(column);
    this.markSelected(li);
    li.setAttribute('tabindex', '0');
    li.focus();
    this.anchor = li;
    this.updateBreadcrumbs();
  }

  updateBreadcrumbs() {
    const ol = this.toolbar.querySelector('.miller__breadcrumbs');
    ol.replaceChildren();

    this.columns.forEach((col, i) => {
      const selected = this.getSelectedRows(col);
      if (selected.length === 0) return;

      const li = document.createElement('li');
      li.className = 'miller__crumb';

      let text;
      if (selected.length === 1) {
        const row = this.rows.get(selected[0].id);
        text = Miller.isLeaf(row) ? String(row) : String(row.parent);
      } else {
        text = `${selected.length} selected`;
      }

      const btn = document.createElement('button');
      btn.className = 'miller__crumb-btn';
      btn.textContent = text;
      btn.setAttribute('type', 'button');
      btn.addEventListener('click', () => {
        this.navigateToColumn(i);
      });
      li.appendChild(btn);

      ol.appendChild(li);
    });
  }

  navigateToColumn(colIndex) {
    const selected = this.getSelectedRow(this.columns[colIndex]);
    if (selected) {
      this.activateRow(selected);
    }
  }

  selectRow(li) {
    this.highlightRow(li);
  }

  activateRow(li) {
    const column = li.parentElement;
    const colIndex = this.columns.indexOf(column);

    this.highlightRow(li);

    const row = this.rows.get(li.id);
    this.updateColumns(row, colIndex);

    if (!Miller.isLeaf(row)) {
      const next = this.columns[colIndex + 1];
      if (next) this.focusColumn(next);
    }
  }

  onKeydown(e, column) {
    const colIndex = this.columns.indexOf(column);
    const selected = this.getSelectedRow(column);
    const items = this.getItemsInColumn(column);

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const focus = document.activeElement;
      const base = items.includes(focus) ? focus : selected;
      const idx = base ? items.indexOf(base) : -1;
      const next = items[idx + 1];
      if (!next) return;

      if (e.shiftKey) {
        if (!this.anchor || this.anchor.parentElement !== column) {
          this.anchor = base || next;
        }
        this.selectRange(column, this.anchor, next);
        this.updateBreadcrumbs();
      } else {
        this.selectRow(next);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const focus = document.activeElement;
      const base = items.includes(focus) ? focus : selected;
      const idx = base ? items.indexOf(base) : items.length;
      const prev = items[idx - 1];
      if (!prev) return;

      if (e.shiftKey) {
        if (!this.anchor || this.anchor.parentElement !== column) {
          this.anchor = base || prev;
        }
        this.selectRange(column, this.anchor, prev);
        this.updateBreadcrumbs();
      } else {
        this.selectRow(prev);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (selected) {
        const row = this.rows.get(selected.id);
        if (row && !Miller.isLeaf(row)) {
          this.activateRow(selected);
          return;
        }
      }
      const next = this.columns[colIndex + 1];
      if (next && next.children.length > 0) {
        this.focusColumn(next);
        this.announce(`Moved to column ${colIndex + 2}`);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selected) {
        this.activateRow(selected);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = this.columns[colIndex - 1];
      if (prev) {
        this.focusColumn(prev);
        this.announce(`Moved to column ${colIndex}`);
      }
    }
  }

  updateColumns(row, columnID) {
    // Clear selection styling from deeper columns
    this.columns.slice(columnID + 1).forEach((col) => {
      this.clearSelection(col);
    });

    if (Miller.isLeaf(row)) {
      this.removeColumns(this.columns.splice(columnID + 1));
      if (this.columns.length < this.config.minColumns) {
        this.columns.push(this.createColumn());
      }
      this.announce(`Selected ${row}`);
    } else {
      this.removeColumns(this.columns.splice(columnID + 1));
      const column = this.createColumn();
      this.insertRows(row.children, column);
      this.columns.push(column);
      this.announce(`${row.parent}: ${row.children.length} items`);
    }
    this.updateColumnLabels();
    this.updateBreadcrumbs();
  }
}

export default Miller;
