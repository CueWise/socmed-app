import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Eye, Heart, Users, TrendingUp, Award, Star, Zap } from "lucide-react";
import { useBrandStore } from "@/hooks/use-brand";
import { useBrands } from "@/hooks/use-brands";

interface BrandIdentityShowcaseProps {
  onClose: () => void;
}

export default function BrandIdentityShowcase({ onClose }: BrandIdentityShowcaseProps) {
  const { selectedBrand } = useBrandStore();
  const { data: brands } = useBrands();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const brand = brands?.find(b => b.id === selectedBrand);

  // Auto-advance slides every 4 seconds
  useEffect(() => {
    if (!brand) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 4);
    }, 4000);

    return () => clearInterval(interval);
  }, [brand]);

  if (!brand) return null;

  const slides = [
    {
      title: "Brand Identity",
      icon: Palette,
      content: (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {brand.logoUrl && (
              <motion.img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-16 h-16 object-contain rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
              />
            )}
            <div>
              <motion.h3 
                className="text-2xl font-bold text-gray-900"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                {brand.name}
              </motion.h3>
              <motion.p 
                className="text-gray-600"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                {brand.industry || "Digital Brand"}
              </motion.p>
            </div>
          </div>
          
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Vision</span>
              </div>
              <p className="text-sm text-blue-700">Creating meaningful connections</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">Values</span>
              </div>
              <p className="text-sm text-purple-700">Authenticity & Innovation</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: "Audience Insights",
      icon: Users,
      content: (
        <div className="space-y-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Target Audience</h3>
            <p className="text-gray-600">Creative professionals and digital enthusiasts</p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-lg">65%</span>
              </div>
              <p className="text-sm text-gray-600">Millennials</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-lg">45%</span>
              </div>
              <p className="text-sm text-gray-600">Creative Field</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-white font-bold text-lg">78%</span>
              </div>
              <p className="text-sm text-gray-600">Mobile First</p>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: "Performance",
      icon: TrendingUp,
      content: (
        <div className="space-y-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Brand Performance</h3>
            <p className="text-gray-600">Latest metrics and achievements</p>
          </motion.div>
          
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-green-900">Engagement Rate</p>
                  <p className="text-sm text-green-700">+24% this month</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">8.4%</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-100 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Followers</p>
                  <p className="text-sm text-blue-700">+1.2K this week</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-600">12.8K</span>
            </div>
          </motion.div>
        </div>
      )
    },
    {
      title: "Achievements",
      icon: Award,
      content: (
        <div className="space-y-6">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">Brand Achievements</h3>
            <p className="text-gray-600">Celebrating our milestones</p>
          </motion.div>
          
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-4 rounded-lg text-center">
              <Star className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="font-bold text-yellow-900">Top Brand</p>
              <p className="text-sm text-yellow-700">Industry Award 2024</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-4 rounded-lg text-center">
              <Zap className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="font-bold text-indigo-900">Innovation</p>
              <p className="text-sm text-indigo-700">Creative Campaign</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-100 p-4 rounded-lg text-center">
              <Heart className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-bold text-emerald-900">Community</p>
              <p className="text-sm text-emerald-700">10K+ Supporters</p>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-4 rounded-lg text-center">
              <TrendingUp className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <p className="font-bold text-pink-900">Growth</p>
              <p className="text-sm text-pink-700">300% This Year</p>
            </div>
          </motion.div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <motion.div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
              >
                {slides[currentSlide].icon && 
                  React.createElement(slides[currentSlide].icon, { className: "w-5 h-5 text-white" })
                }
              </motion.div>
              <div>
                <h2 className="text-xl font-bold">{slides[currentSlide].title}</h2>
                <p className="text-blue-100 text-sm">{brand.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition-all"
            >
              <span className="text-white text-lg">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {slides[currentSlide].content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={prevSlide}
              disabled={isAnimating}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isAnimating && setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'bg-blue-600' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={nextSlide}
              disabled={isAnimating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </div>
  );
}