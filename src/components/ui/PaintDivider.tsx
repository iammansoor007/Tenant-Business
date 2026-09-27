import React from "react";
import { motion } from "framer-motion";

interface PaintDividerProps {
  color?: string;
  className?: string;
  direction?: "up" | "down";
  flipped?: boolean;
  opacity?: string | number;
}

const PaintDivider: React.FC<PaintDividerProps> = ({ 
  color = "hsl(var(--primary))", 
  className = "", 
  direction = "down",
  flipped = false,
  opacity = 1
}) => {
  return (
    <div 
      className={`relative w-full overflow-hidden leading-[0] z-0 ${className}`}
      style={{ opacity }}
    >
      <motion.svg
        viewBox="0 0 1200 160"
        preserveAspectRatio="none"
        className={`relative block w-full h-[100px] lg:h-[200px] ${flipped ? "scale-x-[-1]" : ""} ${direction === "up" ? "rotate-180" : ""}`}
        initial={{ scaleX: 0.95, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <defs>
          <linearGradient id="paintGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          
          <linearGradient id="glossGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Simplified Background Layers - No expensive filters */}
        <path
          d="M0,20 C150,40 300,10 450,50 C600,70 750,30 900,60 C1050,80 1200,40 1200,40 L1200,160 L0,160 Z"
          fill={color}
          opacity="0.1"
        />

        <path
          d="M0,50 C150,70 300,40 450,80 C600,100 750,60 900,90 C1050,110 1200,70 1200,70 L1200,160 L0,160 Z"
          fill={color}
          opacity="0.2"
        />

        {/* Main Stroke Layer */}
        <path
          d="M0,80 L15,75 L30,82 L45,78 L60,85 L75,81 L90,88 L105,84 L120,91 L135,87 L150,94 L165,90 L180,97 L195,93 L210,100 L225,96 L240,103 L255,99 L270,106 L285,102 L300,109 L315,105 L330,112 L345,108 L360,115 L375,111 L390,118 L405,114 L420,121 L435,117 L450,124 L465,120 L480,127 L495,123 L510,130 L525,126 L540,133 L555,129 L570,136 L585,132 L600,139 L615,135 L630,142 L645,138 L660,145 L675,141 L690,148 L705,144 L720,151 L735,147 L750,154 L765,150 L780,157 L795,153 L810,160 L825,156 L840,163 L855,159 L870,166 L885,162 L900,169 L915,165 L930,172 L945,168 L960,175 L975,171 L990,178 L1005,174 L1020,181 L1035,177 L1050,184 L1065,180 L1080,187 L1095,183 L1110,190 L1125,186 L1140,193 L1155,189 L1170,196 L1185,192 L1200,199 L1200,160 L0,160 Z"
          fill="url(#paintGradient)"
        />

        {/* Subdued Reflection */}
        <path
          d="M0,82 L1200,113"
          stroke="url(#glossGradient)"
          strokeWidth="6"
        />

        {/* High-Performance Static Drips */}
        <g fill={color} opacity="0.6">
          <rect x="150" y="105" width="2" height="40" rx="1" />
          <rect x="450" y="118" width="2" height="25" rx="1" />
          <rect x="850" y="140" width="2" height="30" rx="1" />
        </g>
      </motion.svg>
    </div>
  );
};

export default PaintDivider;
