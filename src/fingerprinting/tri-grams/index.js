const fs = require('fs');
const path = require('path');
const async = require('async');
const natural = require('natural');
const NGrams = natural.NGrams;
const auxiliary = require('../../auxiliary.js');

const def_headerFN = '.header';

class TriGrams
{
	constructor(in_Params)
	{

	}

	train(in_Params, in_CB)
	{
		let trainFiles = in_Params.trainFiles;
		let kbFolder = in_Params.kbFolder;
		auxiliary.removeFolder(kbFolder, (err) => {
			if (err)
				return in_CB(err);

			let kbHeader = {
				description: in_Params.description,
				files:[]
			};

			auxiliary.makeFolder(kbFolder, (err) => {
				async.each(trainFiles, (file, done) => {
					fs.readFile(file, 'utf-8', (err, data) => {
						if (err)
							return done(err);
						let trigrams = NGrams.trigrams(data);
						let header = {
							id: auxiliary.newId(),
							fileName: path.basename(file)
						};
						kbHeader.files.push(header);
						fs.writeFile(path.join(kbFolder, header.id), JSON.stringify(trigrams, null, '\t'), 'utf-8', done);
					});
				},
				(err) => {
					if (err)
						auxiliary.removeFolder(kbFolder, (err1) => {
							if (err1)
								return in_CB(err + " " + err1);
							in_CB(err)
						});
					fs.writeFile(path.join(kbFolder, def_headerFN), JSON.stringify(kbHeader, null, '\t'), 'utf-8', in_CB)
				
				});
			});
		});
	}

	check(in_Params, in_CB)
	{
		let testFiles = in_Params.testFiles;
		let kbFolder = in_Params.kbFolder;
		let result = 
		{
			threshold:0,
			all:[]
		};
		fs.readFile(path.join(kbFolder, def_headerFN), 'utf-8', (err, data) => {
			if (err)
				return in_CB(err);
			let kbHeader = JSON.parse(data);
			fs.readdir(kbFolder, (err, files) => {
				async.each(files, (file, doneTrained) => {
					if (file === def_headerFN)
						return doneTrained();
					let score =
					{
						threshold: 0,
					};
					fs.readFile(path.join(kbFolder, file), 'utf-8', (err, data) => {
						if (err)
							return doneTrained(err);
						let trigramsTrained = JSON.parse(data);

						async.each(testFiles, (tfile, doneTestFile) => {
							fs.readFile(tfile, 'utf-8', (err, data) => {
								if (err)
									return doneTestFile(err);
								let trigramsTesting = NGrams.trigrams(data);
								let intersectionsCount = 0;
								trigramsTrained.forEach((trainedTrigram) => {
									if (trigramsTesting.findIndex((item) => {
										if (trainedTrigram.every(function(u, i) { return u === item[i];}))
											return true;
										return false;
									}) != -1) {
										intersectionsCount++;
									}
								});
								if (intersectionsCount > 0)
								{
									let minLen = Math.min(trigramsTrained.length, trigramsTesting.length);
									let curTreshold = intersectionsCount * 100 / minLen;
									if (score.threshold < curTreshold) {
										score.threshold = curTreshold;
										let temp = kbHeader.files.find((item) => { return item.id === file });
										score.train = temp === undefined ? file : temp.fileName;
										score.testing = tfile;
									}
								}
								doneTestFile();
							});
						},
						(err) => {
							if (err)
								return doneTrained(err);
							if (score.threshold > 0)
							{
								if (result.threshold < score.threshold)
								{
									result.threshold = score.threshold;
									result.train = score.train;
									result.testing = score.testing;
								}
								result.all.push(score);
							}
							doneTrained();
						});
					});
				},
				(err) => {
					if (err)
						return in_CB(err);
					
					return in_CB(null, result);
				});
			});
		});
	}
};

module.exports = TriGrams;