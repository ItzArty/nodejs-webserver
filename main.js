
Number.prototype.format2P = function( ) {

	var result = this.toString( )

	if( result.length > 2 ) {

		result = result.slice(0, -(result.length - 2))

	}

	if( result.length < 2 ) {

		while( result.length < 2 ) {

			result = '0' + result

		}

	}

	return result;

}

Array.prototype.last = function( ) {

	return this[this.length - 1];

}

var date = new Date();

function log(message, type) {

	if(!message) return;
	if(!type) type = "info";

	var timeStr = date.getDate().format2P() + "/" + (date.getMonth() + 1).format2P() + "/" + date.getFullYear() + " " + date.getHours().format2P() + ":" + date.getMinutes().format2P() + ":" + date.getSeconds().format2P();

	console.log(timeStr + " | " + type.toUpperCase() + " : " + message);

}

const http = require("http");
const fs = require("fs");

var serverInstances = [ ];

var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

var globalHandlers = {

	text: (file, args, path, res) => {

		fs.readFile(path + file, (err, data) => {

			if(err) {

				res.writeHead(404);
				res.end("File not found");
				return;

			}

			res.writeHead(200);
			res.setHeader("Content-Type", "text");
			res.end(data.toString());

		});

	},
	html: (file, args, path, res) => {

		fs.readFile(path + file, (err, data) => {

			if(err) {

				res.writeHead(404);
				res.end("File not found");
				return;

			}

			res.writeHead(200);
			res.setHeader("Content-Type", "text/html");
			res.end(data.toString());
			return;

		});

	},
	css: (file, args, path, res) => {

		fs.readFile(path + file, (err, data) => {

			if(err) {

				res.writeHead(404);
				res.end("File not found");
				return;

			}

			res.writeHead(200);
			res.setHeader("Content-Type", "text/css");
			res.end(data.toString());
			return;

		});

	},
	js: (file, args, path, res) => {

		fs.readFile(path + file, (err, data) => {

			if(err) {

				res.writeHead(404);
				res.end("File not found");
				return;

			}

			res.writeHead(200);
			res.setHeader("Content-Type", "application/javascript");
			res.end(data.toString());
			return;

		});

	},
	php: (file, args, path, res) => {

		const { spawn } = require("child_process");

		var phpProc = spawn("php", [ path + file ]);
		phpProc.stdout.on("data", (data) => {

			res.setHeader("Content-Type", "text/html");
			res.end(data.toString());

		});

	},
	png: (file, args, path, res) => {

		var s = fs.createReadStream(path + file);

		s.on("open", () => {

			res.setHeader("Content-Type", mime["png"]);
			s.pipe(res);

		});

		s.on("error", () => {

			res.writeHead(500);
			res.end();

		});

	},
	jpeg: (file, args, path, res) => {

		var s = fs.createReadStream(path + file);

		s.on("open", () => {

			res.setHeader("Content-Type", mime["jpg"]);
			s.pipe(res);

		});

		s.on("error", () => {

			res.writeHead(500);
			res.end();

		});

	},
	jpg: (file, args, path, res) => {

		var s = fs.createReadStream(path + file);

		s.on("open", () => {

			res.setHeader("Content-Type", mime["jpg"]);
			s.pipe(res);

		});

		s.on("error", () => {

			res.writeHead(500);
			res.end();

		});

	},
	gif: (file, args, path, res) => {

		var s = fs.createReadStream(path + file);

		s.on("open", () => {

			res.setHeader("Content-Type", mime["gif"]);
			s.pipe(res);

		});

		s.on("error", () => {

			res.writeHead(500);
			res.end();

		});

	},
	svg: (file, args, path, res) => {

		var s = fs.createReadStream(path + file);

		s.on("open", () => {

			res.setHeader("Content-Type", mime["svg"]);
			s.pipe(res);

		});

		s.on("error", () => {

			res.writeHead(500);
			res.end();

		});

	},
	mp4: (file, args, path, res, req) => {

		var stat = fs.statSync(path + file);
		var total = stat.size;

		if(req.headers["range"]) {

			var range = req.headers.range;
			var parts = range.replace(/bytes=/, "").split("-");
			var partialstart = parts[0];
			var partialend = parts[1];

			var start = parseInt(partialstart, 10);
			var end = partialend ? parseInt(partialend, 10) : total - 1;
			var chunkSize = (end-start)+1;

			var file = fs.createReadStream(path + file, { start: start, end: end });
			res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunkSize, 'Content-Type': 'video/mp4' });
			file.pipe(res);

		}else{

			res.writeHead(200, { "Content-Length": total, "Content-Type": "video/mp4" });
			fs.createReadStream(path + file).pipe(res);

		}

	}

};

class serverInstance {

	constructor(host, port, source, options) {

		if(!host) host = "127.0.0.1";
		if(!port) port = 80;
		if(!source) source = "./";
		if(!options) options = { };

		this.host = host;
		this.port = port;
		this.source = source;
		this.handlers = { };

		this.options = options;

		/*
			Options
		*/

		if(!this.options.defaultIndex) this.options.defaultIndex = [ "test.html", "index.php" ];

		this.server = http.createServer((req, res) => {

			var file = req.url.split("?")[0];
			var argsArr = [ ];

			if(req.url.split("?").length > 0) {

				// argsArr = req.url.split("?")[1].split("&");

			}

			var args = [ ];

			for(var i = 0; i < args.length; i++) {

				var key = argsArr[i].split("=")[0];
				var value = argsArr[i].split("=")[1];

				args.push({ key: key, value: value });

			}


			var type = file.split(".").last();
			var path = this.source;

			if(!this.handlers[type] && !globalHandlers[type]) {

				globalHandlers["text"](file, args, path, res, req);

			}else{

				if(!this.handlers[type] && globalHandlers[type]) globalHandlers[type](file, args, path, res, req);
				if(this.handlers[type]) this.handlers[type](file, args, path, res, req);

			}

		}).listen(this.port, this.host);

		serverInstances.push(this);

	}

}

new serverInstance();
