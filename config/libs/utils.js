const path = require('path');

exports.getCommandPath = function (dest = '') {
    return path.resolve(dest);
};