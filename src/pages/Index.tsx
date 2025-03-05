
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { AuthForm } from '@/components/auth/AuthForm';
import { CheckCheck, Clock, Camera, MessageSquare, Star, ListChecks } from 'lucide-react';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function Index() {
  const navigate = useNavigate();
  const {
    user,
    isLoading
  } = useAuth();
  const [showAuthForm, setShowAuthForm] = useState(false);
  
  useEffect(() => {
    if (user && !isLoading) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);
  
  const features = [{
    icon: <Camera className="h-10 w-10 text-highlight" />,
    title: "AI-Prioritized Tasks",
    description: "Upload photos of your space and let AI analyze and prioritize cleaning tasks"
  }, {
    icon: <MessageSquare className="h-10 w-10 text-highlight" />,
    title: "Multi-Modal Input",
    description: "Create tasks by chatting with AI, uploading photos, or manual input"
  }, {
    icon: <Clock className="h-10 w-10 text-highlight" />,
    title: "Focus Mode",
    description: "Stay focused with intelligent timers to help you complete tasks efficiently"
  }, {
    icon: <ListChecks className="h-10 w-10 text-highlight" />,
    title: "Progress Tracking",
    description: "Track your cleaning progress and see your improvement over time"
  }, {
    icon: <Star className="h-10 w-10 text-highlight" />,
    title: "Points & Rewards",
    description: "Earn points for completed tasks and build a record of your achievements"
  }, {
    icon: <CheckCheck className="h-10 w-10 text-highlight" />,
    title: "Responsive Design",
    description: "Use the app seamlessly on desktop, tablet, or mobile devices"
  }];
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-dark-background dark:to-gray-900 overflow-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-8 bg-zinc-800 dark:bg-gray-900">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">CleanSwift</div>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {!showAuthForm && 
              <AnimatedButton 
                variant="highlight" 
                onClick={() => setShowAuthForm(true)} 
                animation="scale"
              >
                Get Started
              </AnimatedButton>
            }
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 bg-zinc-800 dark:bg-gray-900">
        {showAuthForm ? <AuthForm /> : <div className="space-y-24">
            {/* Hero Section */}
            <section className="text-center max-w-4xl mx-auto pt-10 pb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                Transform Your Cleaning Routine with AI
              </h1>
              <p className="text-xl mb-10 max-w-2xl mx-auto text-zinc-400">
                CleanSwift helps you organize, prioritize, and track your cleaning tasks with 
                intelligent AI assistance and a productivity-focused approach.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <AnimatedButton size="lg" variant="highlight" onClick={() => setShowAuthForm(true)} animation="scale" className="text-lg px-8">
                  Start Cleaning Smarter
                </AnimatedButton>
              </div>
            </section>

            {/* Feature Section */}
            <section>
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-white mb-4">Intelligent Features</h2>
                <p className="text-xl text-gray-500 max-w-2xl mx-auto text-center">
                  Our AI-powered platform makes cleaning more efficient and rewarding
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <GlassCard key={index} className="p-6 hover-scale bg-neutral-900 dark:bg-gray-800 dark:border-gray-700">
                    <div className="mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-zinc-50">{feature.title}</h3>
                    <p className="text-zinc-400">{feature.description}</p>
                  </GlassCard>
                ))}
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center py-16">
              <GlassCard className="max-w-3xl mx-auto p-10 bg-zinc-900 dark:bg-gray-800 dark:border-gray-700">
                <h2 className="text-3xl font-bold mb-4 text-zinc-50">Ready to Revolutionize Your Cleaning?</h2>
                <p className="text-lg mb-8 text-zinc-500">
                  Join our community of smart cleaners who are saving time and staying organized.
                </p>
                <AnimatedButton size="lg" variant="highlight" onClick={() => setShowAuthForm(true)} animation="scale" className="px-8">
                  Get Started Now
                </AnimatedButton>
              </GlassCard>
            </section>
          </div>}
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 bg-zinc-800 dark:bg-gray-900 dark:border-gray-800">
        <div className="text-center text-gray-500 text-sm">
          <p>© 2025 CleanSwift. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
