const productsList = document.querySelector('ul[name="products_list"]');

if (productsList) {
	const res = await fetch("http://localhost:5168/products");
	const data = await res.json();

	data.forEach((product) => {
		const li = document.createElement("li");
		li.innerText = `Name: ${product.name}, Price: $${Number(product.price)}, Inventory: ${product.inventoryCount}`;
		productsList.appendChild(li);
	});
}

const user = JSON.parse(localStorage.getItem("user"));
const logoutBtn = document.getElementById("logout_btn");

const welcomeMessage = document.getElementById("welcome_message");

if (user && welcomeMessage) {
	welcomeMessage.innerText = `Welcome ${user.email}`;
}

if (logoutBtn) {
	if (user) {
		logoutBtn.style.display = "block";

		logoutBtn.addEventListener("click", () => {
			localStorage.removeItem("user");
			location.reload();
		});
	} else {
		logoutBtn.style.display = "none";
	}
}

const form = document.querySelector('form[name="product_creation"]');

if (form) {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const user = localStorage.getItem("user");

		if (!user) {
			alert("You must be logged in to create products");
			return;
		}

		const formData = new FormData(form);

		const body = {
			name: formData.get("name"),
			price: formData.get("price"),
			inventoryCount: formData.get("inventoryCount"),
		};

		const res = await fetch("http://localhost:5168/products", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(body),
		});

		const created = await res.json();

		const list = document.querySelector('ul[name="products_list"]');

		if (list) {
			const li = document.createElement("li");
			li.innerText = `Name: ${created.name}, Price: $${Number(created.price).toFixed(2)}, Inventory: ${created.inventoryCount}`;
			list.appendChild(li);
		}

		form.reset();
	});
}
