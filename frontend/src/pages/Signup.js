// import { useState } from 'react'
// import { useSignup } from '../hooks/useSignup'
// import { Eye, EyeOff } from 'lucide-react'; // 👈 Add this import
// import './Signup.css'

// const Signup = () => {
//     const [email, setEmail] = useState('')
//     const [password, setPassword] = useState('')
//     const { signup, isLoading, error } = useSignup();
//     const [showPassword, setShowPassword] = useState(false); // 👈 added

//     const handleSubmit = async (e) => {
//         e.preventDefault()
//         console.log(email, password)
//         await signup(email, password)
//     }
// const togglePassword = () => {
//     setShowPassword((prev) => !prev); // 👈 toggle logic
//   };
//     return (
//         <div className="signup-container">
//             <div className="signup-card">
//                 <div className="signup-header">
//                     <h2>Join Lattice</h2>
//                     <p>Create your account to start collaborating</p>
//                 </div>
                
//                 <form className="signup-form" onSubmit={handleSubmit}>
//                     <div className="form-group">
//                         <label htmlFor="email">Email Address</label>
//                         <input
//                             id="email"
//                             type="email"
//                             onChange={(e) => setEmail(e.target.value)}
//                             value={email}
//                             placeholder="Enter your email"
//                             required
//                         />
//                     </div>

//                     <div className="form-group password-group">
//                     <label htmlFor="password">Password</label>
//                     <div className="password-wrapper">
//                       <input
//                         id="password"
//                         type={showPassword ? 'text' : 'password'}
//                         onChange={(e) => setPassword(e.target.value)}
//                         value={password}
//                         placeholder="Enter your password"
//                         required
//                       />
//                       <span className="password-toggle-icon" onClick={togglePassword}>
//                         {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                       </span>
//                     </div>
//                   </div>

//                     <button 
//                         type="submit" 
//                         className="signup-btn"
//                         disabled={isLoading}
//                     >
//                         {isLoading ? (
//                             <>
//                                 <span className="spinner"></span>
//                                 Creating Account...
//                             </>
//                         ) : (
//                             'Create Account'
//                         )}
//                     </button>

//                     {error && (
//                         <div className="error-message">
//                             <span className="error-icon">⚠</span>
//                             {error}
//                         </div>
//                     )}
//                 </form>

//                 <div className="signup-footer">
//                     <p>Already have an account? <a href="/login">Login</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Signup
import { useState } from 'react';
import { useSignup } from '../hooks/useSignup';
import { Eye, EyeOff, Github, Chrome } from 'lucide-react'; // Import Chrome
import './Signup.css';

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup, isLoading, error } = useSignup();
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(email, password);
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
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h2>Join Lattice</h2>
                    <p>Create your account to start collaborating</p>
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

                <form className="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="Enter your password"
                            required
                          />
                          <span className="password-toggle-icon" onClick={togglePassword}>
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="signup-btn"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠</span>
                            {error}
                        </div>
                    )}
                </form>

                <div className="signup-footer">
                    <p>Already have an account? <a href="/login">Login</a></p>
                </div>
            </div>
        </div>
    );
}

export default Signup;