const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    message.textContent = "Checking login...";

    try {

        const response = await fetch("/api/admin/login", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                username,
                password
            })

        });

        const data = await response.json();

        if (data.success) {

            message.textContent = "Login successful!";

            window.location.href = "/admin/dashboard.html";

        } else {

            message.textContent = data.message;

        }

    } catch (error) {

        console.error(error);

        message.textContent =
            "Unable to connect to the server.";

    }

});