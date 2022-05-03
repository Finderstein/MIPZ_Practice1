const _ = require('lodash');

const MAX_ITERATIONS = 1000000;
const INITIAL_COINS = 1000000;
const PORTION_DIVIDER = 1000;

const euroDiffusion = (countryNames, countries) => {
	let countryMatrix = [];
	const matrixDimensions = getMatrixDimensions(countries);

	initializeMatrix(countryMatrix, matrixDimensions);
	setMatrixValues(countryMatrix, countryNames, countries);

	// Clone of countryMatrix. Used for money manipulation during each iteration
	const transactionMatrix = _.cloneDeep(countryMatrix);

	return calculateDiffusion(countryMatrix, transactionMatrix, countryNames);
};

// Get matrix dimensions by finding the bigest x and y for upper right country point
const getMatrixDimensions = (countries) => {
	return {
		maxRows: countries.reduce(
			(acc, country) =>
				country.dimensions.yh > acc ? country.dimensions.yh : acc,
			0
		),
		maxColumns: countries.reduce(
			(acc, country) =>
				country.dimensions.xh > acc ? country.dimensions.xh : acc,
			0
		),
	};
};

// Initializing matrix with empty objects
const initializeMatrix = (countryMatrix, matrixDimensions) => {
	for (let rowIndex = 0; rowIndex <= matrixDimensions.maxRows; rowIndex++) {
		const matrixRow = [];
		for (
			let columnIndex = 0;
			columnIndex <= matrixDimensions.maxColumns;
			columnIndex++
		) {
			const emptyCity = {};
			matrixRow.push(emptyCity);
		}
		countryMatrix.push(matrixRow);
	}
};

// Setting matrix city objects by rewriting empty objects depending on country coordinates
const setMatrixValues = (countryMatrix, countryNames, countries) => {
	for (const country of countries) {
		for (
			let rowIndex = country.dimensions.yl;
			rowIndex <= country.dimensions.yh;
			rowIndex++
		) {
			for (
				let columnIndex = country.dimensions.xl;
				columnIndex <= country.dimensions.xh;
				columnIndex++
			) {
				const city = { country: country.name };

				// Setting number of coins from each country on start
				for (const countryName of countryNames) {
					city[countryName] =
						country.name === countryName ? INITIAL_COINS : 0;
				}
				countryMatrix[rowIndex][columnIndex] = city;
			}
		}
	}
};

// Calculating number of iterations for each country
const calculateDiffusion = (countryMatrix, transactionMatrix, countryNames) => {
	if (countryNames.length === 1) {
		return [
			{
				countryName: countryNames[0],
				iteration: 0,
			},
		];
	}

	let iteration = 1;
	const completedCountries = [];

	while (
		iteration < MAX_ITERATIONS && // To avoid infinite cycle
		completedCountries.length < countryNames.length
	) {
		// Go to each city and make transaction to surounding cities depending on city current balance
		for (let rowIndex = 0; rowIndex < countryMatrix.length; rowIndex++) {
			for (
				let columnIndex = 0;
				columnIndex < countryMatrix[rowIndex].length;
				columnIndex++
			) {
				const currentCity = countryMatrix[rowIndex][columnIndex];
				if (!currentCity.country) {
					continue;
				}

				const transactionCurrentCity =
					transactionMatrix[rowIndex][columnIndex];
				const transactionSurroundingCities = [
					(transactionMatrix[rowIndex - 1] || [])[columnIndex],
					(transactionMatrix[rowIndex] || [])[columnIndex - 1],
					(transactionMatrix[rowIndex] || [])[columnIndex + 1],
					(transactionMatrix[rowIndex + 1] || [])[columnIndex],
				];
				for (const transactionCity of transactionSurroundingCities) {
					if (transactionCity && transactionCity.country) {
						// Send to surounging cities coins of EACH country depending on city current balance
						for (const countryName of countryNames) {
							const value = Math.floor(
								currentCity[countryName] / PORTION_DIVIDER
							);
							transactionCity[countryName] += value;
							transactionCurrentCity[countryName] -= value;
						}
					}
				}
			}
		}

		// After all transactions change main matrix to transaction matrix that has updated values for coins numbers
		countryMatrix = _.cloneDeep(transactionMatrix);

		// Check if country has coins of all other countries
		for (const countryName of countryNames) {
			// Get only this country cities
			const countryCities = _.flatten(countryMatrix).filter(
				(city) => city.country === countryName
			);

			// Check if all cities of country have coins of all other countries and
			// this country have not already been added to the result
			if (
				checkCountryCompleted(countryCities, countryNames) &&
				!completedCountries.some(
					(country) => country.countryName === countryName
				)
			) {
				completedCountries.push({
					countryName,
					iteration,
				});
			}
		}

		iteration++;
	}

	return completedCountries;
};

const checkCountryCompleted = (countryCities, countryNames) => {
	return countryCities.every((city) => {
		for (const countryName of countryNames) {
			if (city[countryName] === 0) {
				return false;
			}
		}
		return true;
	});
};

module.exports = {
	euroDiffusion,
};
