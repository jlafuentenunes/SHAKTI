import React, { createContext, useContext, useState, useMemo } from 'react';

const MirrorContext = createContext();

export const MirrorProvider = ({ children }) => {
  const [isMirrorOpen, setIsMirrorOpen] = useState(false);
  const [mirrorGender, setMirrorGender] = useState('female');
  const [mirrorStage, setMirrorStage] = useState('choosing');
  const [mirrorHair, setMirrorHair] = useState('none');
  const [mirrorColor, setMirrorColor] = useState('#e74c3c');
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [capturedLandmarks, setCapturedLandmarks] = useState(null);
  const [isGeneratingLook, setIsGeneratingLook] = useState(false);

  const value = {
    isMirrorOpen, setIsMirrorOpen,
    mirrorGender, setMirrorGender,
    mirrorStage, setMirrorStage,
    mirrorHair, setMirrorHair,
    mirrorColor, setMirrorColor,
    capturedPhoto, setCapturedPhoto,
    capturedLandmarks, setCapturedLandmarks,
    isGeneratingLook, setIsGeneratingLook,
  };

  return <MirrorContext.Provider value={value}>{children}</MirrorContext.Provider>;
};

export const useMirror = () => {
  const context = useContext(MirrorContext);
  if (!context) throw new Error('useMirror must be used within MirrorProvider');
  return context;
};
