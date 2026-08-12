const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('today section always shows today and includes today note', () => {
  const appSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
  const elements = {
    'today-context': { textContent: '' },
    'today-date': { textContent: '' },
    'today-parity': { textContent: '', classList: createClassList() },
    'today-note': { textContent: '' },
    'next-school-day': { textContent: '' },
    'next-relative': { textContent: '' },
    'next-school-day-count': { textContent: '' },
    'next-parity': { textContent: '', classList: createClassList() },
    'upcoming-glance': { textContent: '', appendChild() {} },
    'upcoming-list': { textContent: '', appendChild() {} },
    status: { textContent: '' }
  };

  const document = {
    getElementById(id) {
      return elements[id];
    },
    createElement(tagName) {
      return {
        tagName,
        className: '',
        textContent: '',
        classList: createClassList(),
        setAttribute() {}
      };
    }
  };

  const scheduleData = {
    timezone: 'America/Denver',
    days: {
      '2026-08-12': { type: 'other', note: 'District Professional Learning Day', school: false },
      '2026-08-24': { type: 'other', note: 'Transition Day', school: true }
    },
    overrides: {},
    canceledDays: [],
    shiftRules: []
  };

  const RealDate = Date;
  class FixedDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) {
        super('2026-08-12T12:00:00Z');
      } else {
        super(...args);
      }
    }

    static now() {
      return new RealDate('2026-08-12T12:00:00Z').getTime();
    }
  }

  const context = {
    window: { scheduleData },
    document,
    Date: FixedDate,
    console,
    Intl,
    Set,
    Object,
    Array,
    String,
    Number,
    Boolean
  };

  vm.createContext(context);
  vm.runInContext(appSource, context);

  assert.equal(elements['today-context'].textContent, 'Today');
  assert.equal(elements['today-parity'].textContent, 'NO SCHOOL (OTHER)');
  assert.equal(elements['today-note'].textContent, 'District Professional Learning Day');
  assert.equal(elements['status'].textContent, 'Next: Transition Day');
});

function createClassList() {
  return {
    classes: new Set(),
    add(...names) {
      names.forEach((name) => this.classes.add(name));
    },
    remove(...names) {
      names.forEach((name) => this.classes.delete(name));
    }
  };
}
