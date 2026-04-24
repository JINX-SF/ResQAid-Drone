import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    fetch(`http://localhost:5000/api/auth/verify-email/${token}`)
      .then(() => {
        navigate("/login?verified=true");
      })
      .catch(() => {
        navigate("/login?error=true");
      });
  }, [token, navigate]);

  return <h2>Verifying your email...</h2>;
};

export default VerifyEmail;