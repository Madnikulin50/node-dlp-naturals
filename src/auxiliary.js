const crypto = require('crypto');
const fs = require('fs');
const async = require('async');
const path = require('path');

module.exports.newId = function()
{
	return crypto.randomBytes(48).toString('hex');
};

module.exports.makeFolder = function(dirPath, callback) {
    //Call the standard fs.mkdir
	let mode = 0777;
	let p = path.normalize(dirPath);
    fs.mkdir(p, mode, (error)=>{
        //When it fail in this way, do the custom steps
        if (error && error.errno === -2) {
            //Create all the parents recursively
            module.exports.makeFolder(path.dirname(p), mode, (err) => {
				if (err)
					return callback(err);
				module.exports.makeFolder(p, mode, callback);
			});
        }
		else
        	callback(error);
    });
};

module.exports.removeFolder = function(in_Path, in_CB) {
	fs.exists(in_Path, (exists) => {
		if (!exists)
			return in_CB();
		fs.readdir(in_Path, (err, files) => {
			async.each(files, (file, done) => {
				let curPath = in_Path + "/" + file;
				fs.lstat(curPath, (err, stat) => {
					if (stat.isDirectory())
						return module.exports.removeFolder(curPath, done);
					fs.unlink(curPath, done);
				});
			},
			(err) => {
				if (err)
					return in_CB(err);
				fs.rmdir(in_Path, in_CB);
			});
		});
	}); 
};

module.exports.removeFolderSync = function(in_Path) {
	if (fs.existsSync(in_Path) ) {
    	fs.readdirSync(in_Path).forEach((file,index) => {
			let curPath = path + "/" + file;
			if (fs.lstatSync(curPath).isDirectory()) { // recurse
				module.exports.removeFolderSync(curPath);
			}
			else { // delete file
        		fs.unlinkSync(curPath);
      		}
    	});
    	fs.rmdirSync(path);
  	}
};