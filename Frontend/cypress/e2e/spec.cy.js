const { faker } = require("@faker-js/faker");

describe("products", () => {
	// =========================
	// PRODUCTS - LISTING
	// =========================
	it("lists products", () => {
		cy.visit("http://localhost:5173/");

		cy.get("h1").should("have.text", "Products:");
		cy.get('ul[name="products_list"]')
			.should("be.visible")
			.find("li")
			.should("have.length.greaterThan", 0);
	});

	function login() {
		cy.request("POST", "http://localhost:5168/login", {
			email: "test@test.com",
			passwordHash: "password123",
		}).then((res) => {
			window.localStorage.setItem("user", JSON.stringify(res.body));
		});
	}

	// =========================
	// PRODUCTS - CREATE
	// =========================
	it("creates products", () => {
		const name = faker.commerce.productName();
		const price = faker.commerce.price({ min: 1, max: 300 });
		const inventoryCount = faker.number.int({ min: 1, max: 1000 });

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

		cy.get('form button[type="submit"]').click();

		cy.get('ul[name="products_list"] li:last')
			.should("be.visible")
			.and("contain.text", name)
			.and("contain.text", inventoryCount);
	});

	// =========================
	// REGISTER - SUCCESS
	// =========================
	it("registers a new user successfully", () => {
		cy.visit("http://localhost:5173/registration.html");

		const email = `test${Date.now()}@test.com`;

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

		cy.visit("http://localhost:5173/registration.html");
		cy.get("#email").type(email);
		cy.get("#password").type("password123");
		cy.get("#user_registration").submit();

		cy.contains("Account created").should("be.visible");

		cy.visit("http://localhost:5173/registration.html");
		cy.get("#email").type(email);
		cy.get("#password").type("password123");
		cy.get("#user_registration").submit();

		cy.contains("Email already exists").should("be.visible");
	});

	// =========================
	// LOGIN
	// =========================
	it("logs in user", () => {
		cy.visit("http://localhost:5173/login.html");

		cy.get("#email").type("test@test.com");
		cy.get("#password").type("password123");

		cy.get("#login_form").submit();

		cy.url().should("include", "index.html");
	});

	// =========================
	// LOGOUT
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

	// =========================
	// PURCHASE BUTTON UI
	// =========================
	it("shows purchase button for products", () => {
		cy.visit("http://localhost:5173/index.html");

		cy.get("ul[name='products_list'] li")
			.first()
			.within(() => {
				cy.contains("Purchase").should("be.visible");
			});
	});

	it("shows login message when not logged in", () => {
		cy.clearLocalStorage();
		cy.visit("http://localhost:5173/index.html");

		cy.get("ul[name='products_list'] li")
			.first()
			.within(() => {
				cy.contains("Login to Purchase").should("be.visible");
			});
	});

	// =========================
	// PURCHASE FLOW (MOCKED API)
	// =========================
	it("calls purchase API and updates UI", () => {
		login();

		cy.visit("http://localhost:5173/index.html");

		cy.get("ul[name='products_list'] li").first().as("firstProduct");

		cy.get("@firstProduct").within(() => {
			cy.contains("Purchase").click();
		});

		cy.get("#receipt").should("exist").and("contain.text", "Purchase Successful");

		cy.get("@firstProduct").should("contain.text", "Inventory");
	});

	// =========================
	// RECEIPT DISPLAY
	// =========================
	it("displays receipt after purchase", () => {
		login();

		cy.visit("http://localhost:5173/index.html");

		cy.get("ul[name='products_list'] li")
			.first()
			.within(() => {
				cy.contains("Purchase").click();
			});

		cy.get("#receipt")
			.should("exist")
			.and("contain.text", "Purchase Successful")
			.and("contain.text", "Item:");
	});

	// =========================
	// RECEIPT PERSISTENCE
	// =========================
	it("persists receipt after page reload", () => {
		login();

		cy.visit("http://localhost:5173/index.html");

		cy.get("ul[name='products_list'] li")
			.first()
			.within(() => {
				cy.contains("Purchase").click();
			});

		cy.reload();

		cy.get("#receipt").should("contain.text", "Item:").and("contain.text", "Price:");
	});
});
