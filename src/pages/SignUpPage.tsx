import "../App.css";
import NavBar from "../components/NavBar";
import SignUpForm from "../components/SignUp";
import Birdies from "../components/Birdies";
function SignUpPage() {
  const SignUpP = (
    <div>
      <Birdies />
      <NavBar></NavBar>
      <SignUpForm></SignUpForm>
    </div>
  );
  return SignUpP;
}
export default SignUpPage;
