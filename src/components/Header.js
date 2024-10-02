import Link from 'next/link';
import { useRouter } from 'next/router';  // Import Next.js router
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAuth, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase'; // Ensure your firebase.js is configured correctly
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore methods
import { gsap } from 'gsap';

const Header = ({ onLoginClick }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false); // State to track if user is a professor
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }

    // Check if user is logged in
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);
        localStorage.setItem('authUser', JSON.stringify(user)); // Store user info in local storage
        checkUserRole(user.uid); // Check if the user is a professor
      } else {
        setIsLoggedIn(false);
        setIsProfessor(false); // Reset professor state if user logs out
        localStorage.removeItem('authUser'); // Remove user info from local storage
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Function to check if the user is a professor
  const checkUserRole = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid)); // Assuming you store user roles in a 'users' collection
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.tipoUsuario === 'professor') { // Check if the role is 'professor'
        setIsProfessor(true);
      } else {
        setIsProfessor(false);
      }
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      document.body.classList.toggle('dark', newMode);
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut(auth);
    setIsLoggedIn(false); // Update logged in state
    setIsProfessor(false); // Reset professor state
    localStorage.removeItem('authUser'); // Remove user info from local storage
    router.push('/'); // Redirect to homepage after logout
  };

  // Handle Login Click
  const handleLoginClick = () => {
    gsap.to(".image-container img", {
      scale: 4,
      duration: 1.5,
      ease: "power1.inOut",
    });

    // Call the provided onLoginClick prop
    onLoginClick();
  };

  return (
    <header className="navbar">
      <div id="logo">
        <Link href="/">
          <Image
            src={isDarkMode ? "/images/edulearn_white.png" : "/images/edulearn_black.png"}
            alt="EduLearn Logo"
            width={148} /* Adjust size as necessary */
            height={18}
            className="logo-img"
          />
        </Link>
      </div>

      {/* Mobile Hamburger Menu */}
      <div className={`hamburger-menu ${isDarkMode ? 'dark-hamburger' : 'light-hamburger'}`}>
        <button onClick={toggleMenu}>
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
      </div>

      {/* Navigation Links */}
      <nav className={`${isMenuOpen ? 'block' : 'hidden'} md:flex nav-links ${isDarkMode ? 'dark-menu' : 'light-menu'}`}>
        <Link href="/">Home</Link>
        <Link href="/cadastro">Cadastre-se</Link>
        {isLoggedIn ? (
          <>
            {isProfessor ? (
              <Link href="/conteudo_professor" className="login">Conteúdo Professor</Link>
            ) : (
              <Link href="/videos_aluno" className="login">Conteúdo Aluno</Link>
            )}
            <a onClick={handleLogout} className="login">Logout</a>
          </>
        ) : (
          <a onClick={handleLoginClick} className="login">Login</a>
        )}
      </nav>

      {/* Theme toggle button */}
      <button onClick={toggleTheme} className="theme-btn">
        <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
      </button>
    </header>
  );
};

export default Header;