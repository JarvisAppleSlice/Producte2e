const form = document.getElementById("login_form");

form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const email = document.getElementById("email").value;
	const password = document.getElementById("password").value;

	const res = await fetch("http://localhost:5168/login", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			email,
			passwordHash: password,
		}),
	});

	if (res.ok) {
		const data = await res.json();
		localStorage.setItem("user", JSON.stringify(data));

		window.location.href = "index.html";
	} else {
		const msg = await res.text();
		alert(msg);
	}
});
