var triGrams = require('./tri-grams');

class Fingerprinting
{
	constructor()
	{

	}

	createTriGrams(in_Params)
	{
		return new triGrams(in_Params);
	}
};

module.exports = Fingerprinting;