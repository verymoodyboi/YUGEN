import "../App.css";
import NavBar from "../components/NavBar";
import LoginForm from "../components/Login";

function LoginPage() {
  const LoginP = (
    <div>
      <NavBar></NavBar>
      <LoginForm></LoginForm>
    </div>
  );
  return LoginP;
}
export default LoginPage;
