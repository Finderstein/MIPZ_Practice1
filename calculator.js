const _ = require('lodash');

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
	for (let row = 0; row <= matrixDimensions.maxRows; row++) {
		const row = [];
		for (let column = 0; column <= matrixDimensions.maxColumns; column++) {
			const emptyCity = {};
			row.push(emptyCity);
		}
		countryMatrix.push(row);
	}
};

// Setting matrix city objects by rewriting empty objects depending on country coordinates
const setMatrixValues = (countryMatrix, countryNames, countries) => {
	for (const country of countries) {
		for (
			let row = country.dimensions.yl;
			row <= country.dimensions.yh;
			row++
		) {
			for (
				let column = country.dimensions.xl;
				column <= country.dimensions.xh;
				column++
			) {
				const city = { country: country.name };

				// Setting number of coins from each country on start
				for (const countryName of countryNames) {
					city[countryName] =
						country.name === countryName ? 1000000 : 0;
				}
				countryMatrix[row][column] = city;
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
		iteration < 1000000 && // To avoid infinite cycle
		completedCountries.length < countryNames.length
	) {
		// Go to each city and make transaction to surounding cities depending on city current balance
		for (let row = 0; row < countryMatrix.length; row++) {
			for (let column = 0; column < countryMatrix[row].length; column++) {
				const currentCity = countryMatrix[row][column];
				if (!currentCity.country) {
					continue;
				}

				const transactionCurrentCity = transactionMatrix[row][column];
				const transactionSurroundingCities = [
					(transactionMatrix[row - 1] || [])[column],
					(transactionMatrix[row] || [])[column - 1],
					(transactionMatrix[row] || [])[column + 1],
					(transactionMatrix[row + 1] || [])[column],
				];
				for (const transactionCity of transactionSurroundingCities) {
					if (transactionCity && transactionCity.country) {
						// Send to surounging cities coins of EACH country depending on city current balance
						for (const countryName of countryNames) {
							const value = Math.floor(
								currentCity[countryName] / 1000
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

			// Check if some of them DO NOT HAVE coins of other countries
			const countryNotComplete = countryCities.some((city) => {
				for (const countryName of countryNames) {
					const haveCoinsOfThisCountry = city[countryName] > 0;
					if (!haveCoinsOfThisCountry) {
						return true;
					}
				}
				return false;
			});

			// Check if all cities of country have coins of all other countries and
			// this country have not already been added to the result
			if (
				!countryNotComplete &&
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

module.exports = {
	euroDiffusion,
};
