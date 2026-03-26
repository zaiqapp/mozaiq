import { ReactNode } from 'react'

interface WithChildren {
  children?: ReactNode
}

interface WithClassName extends WithChildren {
  className?: string
}

function Card({ children, className = '' }: WithClassName) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-xl border border-[rgba(255,255,255,0.09)]
        bg-[rgba(255,255,255,0.04)] p-6 backdrop-blur-[8px]
        ${className}`}
      style={{
        boxShadow:
          'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
      }}
    >
      {children}
    </div>
  )
}

function Header({ children }: WithChildren) {
  return <div className="mb-4">{children}</div>
}

function Plan({ children }: WithChildren) {
  return <div className="mb-2 flex items-center justify-between">{children}</div>
}

function PlanName({ children }: WithChildren) {
  return <h3 className="font-semibold text-[#f9fafb]">{children}</h3>
}

function Badge({ children }: WithChildren) {
  return (
    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
      {children}
    </span>
  )
}

function Price({ children }: WithChildren) {
  return <div className="mt-2 flex items-baseline gap-1">{children}</div>
}

function MainPrice({ children }: WithChildren) {
  return <span className="text-3xl font-extrabold text-[#f9fafb]">{children}</span>
}

function Period({ children }: WithChildren) {
  return <span className="text-sm text-[#4b5563]">{children}</span>
}

function Body({ children }: WithChildren) {
  return <div className="flex flex-1 flex-col">{children}</div>
}

function List({ children }: WithChildren) {
  return <ul className="mt-4 flex-1 space-y-2">{children}</ul>
}

function ListItem({ children }: WithChildren) {
  return <li className="text-sm text-[#9ca3af]">{children}</li>
}

export const PricingCard = {
  Card,
  Header,
  Plan,
  PlanName,
  Badge,
  Price,
  MainPrice,
  Period,
  Body,
  List,
  ListItem,
}
