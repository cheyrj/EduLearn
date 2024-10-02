import { useEffect, useState } from 'react';
import { storage, db } from '../config/firebase';  // Import Firebase Storage and Firestore
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/router';
import Link from 'next/link'; 

const UploadVideo = () => {
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'youtube'
  const [videoFile, setVideoFile] = useState(null); // Stores the video file
  const [youtubeLink, setYoutubeLink] = useState(''); // Stores the YouTube link
  const [statusMessage, setStatusMessage] = useState(''); // Feedback message
  const [progress, setProgress] = useState(0); // Upload progress
  const router = useRouter(); // Initialize router
  const auth = getAuth(); // Initialize Firebase Authentication

  // Check user authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        console.log('No user logged in, redirecting to login modal');
        router.push('/?showLogin=true');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [router, auth]);

  // Function to send video file to Firebase Storage and save in Firestore
  const handleFileUpload = async () => {
    console.log('Iniciando o upload de arquivo...');

    if (!videoFile) {
      alert('Selecione um arquivo de vídeo primeiro.');
      console.error('Nenhum arquivo de vídeo selecionado.');
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert('Você precisa estar logado para enviar vídeos.');
      return;
    }

    try {
      console.log('Arquivo selecionado:', videoFile.name);
      const storageRef = ref(storage, `videos/${videoFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, videoFile);

      // Monitor upload progress
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progressPercentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Progresso do upload: ${progressPercentage.toFixed(0)}%`);
          setProgress(progressPercentage); // Update progress state
        },
        (error) => {
          console.error('Erro durante o upload:', error);
          setStatusMessage('Erro ao enviar o vídeo.');
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('URL de download:', downloadURL);

          // Save the link in Firestore with additional metadata
          console.log('Salvando metadados no Firestore...');
          await addDoc(collection(db, 'videos'), {
            url: downloadURL,
            type: 'file',
            title: videoFile.name,
            createdAt: new Date(),
            userId: user.uid, // Store user ID for reference
          });

          setStatusMessage('Vídeo enviado e armazenado com sucesso no banco de dados!');
          setProgress(0); // Reset progress bar after upload
          console.log('Upload e salvamento concluídos.');
        }
      );
    } catch (error) {
      console.error('Erro ao enviar o vídeo:', error);
      setStatusMessage('Erro ao enviar o vídeo.');
    }
  };

  // Function to send YouTube link to Firestore
  const handleYoutubeUpload = async () => {
    if (!youtubeLink) {
      alert('Insira um link do YouTube.');
      console.error('Nenhum link do YouTube inserido.');
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      alert('Você precisa estar logado para enviar links do YouTube.');
      return;
    }

    try {
      console.log('Salvando link do YouTube no Firestore...');
      await addDoc(collection(db, 'videos'), {
        url: youtubeLink,
        type: 'youtube',
        title: youtubeLink,
        createdAt: new Date(),
        userId: user.uid, // Store user ID for reference
      });

      setStatusMessage('Link do YouTube armazenado com sucesso no banco de dados!');
      console.log('Link do YouTube armazenado no Firestore.');
    } catch (error) {
      console.error('Erro ao salvar o link do YouTube:', error);
      setStatusMessage('Erro ao salvar o link do YouTube.');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h1 className="text-center mb-4">Upload de Vídeo</h1>

          {/* Choose between file upload or YouTube link */}
          <div className="form-group mb-3">
            <label>Selecione o Tipo de Upload</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="uploadType"
                value="file"
                checked={uploadType === 'file'}
                onChange={() => setUploadType('file')}
              />
              <label className="form-check-label">Enviar Arquivo</label>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="uploadType"
                value="youtube"
                checked={uploadType === 'youtube'}
                onChange={() => setUploadType('youtube')}
              />
              <label className="form-check-label">Enviar Link do YouTube</label>
            </div>
          </div>

          {/* File upload form */}
          {uploadType === 'file' && (
            <div className="form-group">
              <label htmlFor="videoFile">Selecione o Arquivo de Vídeo</label>
              <input
                type="file"
                className="form-control mb-3"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
              <button className="btn btn-primary w-100" onClick={handleFileUpload}>
                Enviar Vídeo
              </button>

              {/* Progress bar */}
              {progress > 0 && (
                <div className="progress mt-3">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {progress.toFixed(0)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* YouTube link upload form */}
          {uploadType === 'youtube' && (
            <div className="form-group">
              <label htmlFor="youtubeLink">Link do YouTube</label>
              <input
                type="text"
                className="form-control mb-3"
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="Insira o link do YouTube"
              />
              <button className="btn btn-primary w-100" onClick={handleYoutubeUpload}>
                Enviar Link
              </button>
            </div>
          )}

          {/* Status message */}
          {statusMessage && (
            <div className={`alert ${statusMessage.includes('sucesso') ? 'alert-success' : 'alert-danger'} mt-3`}>
              {statusMessage}
            </div>
          )}

          <Link href="/videos_professor" className="btn btn-secondary mt-4">
            Ver Meus Vídeos
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UploadVideo;