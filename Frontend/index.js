const productsList = document.querySelector('ul[name="products_list"]');
const user = JSON.parse(localStorage.getItem("user"));

const receipt = document.getElementById("receipt");
const savedReceipt = JSON.parse(localStorage.getItem("receipt") || "null");

if (receipt && savedReceipt) {
	receipt.innerHTML = `
		<h3>Last Purchase Receipt</h3>
		<p>Item: ${savedReceipt.name}</p>
		<p>Price: $${Number(savedReceipt.price).toFixed(2)}</p>
		<p>Remaining: ${savedReceipt.remaining}</p>
		<p>Time: ${savedReceipt.time}</p>
	`;

	localStorage.removeItem("receipt");
}

if (productsList) {
	const res = await fetch("http://localhost:5168/products");
	const data = await res.json();

	data.forEach((product) => {
		const li = document.createElement("li");

		const name = product.name;

		const text = document.createElement("span");
		text.innerText = `Name: ${name}, Price: $${Number(product.price).toFixed(2)}, Inventory: ${product.inventoryCount}`;

		const purchaseBtn = document.createElement("button");
		purchaseBtn.innerText = "Purchase";
		purchaseBtn.dataset.id = product.id;

		if (!user) {
			purchaseBtn.disabled = true;
			purchaseBtn.innerText = "Login to Purchase";
		}

		purchaseBtn.addEventListener("click", async () => {
			try {
				const res = await fetch("http://localhost:5168/purchase", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						productId: product.id,
					}),
				});

				const data = await res.json();

				if (!res.ok) {
					alert(data);
					return;
				}

				const message = {
					name: data.name,
					price: data.price,
					remaining: data.remainingInventory,
					time: new Date().toLocaleString(),
				};

				localStorage.setItem("receipt", JSON.stringify(message));

				const receiptEl = document.getElementById("receipt");

				if (receiptEl) {
					receiptEl.innerHTML = `
						<h3>Purchase Successful</h3>
						<p>Item: ${message.name}</p>
						<p>Price: $${Number(message.price).toFixed(2)}</p>
						<p>Remaining: ${message.remaining}</p>
						<p>Time: ${message.time}</p>
					`;
				}

				text.innerText = `Name: ${data.name}, Price: $${Number(data.price).toFixed(2)}, Inventory: ${data.remainingInventory}`;

				if (data.remainingInventory <= 0) {
					purchaseBtn.disabled = true;
					purchaseBtn.innerText = "Out of stock";
				}
			} catch (err) {
				alert("Purchase failed");
				console.error(err);
			}
		});

		li.appendChild(text);
		li.appendChild(document.createElement("br"));
		li.appendChild(purchaseBtn);

		productsList.appendChild(li);
	});
}

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

			const text = document.createElement("span");
			text.innerText = `Name: ${created.name}, Price: $${Number(created.price).toFixed(2)}, Inventory: ${created.inventoryCount}`;

			const button = document.createElement("button");
			button.innerText = "Purchase";
			button.dataset.id = created.id;

			button.addEventListener("click", () => {
				alert(`Purchasing product: ${created.name}`);
			});

			li.appendChild(text);
			li.appendChild(document.createElement("br"));
			li.appendChild(button);

			list.appendChild(li);
		}

		form.reset();
	});
}
