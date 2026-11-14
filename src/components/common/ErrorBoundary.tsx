import React from 'react';

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-xl font-bold text-[#282C3F] mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-[#535766] max-w-md mb-5">
            {this.state.errorMessage || 'An unexpected rendering error occurred.'}
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false, errorMessage: '' });
              window.location.href = '/';
            }}
            className="h-11 px-6 rounded-lg bg-[#FF3F6C] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
