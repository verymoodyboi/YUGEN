import "../App.css";
import NavBar from "../L2/NavBar";
import LoginForm from "../L2/Login";
import Birdies from "../L2/Birdies";
function LoginPage() {
  const LoginP = (
    <div>
      <Birdies />
      <NavBar></NavBar>
      <LoginForm></LoginForm>
    </div>
  );
  return LoginP;
}
export default LoginPage;
