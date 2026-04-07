import { useEffect, useRef } from 'react';

export const useFaceMesh = (isActive, mirrorStage, mirrorColor, mirrorGender, mirrorHair, capturedLandmarks, isPhotoView) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const resultsRef = useRef(null);

  const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95];
  const BEARD_LANDMARKS = [152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 21, 54, 103, 67, 109, 10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152];
  const TOP_HEAD = [10, 338, 297, 332, 284, 251, 389, 356, 454];

  useEffect(() => {
    if (isActive && mirrorStage !== 'choosing' && window.FaceMesh) {
      const faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      const drawAR = (results) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
          
        if (results && results[0]) {
          const m = results[0];
          const w = canvas.width;
          const h = canvas.height;

          // Lips / Makeup
          if (mirrorGender === 'female' && mirrorColor !== '#ecf0f1') {
            ctx.fillStyle = mirrorColor;
            ctx.globalAlpha = 0.55;
            ctx.beginPath();
            LIPS_OUTER.forEach((idx, i) => {
              const pt = m[idx];
              if (i === 0) ctx.moveTo(pt.x * w, pt.y * h);
              else ctx.lineTo(pt.x * w, pt.y * h);
            });
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }

          // Hair / Beard
          if (mirrorHair !== 'none') {
            ctx.beginPath();
            if (mirrorGender === 'male' && mirrorHair.includes('beard')) {
              ctx.fillStyle = 'rgba(40, 25, 10, 0.7)';
              BEARD_LANDMARKS.forEach((idx, i) => {
                const pt = m[idx];
                if (i === 0) ctx.moveTo(pt.x * w, pt.y * h);
                else ctx.lineTo(pt.x * w, pt.y * h);
              });
              ctx.fill();
            } else if (mirrorGender === 'female') {
              ctx.fillStyle = 'rgba(60, 30, 15, 0.5)';
              ctx.beginPath();
              const firstPt = m[10];
              ctx.moveTo(firstPt.x * w, (firstPt.y - 0.15) * h);
              TOP_HEAD.forEach((idx) => {
                const pt = m[idx];
                ctx.lineTo(pt.x * w, (pt.y - 0.1) * h);
              });
              
              if (mirrorHair === 'long') {
                ctx.lineTo(m[454].x * w + 40, m[454].y * h + 200);
                ctx.lineTo(m[234].x * w - 40, m[234].y * h + 200);
              } else if (mirrorHair === 'bob') {
                ctx.lineTo(m[454].x * w + 30, m[454].y * h + 60);
                ctx.lineTo(m[234].x * w - 30, m[234].y * h + 60);
              }
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      };

      faceMesh.onResults((results) => {
        resultsRef.current = results;
        if (!isPhotoView) {
          if (canvasRef.current && videoRef.current) {
            const video = videoRef.current;
            if (canvasRef.current.width !== video.videoWidth) {
              canvasRef.current.width = video.videoWidth || 640;
              canvasRef.current.height = video.videoHeight || 480;
            }
          }
          drawAR(results.multiFaceLandmarks);
        }
      });

      if (isPhotoView && capturedLandmarks) {
        drawAR([capturedLandmarks]);
      }

      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (!isPhotoView) {
            await faceMesh.send({image: videoRef.current});
          }
        },
        width: 640,
        height: 480
      });
      camera.start();

      return () => { 
        camera.stop(); 
        faceMesh.close(); 
      };
    }
  }, [isActive, mirrorStage, mirrorHair, mirrorColor, mirrorGender, isPhotoView, capturedLandmarks]);

  return { videoRef, canvasRef, resultsRef };
};
