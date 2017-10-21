var expect    = require("chai").expect;
const Rubrication = require('../../src').Rubrication;
const fs = require('fs');
const path = require('path');
let engine = new Rubrication();

var walk = function(dir, short = '') {
    var results = []
    var list = fs.readdirSync(path.join(dir, short));
    list.forEach(function(file) {
		if (file[0] === '.')
			return;
        file = (short.length === 0 ? '' : short + '/') + file;

        var stat = fs.statSync(path.join(dir, file));
        if (stat && stat.isDirectory())
			results = results.concat(walk(dir, file))
        else
			results.push(file)
    })
    return results
}

describe("Рубрикация", function() {
	
	let tests = [];
	let fld = __dirname + '/../../dev/examples/rubrication/test';
	let files = walk(fld);
	files.forEach((file) => {
		
		let item = {
			fileName: file,
			data: fs.readFileSync(path.join(fld, file), 'utf-8')
		};
		tests.push(item);
	});

	tests.forEach((test) =>
	{
		it("Тест файла " + test.fileName, () => {
			
			let fld = __dirname + '/../../src/rubrication/kb/en';
			this.timeout(10000);

			let params =
			{
				test:test.data,
				kbFolder: [
					path.join(fld, 'adj'),
					path.join(fld, 'noon')
				],
				returnWords:true
			};
			var testPromise = new Promise(function(resolve, reject) {
				engine.execute(params, (err, data) => {
					if (err)
						return reject(err);
					resolve(data);
				});
			});
			return testPromise.then((result) => {
				console.log(result);
				expect(result).to.be.an('object').that.has.all.keys('topics');
			}).catch((err) => {
				expect(err).to.equal(null, 'Вернуло ' + err);
			});
		}).timeout(10000);
	})
	

	
});