const { faker } = require("@faker-js/faker");

describe("products", () => {
	// =========================
	// PRODUCTS - LISTING
	// =========================
	it("lists products", () => {
		cy.visit("http://localhost:5173/");

		cy.get("h1").should("have.text", "Products:");
		cy.get('ul[name="products_list"]').should("be.visible");
	});

	// =========================
	// PRODUCTS - CREATE
	// (must be logged in)
	// =========================
	it("creates products", () => {
		const name = faker.commerce.productName();
		const price = faker.commerce.price({ min: 1, max: 300 });
		const inventoryCount = faker.number.int({ min: 1, max: 1000 });

		// simulate logged-in user
		cy.visit("http://localhost:5173/", {
			onBeforeLoad(win) {
				win.localStorage.setItem(
					"user",
					JSON.stringify({ id: 1, email: "test@test.com" }),
				);
			},
		});

		cy.get('form[name="product_creation"]').should("be.visible");

		cy.get('form input[name="name"]').type(name);
		cy.get('form input[name="price"]').type(price);
		cy.get('form input[name="inventoryCount"]').type(inventoryCount);

		cy.get('form button[type="submit"]').should("have.text", "Create Product").click();

		cy.get('ul[name="products_list"] li:last')
			.should("be.visible")
			.should(
				"have.text",
				`Name: ${name}, Price: $${Number(price).toFixed(2)}, Inventory: ${inventoryCount}`,
			);
	});

	// =========================
	// REGISTER - SUCCESS
	// =========================
	it("registers a new user successfully", () => {
		cy.visit("http://localhost:5173/registration.html");

		const email = `test${Date.now()}@test.com`;

		cy.get("#email").should("be.visible").and("have.attr", "required");
		cy.get("#password").should("be.visible").and("have.attr", "required");

		cy.get("#email").type(email);
		cy.get("#password").type("password123");

		cy.get("#user_registration").submit();

		cy.contains("Account created").should("be.visible");
	});

	// =========================
	// REGISTER - DUPLICATE
	// =========================
	it("shows error for duplicate email", () => {
		const email = `dup${Date.now()}@test.com`;

		// first registration
		cy.visit("http://localhost:5173/registration.html");
		cy.get("#email").type(email);
		cy.get("#password").type("password123");
		cy.get("#user_registration").submit();

		cy.contains("Account created").should("be.visible");

		// second registration (duplicate)
		cy.visit("http://localhost:5173/registration.html");
		cy.get("#email").type(email);
		cy.get("#password").type("password123");
		cy.get("#user_registration").submit();

		cy.contains("Email already exists").should("be.visible");
	});

	// =========================
	// LOGIN FORM VISIBILITY
	// =========================
	it("shows login form when not logged in", () => {
		cy.visit("http://localhost:5173/login.html");

		cy.get("#email").should("be.visible").and("have.attr", "required");
		cy.get("#password").should("be.visible").and("have.attr", "required");
	});

	// =========================
	// LOGIN SUCCESS
	// =========================
	it("logs in user", () => {
		cy.visit("http://localhost:5173/login.html");

		cy.get("#email").type("test@test.com");
		cy.get("#password").type("password123");

		cy.get("#login_form").submit();

		// better than checking DOM text (redirect happens)
		cy.url().should("include", "index.html");
	});

	// =========================
	// LOGOUT VISIBILITY
	// =========================
	it("shows logout when logged in", () => {
		cy.visit("http://localhost:5173/", {
			onBeforeLoad(win) {
				win.localStorage.setItem(
					"user",
					JSON.stringify({ id: 1, email: "test@test.com" }),
				);
			},
		});

		cy.get("#logout_btn").should("be.visible");
	});

	// =========================
	// BLOCK PRODUCT CREATION
	// =========================
	it("blocks product creation when not logged in", () => {
		cy.visit("http://localhost:5173/");

		cy.get('form[name="product_creation"]').submit();

		cy.on("window:alert", (txt) => {
			expect(txt).to.contain("logged in");
		});
	});
});
