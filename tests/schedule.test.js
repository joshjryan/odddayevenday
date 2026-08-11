const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('other days can be marked as no-school', () => {
  const appSource = fs.readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8');
  const elements = {
    'today-date': { textContent: '' },
    'today-parity': { textContent: '', classList: createClassList() },
    'next-school-day': { textContent: '' },
    'next-parity': { textContent: '', classList: createClassList() },
    status: { textContent: '' }
  };

  const document = {
    getElementById(id) {
      return elements[id];
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

  assert.equal(elements['today-parity'].textContent, 'NO SCHOOL');
  assert.equal(
    elements['status'].textContent,
    'Today note: District Professional Learning Day | Next day note: Transition Day'
  );
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
