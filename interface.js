const prompt = require('prompt-sync')();

const getInitialData = () => {
	const data = [];
	let caseNumber = 0;
	let countryCount = -1;
	let countryNames = [];
	let countries = [];

	while (countryCount !== 0) {
		countryCount = +prompt('Type number of countries: ');
		if (isNaN(countryCount)) {
			console.log('Invalid number of countries. Try again.');
			continue;
		}

		if (countryCount === 0) {
			break;
		}

		for (let i = 0; i < countryCount; i++) {
			const input = prompt(
				'Type country information (country_name xl yl xh yh): '
			);
			const answer = input.split(' ');

			if (
				answer.length !== 5 ||
				isNaN(+answer[1]) ||
				isNaN(+answer[2]) ||
				isNaN(+answer[3]) ||
				isNaN(+answer[4])
			) {
				console.log('Invalid input of country information');
				i--;
				continue;
			}

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

		caseNumber++;
		data.push({
			caseNumber,
			countryNames,
			countries,
		});

		countryNames = [];
		countries = [];
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
