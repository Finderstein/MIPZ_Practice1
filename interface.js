const prompt = require('prompt-sync')();

const getInitialData = () => {
	const data = [];
	let caseNumber = 0;
	let countryCount = -1;
	let countryNames = [];
	let countries = [];

	while (countryCount !== 0) {
		countryCount = +prompt('Type number of countries: ');
		for (let i = 0; i < countryCount; i++) {
			const input = prompt(
				'Type country information (country_name xl yl xh yh): '
			);
			const answer = input.split(' ');
			countryNames.push(answer[0]);
			countries.push({
				name: answer[0],
				dimensions: {
					xl: +answer[1],
					yl: +answer[2],
					xh: +answer[3],
					yh: +answer[4],
				},
			});
		}

		if (countryCount !== 0) {
			caseNumber++;
			data.push({
				caseNumber,
				countryNames,
				countries,
			});

			countryNames = [];
			countries = [];
		}
	}

	return data;
};

const displayResult = (caseNumber, result) => {
	console.log(`Case Number ${caseNumber}`);
	for (const country of result) {
		console.log(`${country.countryName} ${country.iteration}`);
	}
};

module.exports = {
	getInitialData,
	displayResult,
};
