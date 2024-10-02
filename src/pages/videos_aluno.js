// pages/videos_aluno.js

import { useEffect, useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useRouter } from 'next/router';

const VideosAluno = () => {
  const [videos, setVideos] = useState([]);
  const router = useRouter();
  const user = auth.currentUser;

  // Verifica se o usuário está autenticado e busca vídeos do professor
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log('Usuário não autenticado, redirecionando para a página de login.');
        router.push('/?showLogin=true');
      } else {
        console.log('Usuário autenticado:', user.uid);
        const userId = user.uid;

        // Aqui você deve adaptar para pegar o ID do professor associado ao aluno
        // Obtenha o ID do professor do Firestore ou outra lógica
        const professorId = "ID_DO_PROFESSOR_VINCULADO"; // Isso deve ser obtido a partir do Firestore ou de outra lógica
        console.log('ID do professor vinculado:', professorId);

        const q = query(collection(db, 'videos'), where('userId', '==', professorId));
        console.log('Consultando vídeos com a query:', q);

        const unsubscribeVideos = onSnapshot(q, (snapshot) => {
          const videoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log('Vídeos encontrados:', videoList);
          setVideos(videoList);
        });

        // Cleanup the subscription on unmount
        return () => {
          unsubscribeVideos();
        };
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [router]);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Vídeos do Professor</h1>
      <div className="row">
        {videos.length > 0 ? (
          videos.map(video => (
            <div key={video.id} className="col-md-4">
              <div className="card mb-4">
                <div className="card-body">
                  <h5 className="card-title">{video.title}</h5>
                  <video width="100%" controls>
                    <source src={video.url} type="video/mp4" />
                    Seu navegador não suporta o elemento de vídeo.
                  </video>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">Nenhum vídeo encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default VideosAluno;