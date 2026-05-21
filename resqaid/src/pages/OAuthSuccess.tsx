import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    // ✅ Save token
    localStorage.setItem("token", token);

    // ✅ Get user
    fetch("http://localhost:5000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user;

        // save user
        localStorage.setItem("user", JSON.stringify(user));

        // 🎯 REDIRECT LOGIC
        if (!user.phone || !user.birthday) {
          navigate("/infos");
        } else if (user.role === "admin") {
          navigate("/controle");
        } else {
          navigate("/requestpage"); // ✅ THIS IS WHAT YOU WANT
        }
      })
      .catch(() => {
        navigate("/login");
      });

  }, [navigate]);

  return <h2>Logging you in...</h2>;
}