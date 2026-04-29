const { faker } = require("@faker-js/faker");

describe("products", () => {
	// =========================
	// HELPERS
	// =========================
	function loginUser1() {
		cy.visit("http://localhost:5173/", {
			onBeforeLoad(win) {
				win.localStorage.setItem(
					"user",
					JSON.stringify({
						id: 1,
						email: "test1@test.com",
					}),
				);
			},
		});
	}

	function loginUser2() {
		cy.visit("http://localhost:5173/", {
			onBeforeLoad(win) {
				win.localStorage.setItem(
					"user",
					JSON.stringify({
						id: 2,
						email: "test2@test.com",
					}),
				);
			},
		});
	}

	// =========================
	// PRODUCTS - LISTING (BASE STATE)
	// =========================
	it("lists all products", () => {
		cy.visit("http://localhost:5173/");

		cy.get("h1").should("have.text", "Products:");

		cy.get('ul[name="products_list"]')
			.should("be.visible")
			.find("li")
			.should("have.length", 4);
	});

	// =========================
	// LOGGED OUT UI
	// =========================
	it("hides purchase buttons while logged out", () => {
		cy.clearLocalStorage();
		cy.visit("http://localhost:5173/");
		cy.contains("Purchase").should("not.exist");
	});

	it("hides edit buttons while logged out", () => {
		cy.clearLocalStorage();
		cy.visit("http://localhost:5173/");
		cy.contains("Edit").should("not.exist");
	});

	it("tries to create product while logged out", () => {
		cy.visit("http://localhost:5173/");

		cy.get('input[name="name"]').type("Blocked Product");
		cy.get('input[name="price"]').type("100");
		cy.get('input[name="inventoryCount"]').type("10");

		cy.on("window:alert", (txt) => {
			expect(txt).to.contain("logged in");
		});

		cy.get('form[name="product_creation"]').submit();

		cy.contains("Blocked Product").should("not.exist");
	});

	// =========================
	// AUTH FLOW
	// =========================
	it("registers a new user", () => {
		const email = `test${Date.now()}@test.com`;

		cy.visit("http://localhost:5173/registration.html");

		cy.get("#email").type(email);
		cy.get("#password").type("password123");

		cy.get("#user_registration").submit();

		cy.contains("Account created").should("be.visible");
	});

	it("shows error for duplicate email", () => {
		cy.visit("http://localhost:5173/registration.html");

		cy.get("#email").type("test1@test.com");
		cy.get("#password").type("password123");

		cy.get("#user_registration").submit();

		cy.contains("Email already exists").should("be.visible");
	});

	it("logs in new user", () => {
		const email = `new${Date.now()}@test.com`;

		cy.visit("http://localhost:5173/registration.html");

		cy.get("#email").type(email);
		cy.get("#password").type("password123");

		cy.get("#user_registration").submit();

		cy.visit("http://localhost:5173/login.html");

		cy.get("#email").type(email);
		cy.get("#password").type("password123");

		cy.get("#login_form").submit();

		cy.url().should("include", "index.html");
	});

	it("hides login and register buttons when logged in", () => {
		loginUser1();

		cy.get("#login_btn").should("not.be.visible");
		cy.get("#register_btn").should("not.be.visible");
		cy.get("#logout_btn").should("be.visible");
	});

	it("logs out user", () => {
		loginUser1();

		cy.get("#logout_btn").click();

		cy.window().then((win) => {
			expect(win.localStorage.getItem("user")).to.be.null;
		});
	});

	it("shows login and register buttons when logged out", () => {
		cy.clearLocalStorage();

		cy.visit("http://localhost:5173/");

		cy.get("#login_btn").should("be.visible");
		cy.get("#register_btn").should("be.visible");
		cy.get("#logout_btn").should("not.be.visible");
	});

	// =========================
	// PRODUCT CREATION
	// =========================
	it("creates new product", () => {
		loginUser1();

		const name = faker.commerce.productName();
		const price = faker.number.int({ min: 1, max: 999 });
		const inventory = faker.number.int({ min: 1, max: 100 });

		cy.get('input[name="name"]').type(name);
		cy.get('input[name="price"]').type(price.toString());
		cy.get('input[name="inventoryCount"]').type(inventory.toString());

		cy.get('button[type="submit"]').click();

		cy.contains(name).should("be.visible");
	});

	// =========================
	// PRODUCT UI (OWNER / NON-OWNER)
	// =========================
	it("shows edit button for product owner", () => {
		loginUser1();

		cy.get('li[data-product-id="1"]').within(() => {
			cy.contains("Edit").should("be.visible");
		});
	});

	it("hides edit button for non-owner", () => {
		loginUser1();

		cy.get('li[data-product-id="3"]').within(() => {
			cy.contains("Edit").should("not.exist");
		});
	});

	it("shows delete button for product owner", () => {
		loginUser1();

		cy.get('li[data-product-id="1"]').within(() => {
			cy.contains("Delete").should("be.visible");
		});
	});

	it("hides delete button for non-owner", () => {
		loginUser1();

		cy.get('li[data-product-id="3"]').within(() => {
			cy.contains("Delete").should("not.exist");
		});
	});

	// =========================
	// PURCHASE FLOW (UI)
	// =========================
	it("calls purchase API and updates UI", () => {
		loginUser1();

		cy.get('li[data-product-id="3"]').as("product");

		cy.get("@product").within(() => {
			cy.contains("Purchase").click();
		});

		cy.get("#receipt").should("contain.text", "Purchase Successful");
	});

	it("displays receipt after purchase", () => {
		loginUser1();

		cy.get('li[data-product-id="3"]').within(() => {
			cy.contains("Purchase").click();
		});

		cy.get("#receipt").should("contain.text", "Item:").and("contain.text", "Price:");
	});

	it("persists receipt after page reload", () => {
		loginUser1();

		cy.get('li[data-product-id="3"]').within(() => {
			cy.contains("Purchase").click();
		});

		cy.reload();

		cy.get("#receipt").should("contain.text", "Item:").and("contain.text", "Remaining:");
	});

	// =========================
	// PURCHASE BUTTON VALIDATION
	// =========================
	it("disables purchase button when quantity <= 0", () => {
		loginUser1();

		cy.get('li[data-product-id="3"]').within(() => {
			cy.get("input[type='number']").first().clear().type("0");

			cy.contains("Purchase").should("be.disabled");
		});
	});

	it("disables purchase button when quantity exceeds inventory", () => {
		loginUser1();

		cy.get('li[data-product-id="3"]').within(() => {
			cy.get("input[type='number']").first().clear().type("99999");

			cy.contains("Purchase").should("be.disabled");
		});
	});

	// =========================
	// EDIT PRODUCT
	// =========================
	it("allows owner to edit product", () => {
		loginUser1();

		const updatedName = faker.commerce.productName();

		cy.window().then((win) => {
			cy.stub(win, "prompt")
				.onFirstCall()
				.returns(updatedName)
				.onSecondCall()
				.returns("100")
				.onThirdCall()
				.returns("10");
		});

		cy.get('li[data-product-id="1"]').within(() => {
			cy.contains("Edit").click();
		});

		cy.get("body").should("contain.text", updatedName);
	});

	// =========================
	// DELETE PRODUCT
	// =========================
	it("allows owner to delete product", () => {
		loginUser1();

		cy.get('li[data-product-id="1"]').within(() => {
			cy.contains("Delete").click();
		});

		cy.get('li[data-product-id="1"]').should("not.exist");
	});

	it("rejects deleting another user's product", () => {
		loginUser1();

		cy.request({
			method: "DELETE",
			url: "http://localhost:5168/products/3",
			failOnStatusCode: false,
			body: { userId: 1 },
		})
			.its("status")
			.should("eq", 403);
	});

	// =========================
	// PURCHASE API VALIDATION (BACKEND)
	// =========================
	it("allows valid purchase", () => {
		cy.visit("http://localhost:5173/");

		cy.get("li[data-product-id]")
			.first()
			.invoke("attr", "data-product-id")
			.then((id) => {
				cy.request("POST", "http://localhost:5168/purchase", {
					productId: Number(id),
					quantity: 1,
					userId: 1,
				})
					.its("status")
					.should("eq", 200);
			});
	});

	it("rejects negative quantity", () => {
		cy.request({
			method: "POST",
			url: "http://localhost:5168/purchase",
			failOnStatusCode: false,
			body: { productId: 1, quantity: -1, userId: 1 },
		})
			.its("status")
			.should("eq", 400);
	});

	it("rejects purchase greater than inventory", () => {
		cy.request({
			method: "POST",
			url: "http://localhost:5168/purchase",
			failOnStatusCode: false,
			body: { productId: 1, quantity: 99999, userId: 1 },
		})
			.its("status")
			.should("eq", 400);
	});

	it("rejects invalid user purchase", () => {
		cy.request({
			method: "POST",
			url: "http://localhost:5168/purchase",
			failOnStatusCode: false,
			body: { productId: 1, quantity: 1, userId: 999 },
		})
			.its("status")
			.should("eq", 400);
	});
});
