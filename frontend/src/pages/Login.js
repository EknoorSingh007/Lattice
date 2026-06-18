// import { useState } from 'react';
// import { useLogin } from '../hooks/useLogin';
// import { Eye, EyeOff,Github} from 'lucide-react'; // 👈 Add this import
// import './Login.css';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false); // 👈 added
//   const { login, error, isLoading } = useLogin();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await login(email, password);
//   };



//   const togglePassword = () => {
//     setShowPassword((prev) => !prev); // 👈 toggle logic
//   };

//   return (
//     <div className="login-container">
//       <div className="login-card">
//         <div className="login-header">
//           <h2>Welcome Back</h2>
//           <p>Login to continue learning and sharing skills</p>
//         </div>

//         <form className="login-form" onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label htmlFor="email">Email Address</label>
//             <input
//               id="email"
//               type="email"
//               onChange={(e) => setEmail(e.target.value)}
//               value={email}
//               placeholder="Enter your email"
//               required
//             />
//           </div>

//                 <div className="form-group password-group">
//                 <label htmlFor="password">Password</label>
//                 <div className="password-wrapper">
//                     <input
//                     id="password"
//                     type={showPassword ? 'text' : 'password'}
//                     onChange={(e) => setPassword(e.target.value)}
//                     value={password}
//                     placeholder="Enter your password"
//                     required
//                     />
//                     <span className="password-toggle-icon" onClick={togglePassword}>
//                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                     </span>
//                 </div>
//          </div>

//           <button type="submit" className="login-btn" disabled={isLoading}>
//             {isLoading ? (
//               <>
//                 <span className="spinner"></span>
//                 Logging In...
//               </>
//             ) : (
//               'Login'
//             )}
//           </button>

//           {error && (
//             <div className="error-message">
//               <span className="error-icon">⚠</span>
//               {error}
//             </div>
//           )}
//         </form>

       
//         <div className="login-footer">
//           <p>Don't have an account? <a href="/signup">Sign up</a></p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
import { useState, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import { Eye, EyeOff, Github, Chrome } from 'lucide-react';
import './Login.css';
import { useAuthContext } from '../hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, error, isLoading } = useLogin();
  const { dispatch } = useAuthContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback
  useEffect(() => {
  const token = searchParams.get('token');
  const userEmail = searchParams.get('email');
  const userId = searchParams.get('id');
  const profileComplete = searchParams.get('profileComplete') === 'true';

  if (token && userEmail && userId) {
    const userPayload = {
      email: userEmail,
      token: token,
      _id: userId,
      profileComplete
    };

    localStorage.setItem('user', JSON.stringify(userPayload));
    dispatch({ type: 'LOGIN', payload: userPayload });

    // Redirect based on profile status
    navigate(profileComplete ? '/' : '/profilesetup');
  }
}, [searchParams, dispatch, navigate]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  const togglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000'}/api/auth/github`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login to continue learning and sharing skills</p>
        </div>

        <div className="oauth-buttons">
            <button onClick={handleGoogleLogin} className="oauth-btn google">
                <Chrome size={20} /> Continue with Google
            </button>
            <button onClick={handleGithubLogin} className="oauth-btn github">
                <Github size={20} /> Continue with GitHub
            </button>
        </div>

        <div className="divider">
            <span>OR</span>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* ... (email and password inputs remain the same) ... */}
           <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" type="email" onChange={(e) => setEmail(e.target.value)} value={email} placeholder="Enter your email" required />
          </div>

          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
                <input id="password" type={showPassword ? 'text' : 'password'} onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Enter your password" required />
                <span className="password-toggle-icon" onClick={togglePassword}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Logging In...' : 'Login with Email'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="login-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login;