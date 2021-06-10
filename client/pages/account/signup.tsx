import axios from "axios";
import AuthForm from "../../components/auth/Authform";

const Signup = ({ user }) => {
  return <AuthForm label="Sign up" route="signup" />;
};

export default Signup;
