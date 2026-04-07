import React from 'react';
import { useMirror } from './MirrorContext';
import MirrorStudio from './MirrorStudio';

const AIMirrorModal = ({ onBooking }) => {
  const { isMirrorOpen, setIsMirrorOpen } = useMirror();

  if (!isMirrorOpen) return null;

  return (
    <div className="mirror-overlay" style={{ background: 'rgba(0,0,0,0.85)', zIndex: 9999 }}>
      <MirrorStudio 
        variant="client" 
        onClose={() => setIsMirrorOpen(false)} 
        onBooking={onBooking}
      />
    </div>
  );
};

export default AIMirrorModal;
