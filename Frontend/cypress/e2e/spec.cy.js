const { faker } = require("@faker-js/faker");

describe("products", () => {
	it("lists products", () => {
		cy.visit("http://localhost:5173/");

		cy.get("h1").should("have.text", "Products:");

		cy.get('ul[name="products_list"]').should("be.visible");
	});

	it("creates products", () => {
		cy.visit("http://localhost:5173/");

		const name = faker.commerce.productName();
		const price = faker.commerce.price({ min: 1, max: 300 });
		const inventoryCount = faker.number.int({ min: 1, max: 1000 });

		cy.get("form").should("be.visible");
		cy.get('form input[name="name"]').should("be.visible").type(name);
		cy.get('form input[name="price"][type="number"]').should("be.visible").type(price);
		cy.get('form input[name="inventoryCount"][type="number"]')
			.should("be.visible")
			.type(inventoryCount);
		cy.get('form button[type="submit"]')
			.should("be.visible")
			.and("have.text", "Create Product")
			.click();

		cy.get('ul[name="products_list"] li:last')
			.should("be.visible")
			.and(
				"have.text",
				`Name: ${name}, Price: $${Number(price).toFixed(2)}, Inventory: ${inventoryCount}`,
			);

		cy.url("eq", "http://localhost:5173/");
	});
	it("registers a new user successfully", () => {
		cy.visit("http://localhost:5173/registration.html");

		cy.get("#email").should("be.visible").and("have.attr", "required");
		cy.get("#password").should("be.visible").and("have.attr", "required");

		cy.get("#email").type("test@test.com");
		cy.get("#password").type("password123");

		cy.get("#user_registration").submit();

		cy.contains("Account created").should("be.visible");
	});
	it("shows error for duplicate email", () => {
		cy.visit("http://localhost:5173/registration.html");

		const email = "duplicate@test.com";

		cy.get("#email").type(email);
		cy.get("#password").type("password123");
		cy.get("#user_registration").submit();

		cy.visit("http://localhost:5173/registration.html");

		cy.get("#email").type(email);
		cy.get("#password").type("password123");
		cy.get("#user_registration").submit();

		cy.contains("Email already exists").should("be.visible");
	});
});
