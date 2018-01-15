/* eslint no-console: 0 */
const http = require('https');
const request = require('request');
const path = require('path');
const express = require('express');
const async = require('async');
const { exec } = require('child_process');
const util = require('util');

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 3000;
const app = express();

/*
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
*/
  console.log("serving static from " + __dirname)
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('/', function response(req, res) {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });



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
      /*
      async.map(body.repositories, getDetails(req.query.url), function(err, results) {
        if (err) {
          res.send(err);
        } else {
          //console.log(results);
          res.send({repositories: results});
        }
      });
      */
      res.send({ repositories: body.repositories.map( item => { return {name: item} } ) });
    }
  });
});


getTags = (url, repo, next) => {
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

getTagDetails = (registry_url, repo) => (tag, next) => {
    console.log(repo+"/"+tag)
  request({
    uri: registry_url+"/v2/"+repo+"/manifests/"+tag,
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
      let obj = {
          name: tag,
          digest: response.headers['docker-content-digest'] || response.headers['Docker-Content-Digest'],
          date: response.headers['date'] || response.headers['Date']
      }
      next(null, obj);
    }
  });
};

app.get("/tags", function response(req, res) {
  let url = req.query.url;
  let repo = req.query.repo;
  getTags(url, repo, function(err, tags) {
    if (err) {
      res.send(err);
    } else {
      async.map(tags.tags, getTagDetails(url, repo), function(err2, tags_results) {
        if (err2) {
          res.send(err2);
        } else {
          res.send({name: repo, tags: tags_results});
        }
      });
    }
  });
});

getDigest = (registry_url, repo) => (tag, next) => {
  request({
    uri: registry_url+"/v2/"+repo+"/manifests/"+tag,
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
      
      if (body && body.errors) {
        next(body.errors);
      } else {
        next(null, response.headers['docker-content-digest'] || response.headers['Docker-Content-Digest']);
      }
    }
  });
};

deleteTag = (registry_url, repo) => (digest, next) => {
  if (!digest) return next("wrong digest: "+util.inspect(digest));
  console.log(digest)
  request({
    uri: registry_url+"/v2/"+repo+"/manifests/"+digest,
    method: "DELETE",
    timeout: 10000,
    followRedirect: true,
    maxRedirects: 10,
  }, function(error, response, body) {
    if (error) {
      next(error);
    } else if(body.error) {
      next(body.error);
    } else {
      next(null, {result: "success"});
    }
  });
};

app.get("/delete", function response(req, res) {
  let url = req.query.url;
  let repo = req.query.repo;
  let tag = req.query.tag;
  
  let composition = async.compose(deleteTag(url, repo), getDigest(url, repo));
  composition(tag, function(err, result){
    if (err) {
      res.status(500).send({error: err});
    } else {
      res.send(result);
      // no need for sync
      // TODO: move the command in a config file
      exec("docker exec registry /bin/registry garbage-collect /etc/docker/registry/config.yml");
    }
  });
});


app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});
