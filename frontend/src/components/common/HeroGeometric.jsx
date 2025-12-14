import { motion } from 'framer-motion';
import { Circle } from 'lucide-react';

function ElegantShape({
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradientColor = 'rgba(99, 102, 241, 0.15)',
  positionStyle,
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      style={{
        position: 'absolute',
        ...positionStyle,
      }}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          width,
          height,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `linear-gradient(to right, ${gradientColor}, transparent)`,
            backdropFilter: 'blur(2px)',
            border: '2px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px 0 rgba(255, 255, 255, 0.1)',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

function HeroGeometric({
  badge = 'EduManage',
  title1 = 'Elevate Your Digital Vision',
  title2 = 'Crafting Exceptional Websites',
}) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1],
      },
    }),
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        backgroundColor: '#030303',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(244, 63, 94, 0.4) 0%, transparent 50%)',
          filter: 'blur(80px)',
        }}
      />

      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradientColor="rgba(99, 102, 241, 0.35)"
          positionStyle={{ left: '-10%', top: '15%' }}
        />

        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradientColor="rgba(244, 63, 94, 0.35)"
          positionStyle={{ right: '-5%', top: '70%' }}
        />

        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradientColor="rgba(139, 92, 246, 0.35)"
          positionStyle={{ left: '5%', bottom: '5%' }}
        />

        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradientColor="rgba(251, 146, 60, 0.35)"
          positionStyle={{ right: '15%', top: '10%' }}
        />

        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradientColor="rgba(34, 211, 238, 0.35)"
          positionStyle={{ left: '20%', top: '5%' }}
        />
      </div>

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          padding: '0',
          margin: '0',
        }}
      >
        <div style={{ maxWidth: '100%', margin: '0', textAlign: 'center', padding: '0 2rem' }}>


          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 8vw, 3.5rem)',
                fontWeight: 'bold',
                marginBottom: '1.5rem',
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}
            >
              <span
                style={{
                  background: 'linear-gradient(to bottom, white, rgba(255, 255, 255, 0.8))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {title1}
              </span>
              <br />
              <span
                style={{
                  background: 'linear-gradient(to right, rgb(129, 140, 248), rgb(255, 255, 255), rgb(251, 146, 60))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {title2}
              </span>
            </h1>
          </motion.div>

          <motion.div
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <p
              style={{
                fontSize: 'clamp(0.95rem, 1.8vw, 1.15rem)',
                color: 'rgba(255, 255, 255, 0.55)',
                marginBottom: '3rem',
                lineHeight: 1.6,
                fontWeight: 300,
                letterSpacing: '0.05em',
                maxWidth: '28rem',
                margin: '0 auto 3rem',
                padding: '1 1rem',
              }}
            >
              Unified ERP System for smarter student management. Complete digital solution to manage admissions, attendance, fees, results, and communication—built for modern institutions.
            </p>

            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '2rem',
              }}
            >
              <img
                src={process.env.PUBLIC_URL + '/edulearn.webp'}
                alt="ERP System Dashboard"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                style={{
                  maxWidth: '100%',
                  width: 'clamp(500px, 70vw, 1200px)',
                  height: '600px',
                  borderRadius: '16px',
                  boxShadow: '0 20px 60px rgba(99, 102, 241, 0.2), 0 0 80px rgba(244, 63, 94, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, #030303, transparent, rgba(3, 3, 3, 0.8))',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

export { HeroGeometric };
