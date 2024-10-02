import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import Link from 'next/link'; // Import Link

export default function Cadastro() {
  const [tipoUsuario, setTipoUsuario] = useState('professor');
  const [professorVinculado, setProfessorVinculado] = useState('');
  const [professores, setProfessores] = useState([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showResetOption, setShowResetOption] = useState(false);  // State to show password reset option

  useEffect(() => {
    const fetchProfessores = async () => {
      const q = query(collection(db, 'users'), where('tipoUsuario', '==', 'professor'));
      const querySnapshot = await getDocs(q);
      const professoresList = querySnapshot.docs.map(doc => ({
        id: doc.id, // Use the document ID
        ...doc.data(),
      }));
      setProfessores(professoresList);
    };

    if (tipoUsuario === 'aluno') {
      fetchProfessores();
    }
  }, [tipoUsuario]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setShowResetOption(false);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await addDoc(collection(db, 'users'), {
        uid: user.uid,
        nome,
        cpf,
        email,
        tipoUsuario,
        professorVinculado: tipoUsuario === 'aluno' ? professorVinculado : null, // Store professor ID
      });

      setSuccessMessage('Usuário cadastrado com sucesso!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Este email já está em uso.');
        setShowResetOption(true);
      } else {
        console.error('Erro ao cadastrar:', error);
        setErrorMessage('Erro ao cadastrar: ' + error.message);
      }
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Email de redefinição de senha enviado!');
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Erro ao enviar email de redefinição: ' + error.message);
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-light">
      <div className="bg-white p-4 rounded shadow-lg" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className="text-center mb-4">Cadastro de Usuário</h1>

        {/* Display success or error messages */}
        {successMessage && <div className="alert alert-success text-center">{successMessage}</div>}
        {errorMessage && <div className="alert alert-danger text-center">{errorMessage}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nome" className="form-label">Nome Completo</label>
            <input
              type="text"
              id="nome"
              name="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="form-control"
              placeholder="Digite seu nome completo"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="cpf" className="form-label">CPF</label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
              className="form-control"
              placeholder="Digite seu CPF"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Digite seu email"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="senha" className="form-label">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="form-control"
              placeholder="Digite sua senha"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="tipoUsuario" className="form-label">Tipo de Usuário</label>
            <select
              id="tipoUsuario"
              name="tipoUsuario"
              value={tipoUsuario}
              onChange={(e) => setTipoUsuario(e.target.value)}
              className="form-select"
            >
              <option value="professor">Professor</option>
              <option value="aluno">Aluno</option>
            </select>
          </div>

          {/* Dropdown to select Professor if user is "aluno" */}
          {tipoUsuario === 'aluno' && (
            <div className="mb-3">
              <label htmlFor="professorVinculado" className="form-label">Professor Vinculado</label>
              <select
                id="professorVinculado"
                value={professorVinculado}
                onChange={(e) => setProfessorVinculado(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Selecione um professor</option>
                {professores.map((professor) => (
                  <option key={professor.id} value={professor.id}> {/* Store the ID of the professor */}
                    {professor.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100">Registrar</button>
        </form>

        {/* Show password reset option and link to login */}
        {showResetOption && (
          <div className="mt-3 text-center">
            <p>Já tem uma conta? </p> 
            <button className="btn btn-link p-0 redefinirSenha" onClick={handlePasswordReset}>Redefinir senha</button>
            <Link href="/login">Faça login aqui</Link>
          </div>
        )}
      </div>
    </div>
  );
}