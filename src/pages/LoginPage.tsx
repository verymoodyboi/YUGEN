import "../App.css";
import NavBar from "../components/NavBar";
import LoginForm from "../components/Login";
import Birdies from "../components/Birdies";
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
