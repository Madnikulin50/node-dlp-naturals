
const BasicAlgorithm = require('../basic.js');

class BasicClassificator extends BasicAlgorithm
{
	constructor(in_Params)
	{

	}

	train(in_Params, in_CB)
	{
		let folder = in_Params.train.positive;
		
	}

	check(in_Params, in_CB)
	{
		throw "Недописано";
	}
};

module.exports = BasicClassificator;