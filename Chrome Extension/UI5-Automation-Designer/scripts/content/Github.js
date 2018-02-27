var Github = function (options) {
	var API_URL = options.apiUrl || 'https://api.github.com';

	var XMLHttpRequest,
	btoa;
	/* istanbul ignore else  */
	if (typeof exports !== 'undefined') {
		XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
		if (typeof btoa === 'undefined') {
			btoa = require('btoa'); //jshint ignore:line
		}
	} else {
		btoa = window.btoa;
	}

	//prefer native XMLHttpRequest always
	/* istanbul ignore if  */
	if (typeof window !== 'undefined' && typeof window.XMLHttpRequest !== 'undefined') {
		XMLHttpRequest = window.XMLHttpRequest;
	}

	// HTTP Request Abstraction
	// =======
	//
	// I'm not proud of this and neither should you be if you were responsible for the XMLHttpRequest spec.

	function _request(method, path, data, cb, raw, sync) {
		function getURL() {
			var url = path.indexOf('//') >= 0 ? path : API_URL + path;
			url += ((/\?/).test(url) ? '&' : '?');
			// Fix #195 about XMLHttpRequest.send method and GET/HEAD request
			if (data && typeof data === "object" && ['GET', 'HEAD'].indexOf(method) > -1) {
				url += '&' + Object.keys(data).map(function (k) {
					return k + '=' + data[k];
				}).join('&');
			}
			return url + '&' + (new Date()).getTime();
		}

		var xhr = new XMLHttpRequest();

		xhr.open(method, getURL(), !sync);
		if (!sync) {
			xhr.onreadystatechange = function () {
				if (this.readyState === 4) {
					if (this.status >= 200 && this.status < 300 || this.status === 304) {
						cb(null, raw ? this.responseText : this.responseText ? JSON.parse(this.responseText) : true, this);
					} else {
						cb({
							path: path,
							request: this,
							error: this.status
						});
					}
				}
			};
		}

		if (!raw) {
			xhr.dataType = 'json';
			xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json');
		} else {
			xhr.setRequestHeader('Accept', 'application/vnd.github.v3.raw+json');
		}

		xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
		if ((options.token) || (options.username && options.password)) {
			var authorization = options.token ? 'token ' + options.token : 'Basic ' + btoa(options.username + ':' + options.password);
			xhr.setRequestHeader('Authorization', authorization);
		}
		if (data) {
			xhr.send(JSON.stringify(data));
		} else {
			xhr.send();
		}
		if (sync) {
			return xhr.response;
		}
	}

	// function _requestAllPages(path, cb) {
	// var results = [];
	// (function iterate() {
	// _request('GET', path, null, function(err, res, xhr) {
	// if (err) {
	// return cb(err);
	// }

	// results.push.apply(results, res);

	// var links = (xhr.getResponseHeader('link') || '').split(/\s*,\s*/g),
	// next = null;
	// links.forEach(function(link) {
	// next = /rel="next"/.test(link) ? link : next;
	// });

	// if (next) {
	// next = (/<(.*)>/.exec(next) || [])[1];
	// }

	// if (!next) {
	// cb(err, results);
	// } else {
	// path = next;
	// iterate();
	// }
	// });
	// })();
	// }


	// Repository API
	// =======

	Github.Repository = function (options) {
		var repo = options.name;
		var user = options.user;

		var that = this;
		var repoPath = '/repos/' + user + '/' + repo;

		var currentTree = {
			'branch': null,
			'sha': null
		};

		// Get a particular reference
		// -------

		this.getRef = function (ref, cb) {
			_request('GET', repoPath + '/git/refs/' + ref, null, function (err, res) {
				if (err) {
					return cb(err);
				}

				cb(null, res.object.sha);
			});
		};

		// For a given file path, get the corresponding sha (blob for files, tree for dirs)
		// -------

		this.getSha = function (branch, path, cb) {
			if (!path || path === "")
				return that.getRef("heads/" + branch, cb);
			_request("GET", repoPath + "/contents/" + path + (branch ? "?ref=" + branch : ""), null, function (err, pathContent) {
				if (err)
					return cb(err);
				cb(null, pathContent.sha);
			});
		};

		// Write file contents to a given branch and path
		// -------

		this.write = function (branch, path, content, message, cb) {
			that.getSha(branch, encodeURI(path), function (err, sha) {
				if (err && err.error !== 404)
					return cb(err);
				_request("PUT", repoPath + "/contents/" + encodeURI(path), {
					message: message,
					content: btoa(content),
					branch: branch,
					sha: sha
				}, cb);
			});
		};

	};

	// Top Level API
	// -------


	this.getRepo = function (user, repo) {
		return new Github.Repository({
			user: user,
			name: repo
		});
	};

};
