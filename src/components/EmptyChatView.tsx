"use client";

import { motion, usePresence } from "framer-motion";
import { FaComment, FaUsers, FaPlus } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { useMemo, memo } from "react";

interface EmptyChatViewProps {
  onNewChat: () => void;
  onNewGroup: () => void;
}

const FloatingParticle = memo(() => (
  <motion.div
    aria-hidden="true"
    className="absolute w-1 h-1 rounded-full bg-purple-300/30"
    initial={{ opacity: 0, scale: 0 }}
    animate={{
      opacity: [0, 0.5, 0],
      scale: [0, 1, 0],
      x: `calc(${Math.random() * 100}% + ${Math.random() * 50 - 25}px)`,
      y: `calc(${Math.random() * 100}% + ${Math.random() * 50 - 25}px)`,
    }}
    transition={{
      duration: 10 + Math.random() * 10,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
));

FloatingParticle.displayName = "FloatingParticle";

const BackgroundEffects = () => (
  <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(129,140,248,0.1)_0%,_transparent_60%)] mix-blend-screen" />
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] rounded-full bg-gradient-to-br from-purple-500/10 via-transparent to-blue-400/10"
      animate={{ rotate: 360 }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

const CTAButton = ({
  onClick,
  icon: Icon,
  children,
}: {
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}) => (
  <Button
    onClick={onClick}
    role="button"
    aria-label={children?.toString()}
    className="group relative h-14 px-8 rounded-xl bg-slate-800/50 hover:bg-purple-500/20 border border-purple-500/30 transition-all duration-300 overflow-hidden focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900"
  >
    <span className="relative z-10 flex items-center gap-3 text-purple-100 group-hover:text-white text-lg">
      <Icon className="w-6 h-6 transition-transform group-hover:rotate-90" />
      {children}
    </span>
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
  </Button>
);

export function EmptyChatView({ onNewChat, onNewGroup }: EmptyChatViewProps) {
  const particles = useMemo(() => Array.from({ length: 20 }), []);
  const [isPresent] = usePresence();

  return (
    <div
      role="region"
      aria-label="Empty chat view"
      className=" hidden md:flex flex-1 flex-col items-center justify-center bg-slate-900 relative overflow-hidden p-4"
    >
      <BackgroundEffects />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((_, i) => (
          <FloatingParticle key={i} />
        ))}
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isPresent ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 space-y-8 text-center max-w-2xl"
      >
        <div className="flex flex-col items-center gap-8">
          <motion.div
            className="relative group p-8 bg-slate-800/30 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl transition-all duration-500 hover:bg-slate-800/40 hover:border-slate-600/70"
            whileHover={{ scale: 1.02 }}
            role="presentation"
          >
            <div className="flex gap-5 transform-gpu">
              <ChatIconWrapper icon={FaComment} color="purple" delay={0} />
              <ChatIconWrapper icon={FaUsers} color="blue" delay={2} />
            </div>
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-200 to-blue-200 bg-clip-text text-transparent">
              Start Connecting
            </h1>
            <p className="text-slate-300/90 text-base md:text-lg leading-relaxed max-w-md">
              Begin a new conversation or create a group to start messaging
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <CTAButton onClick={onNewChat} icon={FaPlus}>
              New Chat
            </CTAButton>
            <CTAButton onClick={onNewGroup} icon={FaUsers}>
              New Group
            </CTAButton>
          </div>
        </div>
      </motion.div>

      {/* Accessibility-friendly grid pattern */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate-400/10 [mask-image:linear-gradient(to_bottom,transparent,black)]" />
      </div>
    </div>
  );
}

const ChatIconWrapper = memo(
  ({
    icon: Icon,
    color,
    delay,
  }: {
    icon: React.ElementType;
    color: "purple" | "blue";
    delay: number;
  }) => (
    <motion.div
      className={`w-20 h-20 bg-gradient-to-br from-${color}-600/80 to-${color}-500/80 rounded-2xl shadow-2xl flex items-center justify-center cursor-pointer relative`}
      animate={{
        rotate: [12, -8, 12],
        y: [-5, 5, -5],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      whileHover={{
        rotate: 0,
        scale: 1.1,
        transition: { duration: 0.4 },
      }}
      role="img"
      aria-label={`${color} chat icon`}
    >
      <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay" />
      <Icon className={`w-8 h-8 text-${color}-100/90 transition-transform`} />
    </motion.div>
  )
);

ChatIconWrapper.displayName = "ChatIconWrapper";
