import React, { useRef } from 'react';
import { useMirror } from './MirrorContext';
import { useFaceMesh } from '../../hooks/useFaceMesh';
import { X, Camera, RefreshCcw } from 'lucide-react';

const MirrorStudio = ({ variant = 'client', onClose, onBooking }) => {
  const {
    mirrorGender, setMirrorGender,
    mirrorStage, setMirrorStage,
    mirrorHair, setMirrorHair,
    mirrorColor, setMirrorColor,
    capturedPhoto, setCapturedPhoto,
    capturedLandmarks, setCapturedLandmarks,
    isGeneratingLook, setIsGeneratingLook,
    isMirrorOpen, adminTab
  } = useMirror();

  // Determine if it should be active based on variant or state
  const isActive = variant === 'admin' ? true : isMirrorOpen;
  const isPhotoView = mirrorStage === 'result';

  const { videoRef, canvasRef, resultsRef } = useFaceMesh(
    isActive, mirrorStage, mirrorColor, mirrorGender, mirrorHair, capturedLandmarks, isPhotoView
  );

  const handleGenerateAILook = async () => {
    if (!videoRef.current || !resultsRef.current?.multiFaceLandmarks?.[0]) return;
    
    setIsGeneratingLook(true);
    const video = videoRef.current;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.scale(-1, 1);
    ctx.drawImage(video, -tempCanvas.width, 0, tempCanvas.width, tempCanvas.height);
    
    setCapturedPhoto(tempCanvas.toDataURL('image/png'));
    setCapturedLandmarks(resultsRef.current.multiFaceLandmarks[0]);

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsGeneratingLook(false);
    setMirrorStage('result');
  };

  return (
    <div className={`mirror-content ${variant === 'client' ? 'animate' : ''}`} style={variant === 'admin' ? { height: '100%', border: 'none' } : {}}>
      <div className="mirror-header" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--primary)', fontWeight: 800 }}>
          {variant === 'admin' ? 'Shakti Estúdio AI (Profissional)' : 'Shakti AI Studio'}
        </h3>
        <div className="gender-selector" style={{ background: '#eee', borderRadius: '20px', padding: '5px', display: 'flex', gap: '5px' }}>
          <button className={`gender-btn ${mirrorGender === 'female' ? 'active' : ''}`} onClick={() => setMirrorGender('female')} style={{ padding: '5px 15px', borderRadius: '15px', border: 'none', background: mirrorGender === 'female' ? 'var(--primary)' : 'transparent', color: mirrorGender === 'female' ? 'white' : '#666', fontSize: '0.7rem' }}>Feminino</button>
          <button className={`gender-btn ${mirrorGender === 'male' ? 'active' : ''}`} onClick={() => setMirrorGender('male')} style={{ padding: '5px 15px', borderRadius: '15px', border: 'none', background: mirrorGender === 'male' ? 'var(--primary)' : 'transparent', color: mirrorGender === 'male' ? 'white' : '#666', fontSize: '0.7rem' }}>Masculino</button>
        </div>
        {variant === 'client' && <X style={{ cursor: 'pointer' }} onClick={onClose} />}
      </div>

      <div className="mirror-studio">
        <div className="mirror-viewport">
          {mirrorStage === 'choosing' && (
            <div className="offline-mirror-view" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#f5f5f5', color: '#666', textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>✨</div>
              <h4 style={{ color: 'var(--primary)', marginBottom: '10px' }}>{variant === 'admin' ? 'Simulador de Look Consultivo' : 'Personalize o seu Estilo'}</h4>
              <p style={{ maxWidth: '350px', fontSize: '0.9rem', marginBottom: '30px' }}>
                {variant === 'admin' ? 'Utilize o estúdio para ajudar o seu cliente a selecionar o tratamento ideal.' : 'Escolha as cores e penteados à direita e depois ligue a câmara para ver a magia.'}
              </p>
              <button className="btn-primary" onClick={() => setMirrorStage('camera')}>
                {variant === 'admin' ? 'Iniciar Captura Directa' : 'Ligar Minha Câmara'}
              </button>
            </div>
          )}

          {mirrorStage === 'camera' && (
            <>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'scaleX(-1)', pointerEvents: 'none' }} />
              <div className="mirror-camera-controls" style={{ position: 'absolute', bottom: '30px', left: '0', right: '0', display: 'flex', justifyContent: 'center' }}>
                <button className="btn-primary" style={{ padding: '15px 40px', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }} onClick={handleGenerateAILook}>
                  📸 {variant === 'admin' ? 'Produzir Look Cliente' : 'Tirar Foto & Aplicar IA'}
                </button>
              </div>
            </>
          )}

          {mirrorStage === 'result' && (
            <div className="ai-result-container" style={{ position: 'relative', height: '100%' }}>
              <img src={capturedPhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Result" />
              <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
              <div className="ai-photo-actions" style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', gap: '10px' }}>
                <button className="btn-secondary w-full" style={{ background: 'white' }} onClick={() => setMirrorStage('camera')}>Refazer Foto</button>
                {variant === 'client' && <button className="btn-primary w-full" onClick={() => onBooking({ name: `Look IA - ${mirrorHair}`, category: 'Especial', price: 'Consultar', duration: '60 min', id: 99 })}>Reservar Look</button>}
              </div>
            </div>
          )}

          {isGeneratingLook && (
            <div className="ai-processing-overlay">
              <div className="processing-spinner"></div>
              <p>✨ Shakti AI a processar...</p>
            </div>
          )}
        </div>

        <div className="mirror-controls">
          <div className="control-group">
            <label style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '15px', color: '#999' }}>
               {mirrorGender === 'female' ? 'Paleta de Maquilhagem' : 'Tom e Acabamento'}
            </label>
            <div className="color-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {['#e74c3c', '#c0392b', '#9b59b6', '#ecf0f1', '#f39c12'].map(c => (
                <div key={c} onClick={() => setMirrorColor(c)} style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', background: c, border: mirrorColor === c ? '3px solid var(--primary)' : '1px solid #ddd', cursor: 'pointer' }}></div>
              ))}
            </div>
          </div>

          <div className="control-group mt-10">
            <label style={{ fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', display: 'block', marginBottom: '15px', color: '#999' }}>Estilos AI Disponíveis</label>
            <div className="style-list">
              {mirrorGender === 'female' ? (
                <>
                  <button className={`style-btn ${mirrorHair === 'none' ? 'active' : ''}`} onClick={() => setMirrorHair('none')}>Natural</button>
                  <button className={`style-btn ${mirrorHair === 'bob' ? 'active' : ''}`} onClick={() => setMirrorHair('bob')}>Short Bob</button>
                  <button className={`style-btn ${mirrorHair === 'long' ? 'active' : ''}`} onClick={() => setMirrorHair('long')}>Ondas Longas</button>
                </>
              ) : (
                <>
                  <button className={`style-btn ${mirrorHair === 'none' ? 'active' : ''}`} onClick={() => setMirrorHair('none')}>Limpo</button>
                  <button className={`style-btn ${mirrorHair === 'beard' ? 'active' : ''}`} onClick={() => setMirrorHair('beard')}>Barba Profissional</button>
                  <button className={`style-btn ${mirrorHair === 'pompadour' ? 'active' : ''}`} onClick={() => setMirrorHair('pompadour')}>Pompadour</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MirrorStudio;
