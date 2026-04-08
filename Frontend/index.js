const getResponse = await fetch("http://localhost:5173/products");
const productsJson = await getResponse.json();
const productssList = document.querySelector("ul[name=products_list]");
for (let i = 0; i < productsJson.length; i++) {
	const product = productsJson[i];
	const name = product.name;
	const price = product.price;
	const inventoryCount = product.inventoryCount;
	const newLi = document.createElement("li");
	newLi.innerText = `Name: ${name}, Price: ${price}, Inventory: ${inventoryCount}`;
	productssList.appendChild(newLi);
}
