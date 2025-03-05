
import React, { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
  location?: string;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -10,
  },
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.3,
};

export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  location,
  className = "",
}) => {
  const [renderKey, setRenderKey] = useState<string>(location || "default");

  useEffect(() => {
    if (location) {
      setRenderKey(location);
    }
  }, [location]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={renderKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
