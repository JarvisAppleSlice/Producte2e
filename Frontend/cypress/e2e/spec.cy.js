describe("products", () => {
	it("lists products", () => {
		cy.visit("https://example.cypress.io");

		cy.get("h1").should("have.text", "Products:");

		cy.get('ul[name="products_list"]').should("be.visible");
	});
});
