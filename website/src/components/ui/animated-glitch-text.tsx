import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlitchTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
  textClassName?: string
  containerClassName?: string
  colors?: {
    red: string
    green: string
    blue: string
  }
}

const GlitchText = React.forwardRef<HTMLSpanElement, GlitchTextProps>(
  ({
    text,
    className,
    textClassName,
    containerClassName,
    colors = {
      red: "#ff0000",
      green: "#00ff00",
      blue: "#0000ff"
    },
    ...props
  }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center justify-start",
          className
        )}
        {...props}
      >
        <div className={cn(
          "relative",
          containerClassName
        )}>
          {/* Red/Cyan layer */}
          <motion.div
            className={cn(
              "text-6xl font-bold absolute inset-0",
              "mix-blend-multiply dark:mix-blend-screen",
              textClassName
            )}
            style={{ color: colors.red }}
            animate={{
              x: [-2, 2, -2],
              y: [0, -1, 1],
              skewX: [0, -2, 2],
              opacity: [1, 0.8, 0.9],
            }}
            transition={{
              duration: 0.15,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "anticipate"
            }}
          >
            {text}
          </motion.div>
          {/* Green/Purple layer */}
          <motion.div
            className={cn(
              "text-6xl font-bold absolute inset-0",
              "mix-blend-multiply dark:mix-blend-screen",
              textClassName
            )}
            style={{ color: colors.green }}
            animate={{
              x: [2, -2, 2],
              y: [1, -1, 0],
              skewX: [-2, 2, 0],
              opacity: [0.9, 1, 0.8],
            }}
            transition={{
              duration: 0.13,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "anticipate"
            }}
          >
            {text}
          </motion.div>
          {/* Blue/Magenta layer (main visible layer) */}
          <motion.div
            className={cn(
              "text-6xl font-bold relative",
              "mix-blend-multiply dark:mix-blend-screen",
              textClassName
            )}
            style={{ color: colors.blue }}
            animate={{
              x: [-1, 1, -1],
              y: [-1, 1, 0],
              skewX: [2, -2, 0],
              opacity: [0.8, 0.9, 1],
            }}
            transition={{
              duration: 0.11,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "anticipate"
            }}
          >
            {text}
          </motion.div>
        </div>
      </span>
    )
  }
)
GlitchText.displayName = "GlitchText"

export { GlitchText }
