import "../App.css";
import SignUpForm from "../features/auth/register/components/SignUp";
import SignUpGoogle from "../features/auth/register/components/SignUpWithGoogle";
import { useAuth } from "../contexts/AuthContext";
function SignUpPage() {
  const { status } = useAuth();
  if (status == "signupGoogle") {
    return (
      <div>
        <SignUpGoogle></SignUpGoogle>
      </div>
    );
  }
  return (
    <div>
      <SignUpForm></SignUpForm>
    </div>
  );
}
export default SignUpPage;
