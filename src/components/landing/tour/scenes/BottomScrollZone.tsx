import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BottomScrollZoneProps {
  onClick?: () => void;
}

export default function BottomScrollZone({ onClick }: BottomScrollZoneProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
    >
      <Button
        onClick={onClick}
        variant="ghost"
        size="sm"
        className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
      >
        <ChevronDown className="h-5 w-5 text-white" />
        <span className="sr-only">Next scene</span>
      </Button>
    </motion.div>
  );
}