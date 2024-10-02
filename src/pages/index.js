import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { gsap } from 'gsap';
import { signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { auth } from '../config/firebase';  // Ensure your firebase.js is configured correctly
import Layout from '../components/Layout';
import Image from 'next/image';
import Header from '../components/Header'; // Import the Header

const HomePage = () => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState('/images/background1.png');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoginVisible(false); // Hide login modal if the user is authenticated
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Function to handle login modal visibility
  const handleLoginClick = () => {
    setIsLoginVisible(true); // Show the login modal
  };

  // Function to close the login modal with animation
  const handleCloseModal = () => {
    // Animate the image back to normal scale
    gsap.to(".image-container img", {
      scale: 1,
      duration: 1.5,
      ease: "power1.inOut",
    });

    setIsLoginVisible(false); // Hide the login modal
  };

  // Function for login with Firebase
  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User authenticated:', user);

      // Check user role or redirect as necessary
      if (user) {
        router.push('/conteudo_professor'); // Redirect on successful login
      }
    } catch (error) {
      setErrorMessage('User not found or invalid credentials.');
      console.error('Authentication error:', error.message);
    }
  };

  return (
    <Layout title="EduLearn - Home">
      <Header onLoginClick={handleLoginClick} /> {/* Pass the handleLoginClick function */}
      <div className="content">
        <section className="section hero">
          <h1>Welcome to EduLearn</h1>
        </section>
      </div>
      <div className="image-container">
        <Image
          src={backgroundImage}
          alt="Background image"
          layout="fill"
          priority
          className="background-image"
        />
      </div>

      {isLoginVisible && (
        <div className="login-popup">
          <div className="login-content">
            <button className="close-btn" onClick={handleCloseModal}>X</button>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {errorMessage && <p className="error-message">{errorMessage}</p>}
              <button type="submit" className="btn btn-primary">Enter</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default HomePage;