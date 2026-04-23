import { cn } from "@/lib/utils";
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const AnimatedText = ({ 
  text, 
  el: Wrapper = 'p', 
  className = '', 
  delay = 0 
}) => {
  const textArray = Array.isArray(text) ? text : text.trim().replace(/\s+/g, ' ').split(' ');
  const accessibleText = Array.isArray(text) ? text.join(' ') : text;
  
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1, 
        delayChildren: delay, 
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { type: 'spring', damping: 12, stiffness: 100 } 
    },
  };

  return (
    <Wrapper className={className}>
      <span className="sr-only">{accessibleText}</span>
      <motion.span
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        aria-hidden
      >
        {textArray.map((word, index) => (
          <React.Fragment key={`${word}-${index}`}>
            <span className="inline-block overflow-hidden">
              <motion.span 
                className="inline-block" 
                variants={childVariants}
              >
                {word}
              </motion.span>
            </span>
            {/* Inyectamos el espacio real directamente en el HTML en lugar de usar CSS */}
            {index < textArray.length - 1 && <span>&nbsp;</span>}
          </React.Fragment>
        ))}
      </motion.span>
    </Wrapper>
  );
};

export default AnimatedText;
