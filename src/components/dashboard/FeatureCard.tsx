"use client"

import { Mic } from "lucide-react";

const FeatureCard = () => {
    return (
    // <div className="h-full relative  items-center rounded-[2rem] shadow-xl bg-cover bg-purple-300">
        <div className="h-full relative  items-center rounded-[2rem] shadow-xl bg-cover" style={{backgroundImage: "url('/images/nature.jpg')"}}>
          <div className="flex flex-col   items-center p-15 rounded-[2rem] bg-black/20 backdrop-blur-xs border border-white/30 shadow-2xl w-full h-full">
            {/* Mic Button */}
            <div className="mb-5 mt-10">
              <button className="w-20 h-20 hover:cursor-pointer rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Mic className="w-10 h-10 text-primary" />
              </button>
            </div>

            <div className="flex-1 mb-4 p-4 text-center">
              <h2 className="text-xl font-bold text-white mb-1">
                What is in your mind?
              </h2>
              <p className="text-sm text-white/90">
                Let&apos;s take a deep breath and relax your mind.
              </p>
            </div>
          </div>
        </div>
    );
};

export default FeatureCard;
