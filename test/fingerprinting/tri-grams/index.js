var expect    = require("chai").expect;
const TriGramsFingerprints = require('../../../src').TriGramsFingerprints;
const fs = require('fs');
const path = require('path');
let fp = new TriGramsFingerprints();

describe("Договора", function() {

	it("Создание базы договоров", function() {
		let fld = __dirname + '/../../../dev/examples/dover/train';

		let files = fs.readdirSync(fld);
		let pathes = [];
		files.forEach((p) => {
			pathes.push(path.join(fld, p));
		});
		let params =
		{
			trainFiles:pathes,
			kbFolder: __dirname + '/../../../temp/dover'
		};

		var testPromise = new Promise(function(resolve, reject) {
			fp.train(params, (err) => {
				if (err)
					return reject(err);
				resolve(err);
			});
		});
		return testPromise.then((result) => {
			expect(result).to.equal(null, 'Должен возвращаться null');
		}).catch((err) => {
			expect(err).to.equal(null, 'Вернуло ' + err);
		});
	});

	it("Тест базы договоров", () => {
		
		let fld = __dirname + '/../../../dev/examples/dover/test';
		this.timeout(10000)
		let files = fs.readdirSync(fld);
		let pathes = [];
		files.forEach((p) => {
			if (p[0] === '.')
				return;
			pathes.push(path.join(fld, p));
		});

		let params =
		{
			testFiles:pathes,
			kbFolder: __dirname + '/../../../temp/dover'
		};
		var testPromise = new Promise(function(resolve, reject) {
			fp.check(params, (err, data) => {
				if (err)
					return reject(err);
				resolve(data);
			});
		});
		return testPromise.then((result) => {
			console.log(result);
			expect(result).to.be.an('object').that.has.all.keys('threshold', 'train', 'testing', 'all');
		}).catch((err) => {
			expect(err).to.equal(null, 'Вернуло ' + err);
		});
	});
});