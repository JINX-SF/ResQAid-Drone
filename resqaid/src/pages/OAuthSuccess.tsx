import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "@/api";

export default function  OAuthSuccess() {
  const navigate = useNavigate();

  /*useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/");
    } else {
      navigate("/login");
    }
  }, [navigate]);*/

 /* useEffect(() => {
  const token = new URLSearchParams(window.location.search).get("token");

  if (token) {
    localStorage.setItem("token", token);

    API.get("/auth/me").then((res) => {
      const user = res.data.user;

      if (!user.phone || !user.birthday) {
        navigate("/infos");
      } else {
        navigate("/controle");
      }
    });

  } else {
    navigate("/login");
  }
}, [navigate]);*/

useEffect(()=>{
  const token = new URLSearchParams(window.location.search).get("token");

if (token) {
  localStorage.setItem("token", token);

  // 👇 check if user has profile or not
  fetch("http://localhost:5000/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (!data.user.birthday) {
        navigate("/infos"); // NEW USER
      } else {
        navigate("/controle"); // EXISTING USER
      }
    });
};
});

  return <h2>Logging you in...</h2>;
}