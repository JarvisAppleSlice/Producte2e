const getResponse = await fetch("http://localhost:5168/products");
const productsJson = await getResponse.json();
const productsList = document.querySelector("ul[name=products_list]");
for (let i = 0; i < productsJson.length; i++) {
	const product = productsJson[i];
	const name = product.name;
	const price = product.price;
	const inventoryCount = product.inventoryCount;
	const newLi = document.createElement("li");
	newLi.innerText = `Name: ${name}, Price: $${Number(price)}, Inventory: ${inventoryCount}`;
	productsList.appendChild(newLi);
}

const form = document.querySelector("form");
form.addEventListener("submit", async (e) => {
	e.preventDefault();
	const formData = new FormData(form);
	const body = {
		Name: formData.get("name"),
		Price: formData.get("price"),
		inventoryCount: formData.get("inventoryCount"),
	};
	console.log("formData");
	console.log(formData.get("name"));
	console.log(formData.get("price"));
	console.log(formData.get("inventoryCount"));
	await fetch("http://localhost:5168/products", {
		method: "post",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});
	location.reload();
});
