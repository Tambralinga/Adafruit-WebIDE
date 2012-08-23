var path = require('path'),
    fs = require('fs'),
    util = require('util'),
    readdirp = require('readdirp'),
    exec = require('child_process').exec;

exports.has_ssh_key = function has_ssh_key(cb) {
  path.exists(process.env['HOME'] + '/.ssh/id_rsa.pub', function(exists) {
    if (exists) {
      cb(true);
    } else {
      cb(false);
    }
  });
};

exports.generate_ssh_key = function(cb) {
  path.exists(process.env['HOME'] + '/.ssh/id_rsa.pub', function(exists) {
    if (exists) {
      cb();
    } else {
      //TODO generate key
      exec("ssh-keygen -b 1024 -N '' -f ~/.ssh/id_dsa -t dsa -q");
      cb();
    }
  });
};

exports.read_or_generate_key = function(cb) {
  this.has_ssh_key(function(has_key) {
    if (has_key) {
      fs.readFile(process.env['HOME'] + '/.ssh/id_rsa.pub', 'ascii', function(err,data){
        cb(data);
      });
    } else {
      generate_ssh_key(function() {

      });
    }
  });
};

exports.check_for_repository = function(repository, cb) {
  fs.stat('../repositories/' + repository, function(err, stat) {
    if (stat && stat.isDirectory()) {
      cb(true);
    } else {
      cb(false);
    }
  });
};

function build_file_structure(path, cb) {
  var filter = ['.git'];

  var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);

        full_path = dir + '/' + file;
        relative_path = full_path.replace(__dirname + "/", '');
        fs.stat(full_path, function(err, stat) {
          if (stat && stat.isDirectory()) {
            if (filter.indexOf(file) === -1) {
              var dir = {data: file, children: []};
              walk(full_path, function(err, res) {
                dir.children = res;
                results.push(dir);
                next();
              });
            } else {
              next();
            }
          } else {
            results.push({data: file, attr: {"id": relative_path}});
            next();
          }
        });
      })();
    });
  };

  walk(path, function(err, results) {
    if (err) throw err;
      cb(results);
  });
}

exports.read_repository = function(repository, cb) {
  
  var repository_path = __dirname + "/../repositories/" + repository;
  build_file_structure(repository_path, function(results) {
    cb(results);
  });
};

exports.open_file = function(path, cb) {
  fs.readFile(__dirname + '/' + path, 'ascii', function(err,data){
    cb(data);
  });
}