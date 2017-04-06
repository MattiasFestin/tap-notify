'use strict';

import nodeNotifier from 'node-notifier';
import through2 from 'through2';
import parser from 'tap-parser';
import path from 'path';
import fs from 'fs';
import * as termux from 'node-termux-api';

var notifier = null;
if (fs.existsSync('/data/data/com.termux/files/usr/bin/termux-notification')) {
    notifier = {
        notify: (o) => {
            const cmd = termux.createCommand()
                .notification()
                .setTitle(o.title)
                .setContent(o.message);

            cmd.command.setESParam('led-color', o.ledColor);

            cmd.build()
                .run();
        }
    };
} else {
    notifier = nodeNotifier;
}

const DEFAULT_PASSED_OPTIONS = {
  title: 'Test passed.',
  icon: path.resolve(__dirname, '../passed.png'),
  ledColor: '00FF00',
  sound: false
};

const DEFAULT_FAILED_OPTIONS = {
  title: 'Test failed!',
  icon: path.resolve(__dirname, '../failed.png'),
  ledColor: 'FF0000',
  sound: false
};

const createReporter = ({ passed, failed } = {}) => {
  const passedOptions = Object.assign({}, DEFAULT_PASSED_OPTIONS, passed);
  const failedOptions = Object.assign({}, DEFAULT_FAILED_OPTIONS, failed);
  const p = parser();
  const stream = through2(function(chunk, enc, next) {
    this.push(chunk);
    next();
  });
  let errorOccuredAt = null;

  stream.pipe(p);

  p.on('assert', assert => {
    if (assert.ok) {
        return;
    }

    errorOccuredAt = assert.diag.at;
  });

  p.on('complete', result => {
    if (result.ok) {
      notifier.notify(Object.assign({
        message: `${result.pass} of ${result.count} tests passed.`,
      }, passedOptions));
    } else {
      notifier.notify(Object.assign({
        message: `${result.fail || 0} of ${result.count} tests failed` +
                 (errorOccuredAt ? ` at ${errorOccuredAt}` : ''),
      }, failedOptions));
    }
  });

  return stream;
};

export default createReporter;
