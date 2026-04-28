document.addEventListener("DOMContentLoaded", async () => {
	const productsList = document.querySelector('ul[name="products_list"]');
	const user = JSON.parse(localStorage.getItem("user"));

	const receipt = document.getElementById("receipt");
	const savedReceipt = JSON.parse(localStorage.getItem("receipt") || "null");

	if (receipt && savedReceipt) {
		receipt.innerHTML = `
			<h3>Last Purchase Receipt</h3>
			<p>Item: ${savedReceipt.name}</p>
			<p>Quantity: ${savedReceipt.quantity}</p>
			<p>Price: $${Number(savedReceipt.price).toFixed(2)}</p>
			<p>Remaining: ${savedReceipt.remaining}</p>
			<p>Time: ${savedReceipt.time}</p>
		`;

		localStorage.removeItem("receipt");
	}

	// =========================
	// PRODUCTS LIST
	// =========================
	if (productsList) {
		const res = await fetch("http://localhost:5168/products");
		const data = await res.json();

		data.forEach((product) => {
			const li = document.createElement("li");

			const text = document.createElement("span");
			text.innerText = `Name: ${product.name}, Price: $${Number(product.price).toFixed(2)}, Inventory: ${product.inventoryCount}`;

			const qtyInput = document.createElement("input");
			qtyInput.type = "number";
			qtyInput.min = "1";
			qtyInput.value = "1";

			let purchaseBtn = null;

			if (user) {
				purchaseBtn = document.createElement("button");
				purchaseBtn.innerText = "Purchase";
				purchaseBtn.dataset.id = product.id;
			}

			let editBtn = null;

			if (user && product.userId === user.id) {
				editBtn = document.createElement("button");
				editBtn.innerText = "Edit";
				editBtn.dataset.id = product.id;

				editBtn.addEventListener("click", async () => {
					const newName = prompt("New name:", product.name);
					const newPrice = prompt("New price:", product.price);
					const newInventory = prompt("New inventory:", product.inventoryCount);

					if (!newName || !newPrice || !newInventory) return;

					try {
						const res = await fetch(`http://localhost:5168/products/${product.id}`, {
							method: "PUT",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								name: newName,
								price: Number(newPrice),
								inventoryCount: Number(newInventory),
								userId: user.id,
							}),
						});

						const updated = await res.json();

						if (!res.ok) {
							alert(updated);
							return;
						}

						text.innerText = `Name: ${updated.name}, Price: $${Number(updated.price).toFixed(2)}, Inventory: ${updated.inventoryCount}`;
					} catch (err) {
						console.error(err);
						alert("Update failed");
					}
				});
			}

			const updateButtonState = () => {
				const qty = Number(qtyInput.value);
				if (!purchaseBtn) {
					return;
				}
				if (!user || qty <= 0 || qty > product.inventoryCount) {
					purchaseBtn.disabled = true;
				} else {
					purchaseBtn.disabled = false;
				}
			};

			qtyInput.addEventListener("input", updateButtonState);
			updateButtonState();

			if (purchaseBtn) {
				purchaseBtn.addEventListener("click", async () => {
					try {
						if (!user) {
							alert("You must be logged in");
							return;
						}

						const res = await fetch("http://localhost:5168/purchase", {
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								productId: product.id,
								quantity: Number(qtyInput.value),
								userId: user.id,
							}),
						});

						const data = await res.json();

						if (!res.ok) {
							alert(data);
							return;
						}

						const message = {
							name: data.name,
							quantity: Number(qtyInput.value),
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
							<p>Quantity: ${message.quantity}</p>
							<p>Price: $${Number(message.price).toFixed(2)}</p>
							<p>Remaining: ${message.remaining}</p>
							<p>Time: ${message.time}</p>
						`;
						}

						text.innerText = `Name: ${data.name}, Price: $${Number(data.price).toFixed(2)}, Inventory: ${data.remainingInventory}`;
						product.inventoryCount = data.remainingInventory;
						updateButtonState();

						if (data.remainingInventory <= 0) {
							purchaseBtn.disabled = true;
							purchaseBtn.innerText = "Out of stock";
						}
					} catch (err) {
						alert("Purchase failed");
						console.error(err);
					}
				});
			}

			li.appendChild(text);

			if (user) {
				li.appendChild(document.createElement("br"));
				li.appendChild(qtyInput);
				li.appendChild(document.createElement("br"));
				li.appendChild(purchaseBtn);
			}

			if (editBtn) {
				li.appendChild(editBtn);
			}

			productsList.appendChild(li);
		});
	}

	// =========================
	// LOGOUT
	// =========================
	const registerBtn = document.getElementById("register_btn");
	const loginBtn = document.getElementById("login_btn");
	const logoutBtn = document.getElementById("logout_btn");
	const welcomeMessage = document.getElementById("welcome_message");

	if (user) {
		if (welcomeMessage) {
			welcomeMessage.innerText = `Welcome ${user.email}`;
		}

		if (logoutBtn) {
			logoutBtn.style.display = "block";

			logoutBtn.addEventListener("click", () => {
				localStorage.removeItem("user");
				location.reload();
			});
		}

		if (registerBtn) {
			registerBtn.style.display = "none";
		}

		if (loginBtn) {
			loginBtn.style.display = "none";
		}
	} else {
		if (logoutBtn) {
			logoutBtn.style.display = "none";
		}

		if (registerBtn) {
			registerBtn.style.display = "inline-block";
		}

		if (loginBtn) {
			loginBtn.style.display = "inline-block";
		}
	}

	// =========================
	// PRODUCT CREATION FORM
	// =========================
	const form = document.querySelector('form[name="product_creation"]');

	if (form) {
		const nameInput = form.querySelector('input[name="name"]');
		const priceInput = form.querySelector('input[name="price"]');
		const inventoryInput = form.querySelector('input[name="inventoryCount"]');
		const submitBtn = form.querySelector('button[type="submit"]');

		if (!nameInput || !priceInput || !inventoryInput || !submitBtn) {
			console.error("Product form is missing inputs");
			return;
		}

		const validateForm = () => {
			const name = nameInput.value.trim();
			const price = Number(priceInput.value);
			const inventory = Number(inventoryInput.value);

			submitBtn.disabled = !(name && price > 0 && inventory > 0);
		};

		nameInput.addEventListener("input", validateForm);
		priceInput.addEventListener("input", validateForm);
		inventoryInput.addEventListener("input", validateForm);

		validateForm();

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
				userId: user.id,
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

				li.appendChild(text);
				li.appendChild(document.createElement("br"));
				li.appendChild(button);

				list.appendChild(li);
			}

			form.reset();
		});
	}
});
