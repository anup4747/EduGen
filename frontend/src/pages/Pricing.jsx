import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  X,
  Zap,
  Sparkles,
  Brain,
  Cpu,
  MessageCircle,
  FileText,
  Bookmark,
  Database,
  Infinity,
} from "lucide-react";

const PricingCard = ({
  title,
  price,
  description,
  features,
  buttonText,
  highlighted,
  icon: Icon,
  accentColor,
}) => {
  return (
    <div
      className={`relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 group ${
        highlighted
          ? "bg-slate-900/80 border-vscode-accent shadow-[0_0_40px_rgba(124,58,237,0.2)] scale-105 z-10"
          : "bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-vscode-accent text-white text-xs font-bold rounded-full shadow-lg tracking-wider uppercase">
          Most Popular
        </div>
      )}

      <div className="mb-8">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 ${accentColor}`}
        >
          <Icon size={28} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
      </div>

      <div className="mb-8 flex items-baseline gap-1">
        <span className="text-4xl font-bold text-white">{price}</span>
        {price !== "Free" && (
          <span className="text-slate-500 font-medium">/year</span>
        )}
      </div>

      <div className="flex-1 space-y-4 mb-10">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3 group/item">
            <div
              className={`mt-1 shrink-0 ${feature.included ? "text-vscode-accent" : "text-slate-600"}`}
            >
              {feature.included ? <Check size={18} /> : <X size={18} />}
            </div>
            <span
              className={`text-sm font-medium transition-colors ${feature.included ? "text-slate-200" : "text-slate-500"}`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      <button
        className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 active:scale-95 ${
          highlighted
            ? "bg-vscode-accent text-white hover:bg-vscode-accent/90 shadow-[0_0_20px_rgba(124,58,237,0.4)]"
            : "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700"
        }`}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default function Pricing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const plans = [
    {
      title: "Free",
      price: "Free",
      description:
        "Perfect for casual learners and beginners exploring new topics.",
      icon: Brain,
      accentColor: "bg-blue-500/10 text-blue-400",
      buttonText: "Get Started",
      highlighted: false,
      features: [
        { text: "3 Courses Total", included: true },
        { text: "Up to 6 Chapters per Course", included: true },
        { text: "Quizzes & Exams Included", included: true },
        { text: "20 AI Chatbot Messages", included: true },
        { text: "Prep Mode", included: false },
        { text: "PDF Export", included: false },
        { text: "Notes & Highlights", included: false },
        { text: "Cross-topic AI Memory", included: false },
      ],
    },
    {
      title: "Pro",
      price: "$10",
      description: "For serious students who need more depth and flexibility.",
      icon: Zap,
      accentColor: "bg-vscode-accent/10 text-vscode-accent",
      buttonText: "Go Pro",
      highlighted: true,
      features: [
        { text: "7 Courses Total", included: true },
        { text: "Up to 8 Chapters per Course", included: true },
        { text: "Quizzes & Exams Included", included: true },
        { text: "Unlimited AI Chatbot", included: true },
        { text: "5 Prep Mode Sessions/mo", included: true },
        { text: "PDF Export", included: true },
        { text: "Notes & Highlights", included: true },
        { text: "Cross-topic AI Memory", included: false },
      ],
    },
    {
      title: "Power",
      price: "$25",
      description:
        "The ultimate learning experience with infinite possibilities.",
      icon: Sparkles,
      accentColor: "bg-amber-500/10 text-amber-400",
      buttonText: "Unlock Power",
      highlighted: false,
      features: [
        { text: "Unlimited Courses", included: true },
        { text: "Up to 8 Chapters per Course", included: true },
        { text: "Quizzes & Exams Included", included: true },
        { text: "Unlimited AI Chatbot", included: true },
        { text: "Unlimited Prep Mode", included: true },
        { text: "PDF Export", included: true },
        { text: "Notes & Highlights", included: true },
        { text: "Cross-topic AI Memory", included: true },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-vscode-bg text-vscode-text font-['Inter'] selection:bg-vscode-accent selection:text-white pb-24">
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-slate-950/80 backdrop-blur-md border-b border-slate-800" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Brain className="w-8 h-8 text-vscode-accent" />
              <span className="text-xl font-bold text-white tracking-tight">
                EduGen
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              to="/pricing"
              className="hidden md:block text-sm font-semibold text-slate-300 hover:text-vscode-accent transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="/login"
              className="hidden sm:block px-4 py-2 text-sm font-semibold text-vscode-accent border border-vscode-accent rounded-full hover:bg-vscode-accent/10 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-vscode-accent rounded-full hover:bg-vscode-accent/90 transition-colors shadow-[0_0_15px_rgba(124,58,237,0.4)]"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-vscode-accent/10 rounded-full blur-[120px] animate-float1"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-float2"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-vscode-accent/30 bg-slate-900/50 backdrop-blur-sm mb-6">
            <Cpu className="w-4 h-4 text-vscode-accent" />
            <span className="text-sm font-semibold text-slate-300">
              Simple, Transparent Pricing
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Choose Your{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-vscode-accent to-purple-400">
              Learning Speed
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            From casual exploration to professional mastery, we have a plan
            designed to help you learn anything faster with AI.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`animate-fade-in-up`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <PricingCard {...plan} />
            </div>
          ))}
        </div>

        {/* Comparison Section (Simplified for visual appeal) */}
        <div
          className="mt-32 text-center animate-fade-in-up"
          style={{ animationDelay: "600ms" }}
        >
          <h2 className="text-2xl font-bold text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            {[
              {
                q: "Can I switch plans anytime?",
                a: "Yes, you can upgrade or downgrade your plan at any time from your profile settings.",
              },
              {
                q: "Is there a student discount?",
                a: "The Free plan is designed specifically for students, but we offer seasonal discounts for Pro and Power plans.",
              },
              {
                q: "What is AI Memory?",
                a: "AI Memory allows the chatbot to remember concepts from your other courses to provide unified cross-topic explanations.",
              },
              {
                q: "What is Prep Mode?",
                a: "A specialized AI mode that generates intensive drills, flashcards, and practice exams for competitive certification prep.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/60 hover:border-slate-700 transition-colors"
              >
                <h4 className="text-white font-bold mb-2">{faq.q}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 text-center">
          <Link
            to="/"
            className="text-slate-500 hover:text-vscode-accent text-sm font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
