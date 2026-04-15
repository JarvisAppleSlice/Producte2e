const sortProducts = require("../util/sort-products");

describe("sortProducts", () => {
	const unsortedProducts = [
		{ name: "Laptop", price: 999.99, inventoryCount: 10, rating: 5 },
		{ name: "Mouse", price: 25.5, inventoryCount: 50, rating: 0 },
		{ name: "Keyboard", price: 75.0, inventoryCount: 30, rating: 3 },
	];

	it("sorts products by name alphabetically", () => {
		const expectedSorting = [
			{ name: "Keyboard", price: 75.0, inventoryCount: 30, rating: 3 },
			{ name: "Laptop", price: 999.99, inventoryCount: 10, rating: 5 },
			{ name: "Mouse", price: 25.5, inventoryCount: 50, rating: 0 },
		];
		console.log("Before sorting alphabetically:", unsortedProducts);

		const actualSorting = sortProducts(unsortedProducts, "nameAsc");

		console.log("After sorting alphabetically:", actualSorting);

		expect(actualSorting).toEqual(expectedSorting);
	});
	it("sorts products by decreasing price", () => {
		const expectedSorting = [
			{ name: "Laptop", price: 999.99, inventoryCount: 10, rating: 5 },
			{ name: "Keyboard", price: 75.0, inventoryCount: 30, rating: 3 },
			{ name: "Mouse", price: 25.5, inventoryCount: 50, rating: 0 },
		];
		console.log("Before sorting by decreasing price:", unsortedProducts);

		const actualSorting = sortProducts(unsortedProducts, "priceDesc");

		console.log("After sorting by decreasing price:", actualSorting);

		expect(actualSorting).toEqual(expectedSorting);
	});
	it("sorts products by increasing price", () => {
		const expectedSorting = [
			{ name: "Mouse", price: 25.5, inventoryCount: 50, rating: 0 },
			{ name: "Keyboard", price: 75.0, inventoryCount: 30, rating: 3 },
			{ name: "Laptop", price: 999.99, inventoryCount: 10, rating: 5 },
		];
		console.log("Before sorting by increasing price:", unsortedProducts);

		const actualSorting = sortProducts(unsortedProducts, "priceAsc");

		console.log("After sorting by increasing price:", actualSorting);

		expect(actualSorting).toEqual(expectedSorting);
	});
	it("sorts products by decreasing rating", () => {
		const expectedSorting = [
			{ name: "Laptop", price: 999.99, inventoryCount: 10, rating: 5 },
			{ name: "Keyboard", price: 75.0, inventoryCount: 30, rating: 3 },
			{ name: "Mouse", price: 25.5, inventoryCount: 50, rating: 0 },
		];
		console.log("Before sorting by decreasing rating:", unsortedProducts);

		const actualSorting = sortProducts(unsortedProducts, "ratingDesc");

		console.log("After sorting by decreasing rating:", actualSorting);

		expect(actualSorting).toEqual(expectedSorting);
	});
	it("sorts products by increasing rating", () => {
		const expectedSorting = [
			{ name: "Mouse", price: 25.5, inventoryCount: 50, rating: 0 },
			{ name: "Keyboard", price: 75.0, inventoryCount: 30, rating: 3 },
			{ name: "Laptop", price: 999.99, inventoryCount: 10, rating: 5 },
		];
		console.log("Before sorting by increasing rating:", unsortedProducts);

		const actualSorting = sortProducts(unsortedProducts, "ratingAsc");

		console.log("After sorting by increasing rating:", actualSorting);

		expect(actualSorting).toEqual(expectedSorting);
	});
});
