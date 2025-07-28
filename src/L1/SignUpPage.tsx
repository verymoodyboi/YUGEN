import "../App.css";
import NavBar from "../L2/NavBar";
import SignUpForm from "../L2/SignUp";
import Birdies from "../L2/Birdies";
import SignUpGoogle from "../L2/SignUpWithGoogle";
import { useAuth } from "../contexts/AuthContext";
function SignUpPage() {
  const { status } = useAuth();
  if (status == "signupGoogle") {
    return (
      <div>
        <Birdies />
        <NavBar></NavBar>
        <SignUpGoogle></SignUpGoogle>
      </div>
    );
  }
  return (
    <div>
      <Birdies />
      <NavBar></NavBar>
      <SignUpForm></SignUpForm>
    </div>
  );
}
export default SignUpPage;
