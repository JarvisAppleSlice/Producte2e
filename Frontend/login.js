const form = document.getElementById("login_form");

if (form) {
	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		const email = document.getElementById("email").value;
		const password = document.getElementById("password").value;

		const msg = document.getElementById("login_message");

		try {
			const res = await fetch("http://localhost:5168/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email,
					passwordHash: password,
				}),
			});

			if (res.ok) {
				const data = await res.json();
				localStorage.setItem("user", JSON.stringify(data));

				msg.innerText = "Logged in";

				setTimeout(() => {
					window.location.href = "index.html";
				}, 1000);
			} else {
				msg.innerText = "Invalid login";
			}
		} catch (err) {
			msg.innerText = "Server error";
			console.error(err);
		}
	});
}
