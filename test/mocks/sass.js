var opts;
module.exports = {
	mock: {
		render: function(data) {
			opts = data;
		}
	},
	trigger: function(files, data) {
		opts.stats.includedFiles = files;
		opts.stats.end = Date.now();
		opts.success(data);
	},
	error: function(err) {
		opts.error(err);
	}
};