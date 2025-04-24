import "../App.css";
import NavBar from "../components/NavBar";
import SignUpForm from "../components/SignUp";
function SignUpPage() {
  const SignUpP = (
    <div>
      <NavBar></NavBar>
      <SignUpForm></SignUpForm>
    </div>
  );
  return SignUpP;
}
export default SignUpPage;
