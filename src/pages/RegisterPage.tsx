
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterForm } from "@/components/auth/register-form";
import { useAuth } from "@/context/auth-context";

const RegisterPage = () => {
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
        <h1 className="text-3xl font-bold mb-8 animate-fade-in">Create a New Account</h1>
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
