const Interface = require('./interface');
const Calculator = require('./calculator');

const data = Interface.getInitialData();
for (const caseData of data) {
	const result = Calculator.euroDiffusion(
		caseData.countryNames,
		caseData.countries
	);
	result.sort((a, b) => {
		if (a.iteration === b.iteration) {
			return a.countryName.localeCompare(b.countryName);
		}
		return a.iteration - b.iteration;
	});

	Interface.displayResult(caseData.caseNumber, result);
}
