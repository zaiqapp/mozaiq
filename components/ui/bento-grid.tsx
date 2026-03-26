"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Sparkles, Share2, LayoutGrid, GitBranch, Database } from "lucide-react"

// Drag & Drop demo — animated widget layout
function DragDropDemo() {
  const [layout, setLayout] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLayout((prev) => (prev + 1) % 3)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const layouts = ["grid-cols-2", "grid-cols-3", "grid-cols-1"]

  return (
    <div className="h-full flex items-center justify-center">
      <motion.div
        className={`grid ${layouts[layout]} gap-1.5 w-full max-w-[140px]`}
        layout
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {[1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="bg-white/20 rounded-md h-5 w-full"
            layout
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </motion.div>
    </div>
  )
}

// AI Generator — animated "generating" effect
function AIGeneratorDemo() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="h-10 flex items-center justify-center overflow-hidden relative w-full">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loader"
              className="h-8 w-24 bg-white/10 rounded"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              exit={{ opacity: 0, y: -20, position: "absolute" }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          ) : (
            <motion.span
              key="text"
              initial={{ y: 20, opacity: 0, filter: "blur(5px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              className="text-3xl md:text-4xl font-sans font-medium text-white"
            >
              3s
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span className="text-sm text-gray-400">Full Dashboard</span>
      <div className="w-full max-w-[120px] h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white rounded-full"
          initial={{ width: 0 }}
          animate={{ width: loading ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 15, mass: 1 }}
        />
      </div>
    </div>
  )
}

// Share — pulsing globe
function ShareDemo() {
  const pulses = [0, 1, 2, 3]

  return (
    <div className="flex items-center justify-center h-full relative">
      <Globe className="w-14 h-14 text-white/80 z-10" />
      {pulses.map((pulse) => (
        <motion.div
          key={pulse}
          className="absolute w-14 h-14 border-2 border-white/30 rounded-full"
          initial={{ scale: 0.5, opacity: 1 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: pulse * 0.8,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  )
}

// Templates — cycling tags
function TemplatesDemo() {
  const [activeIdx, setActiveIdx] = useState(0)
  const templates = [
    { id: 1, label: "Analytics" },
    { id: 2, label: "Inventory" },
    { id: 3, label: "Purchasing" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % templates.length)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-full gap-2">
      {templates.map((item, i) => (
        <motion.div
          key={item.id}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            i === activeIdx ? "bg-white/20 text-white" : "bg-white/5 text-gray-600"
          }`}
          animate={{ scale: i === activeIdx ? 1.08 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {item.label}
        </motion.div>
      ))}
    </div>
  )
}

// Open Source — animated code symbol
function OpenSourceDemo() {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setScale((prev) => (prev === 1 ? 1.4 : 1))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-full">
      <motion.span
        className="font-mono text-5xl md:text-7xl text-white font-medium"
        animate={{ scale }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {"</>"}
      </motion.span>
    </div>
  )
}

// Data Sources — cycling connector labels
function DataSourcesDemo() {
  const [active, setActive] = useState(0)
  const sources = ["Sheets", "CSV", "REST"]

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % sources.length)
    }, 1200)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center h-full gap-4">
      {sources.map((src, i) => (
        <motion.div
          key={src}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            i === active
              ? "bg-cyan-500/30 text-cyan-300 border border-cyan-500/40"
              : "bg-white/5 text-gray-600"
          }`}
          animate={{ scale: i === active ? 1.1 : 1 }}
          transition={{ duration: 0.3 }}
        >
          {src}
        </motion.div>
      ))}
    </div>
  )
}

export default function BentoGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 auto-rows-[200px]">

      {/* 1. Drag & Drop — Tall (2×2) */}
      <motion.div
        className="md:col-span-2 md:row-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-8 flex flex-col hover:border-zinc-700 transition-colors cursor-pointer overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02, backgroundColor: "rgba(39, 39, 42, 0.9)" }}
      >
        <div className="flex-1">
          <DragDropDemo />
        </div>
        <div className="mt-4">
          <h3 className="font-serif text-xl text-white font-medium flex items-center gap-2">
            <LayoutGrid className="w-5 h-5" />
            Drag &amp; Drop
          </h3>
          <p className="text-gray-400 text-sm mt-1">11 widget types. Resize, reorder, configure inline.</p>
        </div>
      </motion.div>

      {/* 2. AI Generator — Standard (2×1) */}
      <motion.div
        className="md:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-8 flex flex-col hover:border-zinc-700 transition-colors cursor-pointer overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        whileHover={{ scale: 0.98 }}
      >
        <div className="flex-1">
          <AIGeneratorDemo />
        </div>
        <div className="mt-4">
          <h3 className="font-serif text-xl text-white font-medium flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI Generator
          </h3>
          <p className="text-gray-400 text-sm mt-1">Describe your dashboard, get a full layout in seconds.</p>
        </div>
      </motion.div>

      {/* 3. Share — Tall (2×2) */}
      <motion.div
        className="md:col-span-2 md:row-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 flex flex-col hover:border-zinc-700 transition-colors cursor-pointer overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
      >
        <div className="flex-1 flex items-center justify-center">
          <ShareDemo />
        </div>
        <div className="mt-auto relative z-20 bg-zinc-900/50 backdrop-blur-sm rounded-lg p-2">
          <h3 className="font-serif text-xl text-white flex items-center gap-2 font-medium">
            <Share2 className="w-5 h-5" />
            Share Anywhere
          </h3>
          <p className="text-gray-400 text-sm mt-1">One link. Embeddable via iframe. No login required.</p>
        </div>
      </motion.div>

      {/* 4. Templates — Standard (2×1) */}
      <motion.div
        className="md:col-span-2 bg-zinc-900/80 border border-zinc-800 rounded-xl p-8 flex flex-col hover:border-zinc-700 transition-colors cursor-pointer overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        whileHover={{ scale: 0.98 }}
      >
        <div className="flex-1">
          <TemplatesDemo />
        </div>
        <div className="mt-4">
          <h3 className="font-serif text-xl text-white font-medium">Starter Templates</h3>
          <p className="text-gray-400 text-sm mt-1">Analytics, Inventory, Purchasing — ready in one click.</p>
        </div>
      </motion.div>

      {/* 5. Open Source — Wide (3×1) */}
      <motion.div
        className="md:col-span-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-8 flex flex-col hover:border-zinc-700 transition-colors cursor-pointer overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 0.98 }}
      >
        <div className="flex-1">
          <OpenSourceDemo />
        </div>
        <div className="mt-4">
          <h3 className="font-serif text-xl text-white flex items-center gap-2 font-medium">
            <GitBranch className="w-5 h-5" />
            Open Source
          </h3>
          <p className="text-gray-400 text-sm mt-1">AGPL-3.0. Self-host forever. One-click deploy to Vercel.</p>
        </div>
      </motion.div>

      {/* 6. Data Sources — Wide (3×1) */}
      <motion.div
        className="md:col-span-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-8 flex flex-col hover:border-zinc-700 transition-colors cursor-pointer overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 0.98 }}
      >
        <div className="flex-1 flex items-center justify-center">
          <DataSourcesDemo />
        </div>
        <div className="mt-4">
          <h3 className="font-serif text-xl text-white font-medium flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Ready
          </h3>
          <p className="text-gray-400 text-sm mt-1">Google Sheets, CSV, REST API connectors coming soon.</p>
        </div>
      </motion.div>

    </div>
  )
}
