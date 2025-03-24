
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/context/auth-context";

const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  return (
    <div className="container max-w-screen-lg mx-auto py-12">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">Login to Your Account</h1>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
