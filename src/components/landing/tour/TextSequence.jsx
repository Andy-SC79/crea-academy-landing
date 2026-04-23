import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TextSequence = ({ sequenceData = [], activeIndex = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!sequenceData || sequenceData.length === 0) return;

    if (currentIndex >= sequenceData.length - 1) return;

    const currentDuration = sequenceData[currentIndex].durationMs || 4000;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, currentDuration);

    return () => clearTimeout(timer);
  }, [currentIndex, sequenceData]);

  if (!sequenceData.length) return null;

  return (
    <div className="relative flex flex-col justify-start w-full pt-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeIndex !== null ? activeIndex : currentIndex}
          // Kinetic physics: Soft vertical fade to prevent bounds clipping in mobile viewports
          initial={{ opacity: 0, y: 15, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -15, filter: "blur(12px)" }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
          }}
          className="relative w-full"
        >
          {/* Rendered text node. Inherits typography and spacing constraints from parent */}
          {sequenceData[activeIndex !== null ? activeIndex : currentIndex]?.text}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TextSequence;
