import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Zap, Shield, Sparkles } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: CheckCircle2,
      title: "Organizacja",
      description: "Uporządkuj swoje zadania w prosty i intuicyjny sposób"
    },
    {
      icon: Zap,
      title: "Priorytety",
      description: "Oznaczaj najważniejsze zadania i osiągaj cele szybciej"
    },
    {
      icon: Shield,
      title: "Bezpieczeństwo",
      description: "Twoje dane są bezpieczne i chronione"
    },
    {
      icon: Sparkles,
      title: "Inteligentne",
      description: "Smart funkcje, które ułatwiają codzienną produktywność"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-orange-900 to-red-950 text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-16 md:mb-24"
        >
          {/* Logo/Icon */}
          <motion.div
            animate={{
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block mb-8"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl shadow-2xl shadow-orange-900/50 flex items-center justify-center transform rotate-12">
              <CheckCircle2 className="w-12 h-12 md:w-14 md:h-14 text-white transform -rotate-12" />
            </div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-100 bg-clip-text text-transparent"
          >
            Just ToDo
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl mb-4 text-amber-100/90 font-light"
          >
            Twój Organizer Zadań
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base md:text-lg text-amber-200/70 max-w-2xl mx-auto mb-12"
          >
            Prosta, elegancka i efektywna aplikacja do zarządzania zadaniami, 
            która pomoże Ci osiągnąć więcej każdego dnia.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-2xl shadow-orange-900/50 hover:shadow-orange-500/50 transition-all text-lg"
            >
              Zaloguj się
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/register")}
              className="px-8 py-4 border-2 border-amber-300/50 text-amber-100 font-semibold rounded-2xl hover:bg-amber-500/10 hover:border-amber-300 transition-all text-lg backdrop-blur-sm"
            >
              Zarejestruj się
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto"
        >
          <motion.h2
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold text-center mb-12 text-amber-100"
          >
            Dlaczego Just ToDo?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ 
                  scale: 1.05, 
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 backdrop-blur-sm p-6 rounded-2xl border border-amber-700/30 shadow-xl hover:shadow-2xl hover:shadow-orange-900/30 transition-all"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2 text-amber-100">
                  {feature.title}
                </h3>
                <p className="text-amber-200/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="max-w-4xl mx-auto mt-20 md:mt-32 text-center"
        >
          <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 backdrop-blur-md p-8 md:p-12 rounded-3xl border border-amber-700/30 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-amber-100">
              O Projekcie
            </h2>
            <div className="space-y-4 text-amber-200/80 text-lg leading-relaxed">
              <p>
                <strong className="text-amber-100">Just ToDo</strong> to nowoczesna aplikacja do zarządzania zadaniami, 
                stworzona z myślą o prostocie i efektywności.
              </p>
              <p>
                Nasza misja to pomóc Ci w organizacji codziennych aktywności, 
                wyznaczaniu priorytetów i osiąganiu celów - bez zbędnych komplikacji.
              </p>
              <p className="text-amber-300/60 text-base italic">
                [Tutaj możesz dodać więcej szczegółów o projekcie, funkcjach, 
                wizji rozwoju czy zespole...]
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="text-center mt-16 text-amber-300/50 text-sm"
        >
          <p>&copy; 2024 Just ToDo. Wszystkie prawa zastrzeżone.</p>
        </motion.div>
      </div>
    </div>
  );
}

export default Home;
