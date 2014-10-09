var koars = require('koars-utils')({module: 'assets', asset: 'sass'});
var watch = require('node-watch');
var sass = require('node-sass');
var path = require('path');
var prefixer = require('autoprefixer');

module.exports = function(src) {
	src = path.join(process.cwd(), src);
	var cache, time = new Date(), files = [];

	//Render initially and watch our directory for updates.
	cache = render();
	if(koars.dev()) {
		watch(path.dirname(src), function(filename) {
			if(filename === src || files.indexOf(filename) !== -1) {
				cache = render();
			}
		});
	}

	//Render our file and run the prefixer on success. Also update the timestamp for caching
	function render() {
		return new Promise(function(resolve, reject) {
			var stats = {};
			sass.render({
				stats: stats,
				file: src,
				success: function(result) {
					files = stats.includedFiles;
					time = new Date(stats.end);
					koars.log.debug('Recompiled sass (and added prefixes)');
					resolve(prefixer.process(prefixUrls(result)).css);
				},
				error: function(err) {
					koars.log.error(err, 'Failed to compile sass');
					reject(err);
				}
			});
		});
	}

	//Rewrite root based urls in css files
	function prefixUrls(data) {
		var regex = /url\(['"]?(\/.*?)['"]?\)/g;
		return data.replace(regex, function() {
			var src = arguments[1];
			return 'url('+(src[0] === '/' ? koars.basepath() : '')+src+')';
		});
	}

	//Return our middleware which returns our styles when requested with the fitting path
	return function *() {
		this.body = yield cache;
		this.lastModified = time;
		this.type = 'text/css';
	};
};