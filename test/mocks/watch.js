var path = require('path');
var opts = {};

module.exports = {
	mock: function(folder, cb) {
		opts.cb = cb;
		opts.folder = folder;
	},
	trigger: function(file) {
		opts.cb(path.join(opts.folder, file));
	}
};