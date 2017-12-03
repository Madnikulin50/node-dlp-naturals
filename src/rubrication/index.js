const fs = require('fs');
const path = require('path');
const async = require('async');

class Rubricator {

	constructor() {

	}

	

	execute(in_Params, in_CB)	{
		let result =
		{
			topics:[]
		};
		let test = in_Params.test;
		let kb = in_Params.kbFolder;
		let storeIntersections  = in_Params.returnWords || false;
		let top = in_Params.top || 5;
		if (!Array.isArray(kb))
			kb = [kb];
		if (!Array.isArray(test))
			test = [test];

		async.each(kb, (folder, doneFolder) => {
			fs.readdir(folder, (err, files) => {
				if (err)
					return doneFolder(err);
				async.each(files, (file, doneFile) => {
					if (file[0] === '.')
						return doneFile();
					fs.readFile(path.join(folder, file), 'utf-8', (err, data) => {
						if (err)
							return doneFile(err);

						var wordList = data.toString().split("\n");
						let intersectionsCount = 0;
						let intersections = [];
						wordList.forEach((word) => {
							test.forEach((t) => {
								if (t.indexOf(word) !== -1) {
									intersectionsCount++;
									if (storeIntersections)
										intersections.push(word);
								}
									
							});
						});

						if (intersectionsCount > 0)
						{
							let topic = 
							{
								count: intersectionsCount,
								topic: file,
								words: intersections
							};
							result.topics.push(topic);
						}
						doneFile();
					});
				},
				(err) => {
					doneFolder(err);
				});
			});
		},
		(err) => {
			if (err)
				return in_CB(err);
			result.topics.sort((a, b) => { return b.count - a.count; });
			result.topics.splice(top);
			in_CB(null, result);
		});
	}
};

module.exports = Rubricator;