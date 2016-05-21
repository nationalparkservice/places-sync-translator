var fandlebars = require('fandlebars');
module.exports = function (orig, replace1, replace2, next) {
  return next(fandlebars(orig, replace1), replace2);
};

