import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import HeadComponent from './HeadComponent';
import Header from './Header';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);  // Registrar ScrollTrigger plugin

const Layout = ({ children, title }) => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);  // Controla a visibilidade do modal de login

  const handleLoginClick = () => {
    const timeline = gsap.timeline({
      onComplete: () => setIsLoginVisible(true),  // Exibe o modal de login após o efeito
    });

    timeline
      .set("body", { overflow: "hidden" }) // Garante que o corpo não tenha rolagem durante o efeito
      .to(".image-container img", {
        scale: 4,
        z: 350,
        transformOrigin: "center center",
        ease: "power1.inOut",
        duration: 1.5,
      })
      .to(".section.hero", {
        scale: 1.1,
        transformOrigin: "center center",
        ease: "power1.inOut",
        duration: 1,
      }, "<");
  };

  // Função para fechar o modal e fazer o efeito de "zoom out"
  const handleCloseClick = () => {
    const timeline = gsap.timeline({
      onComplete: () => {
        setIsLoginVisible(false);
        gsap.set("body", { overflow: "auto" }); // Reativa a rolagem quando o efeito termina
      },
    });

    timeline
      .to(".login-popup", {
        opacity: 0,  // Adiciona um fade out no modal
        duration: 0.5,
      })
      .to(".section.hero", {
        scale: 4,
        transformOrigin: "center center",
        ease: "power1.inOut",
        duration: 1,
      })
      .to(".image-container img", {
        scale: 1,
        z: 0,
        transformOrigin: "center center",
        ease: "power1.inOut",
        duration: 1.5,
      }, "<");
  };

  return (
    <>
      <HeadComponent title={title} />
      <Header onLoginClick={handleLoginClick} />  {/* Passa a função para o Header */}
      <main className="wrapper">{children}</main>

      {/* Popup de Login */}
      {isLoginVisible && (
        <div className="login-popup">
          <div className="login-content">
            <button className="close-btn" onClick={handleCloseClick}>X</button> {/* Botão de fechar */}
            <h2>Login</h2>
            <form>
              <input type="email" placeholder="Email" className="form-control" />
              <input type="password" placeholder="Senha" className="form-control" />
              <button type="submit" className="btn btn-primary">Entrar</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Layout;