import { useEffect, useState } from 'react';
import { db, auth } from '../config/firebase'; // Certifique-se de que o arquivo firebase.js esteja configurado corretamente
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/router';

const VideosProfessor = () => {
  const [videos, setVideos] = useState([]);
  const router = useRouter();

  // Verifica se o usuário está autenticado e possui o papel de professor
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log('Usuário não autenticado, redirecionando para a página de login.');
        router.push('/?showLogin=true');
      } else {
        // Fetch videos only for the authenticated user
        const userId = user.uid;
        const q = query(collection(db, 'videos'), where('userId', '==', userId));

        const unsubscribeVideos = onSnapshot(q, (snapshot) => {
          const videoList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  // Função para excluir um vídeo
  const handleDeleteVideo = async (videoId) => {
    try {
      await deleteDoc(doc(db, 'videos', videoId));
      console.log('Vídeo excluído com sucesso.');
    } catch (error) {
      console.error('Erro ao excluir vídeo:', error);
    }
  };

  // Função para redirecionar para a página de upload de vídeo
  const handleAddVideo = () => {
    router.push('/conteudo_professor');
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Meus Vídeos</h1>
      <button 
        className="btn btn-primary btn-sm mt-2 adicionarvideo" // Use a classe personalizada
        onClick={handleAddVideo}
      >
        Adicionar Vídeo
      </button>
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
                  <button className="btn btn-danger mt-2" onClick={() => handleDeleteVideo(video.id)}>
                    Excluir
                  </button>
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

export default VideosProfessor;