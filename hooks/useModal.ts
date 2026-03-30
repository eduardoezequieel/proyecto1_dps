/** Hook para controlar la apertura/cierre de modales con animaciones CSS. */
import { useState, useRef, useEffect, useCallback } from 'react';

export function useModal(closeDuration = 200) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    // Doble requestAnimationFrame: fuerza al navegador a pintar el estado inicial
    // antes de aplicar la clase de transición (técnica estándar para CSS transitions).
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => setIsEntering(true));
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [isOpen]);

  const open = useCallback(() => {
    setIsEntering(false);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setIsEntering(false);
    }, closeDuration);
  }, [closeDuration]);

  return { isOpen, isEntering, isClosing, open, close };
}
