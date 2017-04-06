'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _nodeNotifier = require('node-notifier');

var _nodeNotifier2 = _interopRequireDefault(_nodeNotifier);

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _tapParser = require('tap-parser');

var _tapParser2 = _interopRequireDefault(_tapParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var notifier = null;
if (_fs2.default.existsSync('/data/data/com.termux/files/usr/bin/termux-notification')) {
  notifier = {
    notify: function notify(o) {
      _child_process2.default.execSync('termux-notification --title "' + o.title + '" --content "' + o.message + '" --led-color "' + o.ledColor + '"--priority max ' + (o.sound ? '--sound' : ''));
    }
  };
} else {
  notifier = _nodeNotifier2.default;
}

var DEFAULT_PASSED_OPTIONS = {
  title: 'Test passed.',
  icon: _path2.default.resolve(__dirname, '../passed.png'),
  ledColor: '00FF00',
  sound: false
};

var DEFAULT_FAILED_OPTIONS = {
  title: 'Test failed!',
  icon: _path2.default.resolve(__dirname, '../failed.png'),
  ledColor: 'FF0000',
  sound: false
};

var createReporter = function createReporter() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      passed = _ref.passed,
      failed = _ref.failed;

  var passedOptions = _extends({}, DEFAULT_PASSED_OPTIONS, passed);
  var failedOptions = _extends({}, DEFAULT_FAILED_OPTIONS, failed);
  var p = (0, _tapParser2.default)();
  var stream = (0, _through2.default)(function (chunk, enc, next) {
    this.push(chunk);
    next();
  });
  var errorOccuredAt = null;

  stream.pipe(p);

  p.on('assert', function (assert) {
    if (assert.ok) {
      return;
    }

    errorOccuredAt = assert.diag.at;
  });

  p.on('complete', function (result) {
    if (result.ok) {
      notifier.notify(_extends({
        message: result.pass + ' of ' + result.count + ' tests passed.'
      }, passedOptions));
    } else {
      notifier.notify(_extends({
        message: (result.fail || 0) + ' of ' + result.count + ' tests failed' + (errorOccuredAt ? ' at ' + errorOccuredAt : '')
      }, failedOptions));
    }
  });

  return stream;
};

exports.default = createReporter;
module.exports = exports['default'];