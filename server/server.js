/* eslint no-console: 0 */
const http = require('https');
const request = require("request");
const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const async = require('async');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = express();

if (isDeveloping) {
  const config = require('../webpack.config.js');
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('/', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, '../dist/index.html')));
    res.end();
  });
} else {
  console.log("serving static from " + __dirname)
  app.use(express.static('dist'));
  app.get('/', function response(req, res) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}




function getDetailsUrl(url) {
  return function getDetails(repo, next) {
    request({
      uri: url+"/v2/"+repo+"/tags/list",
      method: "GET",
      timeout: 10000,
      followRedirect: true,
      maxRedirects: 10,
      json: true,
      headers: {
        Accept: 'application/vnd.docker.distribution.manifest.v2+json'
      }
    }, function(error, response, body) {
      if (error) {
        next(error);
      } else {
        next(null, body);
      }
    });
  };
}

app.get("/catalog", function response(req, res) {
  
  request({
    uri: req.query.url+"/v2/_catalog",
    method: "GET",
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10,
    json: true,
    headers: {
      Accept: 'application/vnd.docker.distribution.manifest.v2+json'
    }
  }, function(error, response, body) {
    if (error) {
      res.send(error);
    } else {
      async.map(body.repositories, getDetailsUrl(req.query.url), function(err, results) {
        if (err) {
          res.send(err);
        } else {
          console.log(results);
          res.send({repositories: results});
        }
      });
    }
  });
});

function getDigest(registry_url, repo, tag, next) {
  request({
    uri: registry_url+"/v2/"+repo+"/manifests/"+tag,
    method: "GET",
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10,
    //json: true,
    headers: {
      Accept: 'application/vnd.docker.distribution.manifest.v2+json'
    }
  }, function(error, response, body) {
    if (error) {
      next(error);
    } else {
      //console.log(response);
      if (response && response.headers) {
        next(null, response.headers['docker-content-digest'] || response.headers['Docker-Content-Digest']);
      } else {
        next("digest not found");
      }
    }
  });
}

app.get("/delete", function response(req, res) {
  let url = req.query.url;
  let repo = req.query.repo;
  let tag = req.query.tag;
  
  getDigest(url, repo, tag, function (err, digest) {
    if (err) {
      res.send(err);
    } else {
      console.log(url+"/v2/"+repo+"/manifests/"+digest);
      request({
        uri: url+"/v2/"+repo+"/manifests/"+digest,
        method: "DELETE",
        timeout: 10000,
        followRedirect: true,
        maxRedirects: 10,
        /*
        json: true,
        headers: {
          Accept: 'application/vnd.docker.distribution.manifest.v2+json'
        }
        */
      }, function(error, response, body) {
        if (error) {
          res.send(error);
        } else if(body.error) {
          res.send(error);
        } else {
          res.send({result: "success"});
        }
      });
    }
  });
});


app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
