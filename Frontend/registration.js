const form = document.getElementById("user_registration");

if (form) {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;

		const message = document.createElement("p");
		message.id = "register_message";
		document.body.appendChild(message);

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
				const errorText = await response.text();
				message.innerText = errorText;
			}
		} catch (err) {
			message.innerText = "Server error";
			console.error(err);
		}
	});
}
