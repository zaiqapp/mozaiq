"use client";

import {
  Add01Icon,
  MinusSignIcon,
  Tick02Icon,
  UserStoryIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import NumberFlow from "@number-flow/react";
import { AnimatePresence, motion, LayoutGroup } from "motion/react";
import { useState } from "react";
const plans = [
  {
    id: "free",
    name: "Free",
    description: "self-hosted",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "3 dashboards",
      "Watermark on share",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "individuals & teams",
    monthlyPrice: 15,
    yearlyPrice: 12,
    features: [
      "Unlimited dashboards",
      "No watermark",
      "AI generator",
      "Google Sheets + CSV",
      "Priority support",
    ],
  },
  {
    id: "whitelabel",
    name: "White-label",
    description: "agencies & enterprise",
    monthlyPrice: 199,
    yearlyPrice: 159,
    features: [
      "Everything in Pro",
      "Remove branding",
      "Custom domain",
      "Team access",
    ],
  },
];

const TRANSITION = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

export default function PricingCard() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [selectedPlan, setSelectedPlan] = useState("pro");
  const [userCount, setUserCount] = useState(3);

  return (
    <LayoutGroup>
      <div className="w-full max-w-[450px] flex flex-col gap-6 p-5 px-4 sm:p-6 rounded-2xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] backdrop-blur-[8px] mx-auto not-prose" style={{ boxShadow: "inset 2px 2px 1px rgba(255,255,255,0.06), inset -1px -1px 1px rgba(255,255,255,0.03)" }}>
        <div className="flex flex-col gap-4 mb-2">
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Select a Plan
          </h1>

          <div className="bg-zinc-800 p-1 h-10 w-full rounded-xl border border-white/10 flex">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`flex-1 h-full rounded-lg text-base font-medium relative transition-colors duration-300 ${
                billingCycle === "monthly"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {billingCycle === "monthly" && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-zinc-700 rounded-lg shadow-sm border border-white/10"
                  transition={TRANSITION}
                />
              )}
              <span className="relative z-10">Monthly</span>
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`flex-1 h-full rounded-lg text-base font-medium relative transition-colors duration-300 flex items-center justify-center gap-2 ${
                billingCycle === "yearly"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              {billingCycle === "yearly" && (
                <motion.div
                  layoutId="tab-bg"
                  className="absolute inset-0 bg-zinc-700 rounded-lg shadow-sm border border-white/10"
                  transition={TRANSITION}
                />
              )}
              <span className="relative z-10">Yearly</span>
              <span className="relative z-10 bg-cyan-500 text-xs font-black px-1.5 py-0.5 rounded-full uppercase text-white tracking-tight whitespace-nowrap">
                20% OFF
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const price =
              billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className="relative cursor-pointer"
              >
                <div
                  className={`relative rounded-xl bg-zinc-800/60 border transition-colors duration-300 ${
                    isSelected
                      ? "z-10 border-cyan-500 border-2"
                      : "border-white/10"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex gap-4">
                        <div className="mt-1 shrink-0">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                              isSelected
                                ? "border-cyan-500"
                                : "border-zinc-600"
                            }`}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {isSelected && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  className="w-4 h-4 rounded-full bg-cyan-500"
                                  transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                    duration: 0.2,
                                  }}
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-white leading-tight">
                            {plan.name}
                          </h3>
                          <p className="text-sm text-zinc-400 lowercase">
                            {plan.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-medium text-white">
                          <NumberFlow
                            value={price}
                            format={{ style: "currency", currency: "USD" }}
                          />
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center justify-end gap-1">
                          {billingCycle === "monthly" ? "/ month" : "/ month, billed yearly"}
                        </div>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.32, 0.72, 0, 1],
                          }}
                          className="overflow-hidden w-full"
                        >
                          <div className="pt-6 flex flex-col gap-6">
                            <div className="flex flex-col gap-3.5">
                              {plan.features.map((feature, idx) => (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    delay: idx * 0.05,
                                    duration: 0.3,
                                  }}
                                  key={idx}
                                  className="flex items-center gap-3 text-sm text-zinc-300"
                                >
                                  <HugeiconsIcon
                                    icon={Tick02Icon}
                                    size={16}
                                    className="text-cyan-400"
                                  />
                                  {feature}
                                </motion.div>
                              ))}
                            </div>

                            <div className="h-px bg-zinc-700" />

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-zinc-700 shrink-0 flex items-center justify-center">
                                  <HugeiconsIcon
                                    icon={UserStoryIcon}
                                    size={30}
                                    className="text-zinc-400"
                                  />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-base font-medium text-white leading-none">
                                    Users
                                  </span>
                                  <span className="text-sm text-zinc-400 mt-0.5">
                                    Starting at {userCount} users
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 bg-zinc-700 p-1.5 rounded-xl border border-white/10">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUserCount(Math.max(1, userCount - 1));
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-zinc-600 hover:shadow-sm transition-all text-zinc-400 hover:text-white active:scale-95"
                                >
                                  <HugeiconsIcon icon={MinusSignIcon} size={14} />
                                </button>
                                <span className="text-sm w-4 text-center tabular-nums text-zinc-300">
                                  <NumberFlow value={userCount} />
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setUserCount(userCount + 1);
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-zinc-600 hover:shadow-sm transition-all text-zinc-400 hover:text-white active:scale-95"
                                >
                                  <HugeiconsIcon icon={Add01Icon} size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </LayoutGroup>
  );
}
