koars-sass
==========
This module provides koa middleware to compile and serve sass/scss files.

The following will serve the compiled contents of `sass/index.scss` on every route.

	var app = koa();
	var sass = require('koars-sass');
	app.use(sass('sass/index.scss'));

URL-Prefixing
-------------
To work behind a proxy, this module prefixes any absolute `url()` with whatever is set in your `BASEPATH` environment variable.

Reloading
---------
If the `NODE_ENV` environment variable is not set to `production`, the files are dynamically reloaded upon any changes.