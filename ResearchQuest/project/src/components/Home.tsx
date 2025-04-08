import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users,
  ArrowRight,
  Sparkles,
  Brain,
  Rocket,
  Target
} from 'lucide-react';

interface Feature {
  icon: React.FC<any>;
  title: string;
  description: string;
  color: string;
}

interface Testimonial {
  name: string;
  role: string;
  comment: string;
  avatar: string;
}

interface Stat {
  value: string;
  label: string;
}

export default function Home() {
  const features: Feature[] = [
    {
      icon: Brain,
      title: 'Research Discovery',
      description: 'Find and explore research topics that match your interests.',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Community Collaboration',
      description: 'Connect with researchers across Discord, Slack, and Reddit.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Rocket,
      title: 'Resource Sharing',
      description: 'Share and discover valuable research resources.',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Target,
      title: 'Gamified Learning',
      description: 'Earn points and badges as you progress in your research journey.',
      color: 'from-orange-500 to-pink-500'
    },
  ];

  const testimonials: Testimonial[] = [
    {
      name: 'John Doe',
      role: 'Researcher at Stanford',
      comment: 'This platform has transformed the way I collaborate with peers. Highly recommended!',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Jane Smith',
      role: 'PhD Candidate at MIT',
      comment: 'The gamified learning aspect keeps me motivated. Love the community here!',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    {
      name: 'Alice Johnson',
      role: 'Data Scientist at Google',
      comment: 'A fantastic resource for sharing and discovering research materials.',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg'
    }
  ];

  const stats: Stat[] = [
    { value: '10,000+', label: 'Active Researchers' },
    { value: '500+', label: 'Research Topics' },
    { value: '1M+', label: 'Resources Shared' },
    { value: '100+', label: 'Communities' }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <div className="space-y-20 px-6 py-12">
      <main className="flex-grow">
        <div className="space-y-20 px-6 py-12">
          {/* Hero Section */}
          <section className="text-center space-y-8 relative overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 to-white rounded-3xl transform -skew-y-6"
            />

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold text-gray-900 relative"
            >
              Collaborate on Research,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 relative">
                Earn as You Learn
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -right-8 -top-8"
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Join a community of researchers, share knowledge, and earn rewards while
              advancing your research journey.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <Link
                to="/journey"
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"
                  whileHover={{ scale: 1.5 }}
                />
                <span className="relative flex items-center justify-center space-x-2">
                  <span>Start Your Journey</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link
                to="/communities"
                className="group px-8 py-4 border-2 border-indigo-600 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>Explore Communities</span>
                  <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </span>
              </Link>
            </motion.div>
          </section>

          {/* Features Section */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ y: -10, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative p-8 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
                <div className={`p-3 bg-gradient-to-br ${feature.color} rounded-xl inline-block`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mt-6">{feature.title}</h3>
                <p className="text-gray-600 mt-2">{feature.description}</p>
              </motion.div>
            ))}
          </motion.section>

          {/* Stats Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 py-16 rounded-2xl"
          >
            <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <h3 className="text-4xl font-bold text-indigo-600">{stat.value}</h3>
                  <p className="text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Testimonials Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-6xl mx-auto space-y-12"
          >
            <h2 className="text-3xl font-bold text-center text-gray-900">What Our Users Say</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                      <p className="text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-gray-600">{testimonial.comment}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Call-to-Action Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl shadow-lg"
          >
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold text-white">Ready to Start?</h2>
              <p className="text-indigo-100">
                Begin your research journey today and join our growing community of researchers.
              </p>
              <Link
                to="/journey"
                className="inline-block px-8 py-4 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition-all duration-300"
              >
                <span className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}