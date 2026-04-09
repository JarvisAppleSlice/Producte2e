describe("products", () => {
	it("lists products", () => {
		cy.visit("http://localhost:5173/");

		cy.get("h1").should("have.text", "Products:");

		// cy.get("body").should("be.visible").should("contain", "Laptop");
		cy.get('ul[name="products_list"]').should("be.visible");
	});
});
