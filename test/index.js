var koa = require('koa');
var path = require('path');
var request = require('supertest');
var rewire = require('rewire');
var sass = rewire('../index.js');
var watchMock = require('./mocks/watch');
var sassMock = require('./mocks/sass');

var app, revert;
before(function() {
	process.env.BASEPATH = '/pre';
	revert = sass.__set__({
		watch: watchMock.mock,
		sass: sassMock.mock
	});
});

after(function() {
	delete process.env.BASEPATH;
	revert();
});

beforeEach(function() {
	app = koa();
	app.use(sass('sass/index.scss'));
});

describe('In production mode the middleware', function() {
	before(function() {
		process.env.NODE_ENV_TEST = 'production';
	});

	after(function() {
		delete process.env.NODE_ENV_TEST;
	});

	it('serves the sass correctly', function(done) {
		sassMock.trigger([], '* {}');
		request(app.listen())
			.get('/')
			.expect(200)
			.expect('* {}')
			.expect('Content-Type', /text\/css/)
			.end(done);
	});

	it('prefixes the sass correctly', function(done) {
		sassMock.trigger([], ':fullscreen {}');
		request(app.listen())
			.get('/')
			.expect(200)
			.expect(/:-webkit-full-screen/)
			.expect('Content-Type', /text\/css/)
			.end(done);
	});

	it('prefixes urls correctly', function(done) {
		sassMock.trigger([], '* {background: url(/fixed);}');
		request(app.listen())
			.get('/')
			.expect(200)
			.expect(/url\(\/pre\/fixed\)/)
			.expect('Content-Type', /text\/css/)
			.end(done);
	});
});

describe('In development mode the middleware', function() {
	it('serves the sass correctly', function(done) {
		sassMock.trigger([], '* {}');
		request(app.listen())
			.get('/')
			.expect(200)
			.expect('* {}')
			.expect('Content-Type', /text\/css/)
			.end(done);
	});

	it('prefixes the sass correctly', function(done) {
		sassMock.trigger([], ':fullscreen {}');
		request(app.listen())
			.get('/')
			.expect(200)
			.expect(/:-webkit-full-screen/)
			.expect('Content-Type', /text\/css/)
			.end(done);
	});

	it('prefixes urls correctly', function(done) {
		sassMock.trigger([], '* {background: url(/fixed);}');
		request(app.listen())
			.get('/')
			.expect(200)
			.expect(/url\(\/pre\/fixed\)/)
			.expect('Content-Type', /text\/css/)
			.end(done);
	});

	it('reloads upon main file change', function(done) {
		sassMock.trigger([], '* {}');
		watchMock.trigger('index.scss');
		sassMock.trigger([], 'html {}');

		request(app.listen())
			.get('/')
			.expect(200)
			.expect('html {}')
			.expect('Content-Type', /text\/css/)
			.end(done);
	});

	it('reloads upon sub file change', function(done) {
		sassMock.trigger([path.join(process.cwd(), 'sass/sub.scss')], '* {}');
		watchMock.trigger('sub.scss');
		sassMock.trigger([], 'html {}');

		request(app.listen())
			.get('/')
			.expect(200)
			.expect('html {}')
			.expect('Content-Type', /text\/css/)
			.end(done);
	});
});