const form = document.getElementById("user_registration");

if (form) {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = document.getElementById("email").value;

		const password = document.getElementById("password").value;

		const message = document.getElementById("register_message");

		if (!message) return;

		message.innerText = "";

		try {
			const response = await fetch("http://localhost:5168/register", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					email: email,
					passwordHash: password,
				}),
			});

			if (response.ok) {
				const data = await response.json();
				message.innerText = "Account created";
				console.log("User created:", data);
			} else {
				message.innerText = await response.text();
			}
		} catch (err) {
			message.innerText = "Server error";
			console.error(err);
		}
	});
}
