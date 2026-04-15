function sortProducts(products, sortType) {
	const sortedProducts = products;

	switch (sortType) {
		case "nameAsc":
			sortedProducts.sort((previous, current) => {
				if (previous.name < current.name) {
					return -1;
				} else if (previous.name > current.name) {
					return 1;
				}
				return 0;
			});
			break;
		case "priceDesc":
			sortedProducts.sort((previous, current) => {
				if (previous.price > current.price) {
					return -1;
				} else if (previous.price < current.price) {
					return 1;
				}
				return 0;
			});
			break;
		case "priceAsc":
			sortedProducts.sort((previous, current) => {
				if (previous.price < current.price) {
					return -1;
				} else if (previous.price > current.price) {
					return 1;
				}
				return 0;
			});
			break;
		case "ratingDesc":
			sortedProducts.sort((previous, current) => {
				if (previous.rating > current.rating) {
					return -1;
				} else if (previous.rating < current.rating) {
					return 1;
				}
				return 0;
			});
			break;
		case "ratingAsc":
			sortedProducts.sort((previous, current) => {
				if (previous.rating < current.rating) {
					return -1;
				} else if (previous.rating > current.rating) {
					return 1;
				}
				return 0;
			});
			break;
	}
	return sortedProducts;
}

module.exports = sortProducts;
