'use client'
import { Component, type ReactNode } from 'react'

interface Props { children: ReactNode; title?: string }
interface State { hasError: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State { return { hasError: true } }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full items-center justify-center rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-500">
            {this.props.title ?? 'Widget'} failed to render
          </p>
        </div>
      )
    }
    return this.props.children
  }
}
