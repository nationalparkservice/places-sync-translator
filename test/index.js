var iterateTapeTasks = require('jm-tools').iterateTapeTasks;
var requireDirectory = require('jm-tools').requireDirectory;

var tests = requireDirectory('./test', 'index.js');
var mainTaskList = [];

for (var test in tests) {
  tests[test].forEach(function (test) {
    mainTaskList.push(test);
  });
}

iterateTapeTasks(mainTaskList, true, true, true).then(function (results) {
  console.log('main tests done ');
}).catch(function (e) {
  if (e === undefined) {
    e = new Error('undefined error ');
  }
  console.log('main test error ');
  throw e;
});
