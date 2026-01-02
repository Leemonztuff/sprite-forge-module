/**
 * Loading and Progress Management Components
 * Provides user feedback for long-running operations
 */

import React from 'react';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  stage?: string;
  total?: number;
  current?: number;
}

export interface LoadingProps {
  state: LoadingState;
  variant?: 'spinner' | 'progress' | 'dots' | 'pulse';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children?: React.ReactNode;
}

/**
 * Basic loading spinner component
 */
export const LoadingSpinner: React.FC<LoadingProps> = ({ state, variant = 'spinner', size = 'md', className = '' }) => {
  if (!state.isLoading) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {variant === 'spinner' && (
        <div className={`${sizeClasses[size]} border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin`}>
          <div className="sr-only">Loading...</div>
        </div>
      )}

      {variant === 'dots' && (
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}

      {variant === 'pulse' && (
        <div className={`${sizeClasses[size]} bg-indigo-500 rounded-full animate-pulse`} />
      )}

      {state.message && (
        <span className="ml-3 text-[9px] font-black uppercase tracking-widest text-slate-400">
          {state.message}
        </span>
      )}
    </div>
  );
};

/**
 * Progress bar component
 */
export const ProgressBar: React.FC<{
  progress: number;
  total?: number;
  showPercentage?: boolean;
  className?: string;
  variant?: 'default' | 'tech' | 'minimal';
}> = ({ progress, total, showPercentage = true, className = '', variant = 'default' }) => {
  const percentage = Math.min(100, Math.max(0, progress));
  const displayProgress = total ? `${Math.round(progress)}/${total}` : `${Math.round(percentage)}%`;

  const getVariantClasses = () => {
    switch (variant) {
      case 'tech':
        return 'bg-[#0d0d0d] border border-indigo-500/20';
      case 'minimal':
        return 'bg-slate-700';
      default:
        return 'bg-indigo-600/20 border border-indigo-500/30';
    }
  };

  const getFillClasses = () => {
    switch (variant) {
      case 'tech':
        return 'bg-indigo-400 shadow-lg shadow-indigo-400/50';
      case 'minimal':
        return 'bg-indigo-500';
      default:
        return 'bg-indigo-400';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {variant === 'tech' && (
        <div className="text-[7px] font-mono text-indigo-400 mb-1 tracking-widest">
          [{displayProgress}]
        </div>
      )}
      <div className={`h-2 ${getVariantClasses()} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${getFillClasses()} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && variant !== 'tech' && (
        <div className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1 text-center">
          {displayProgress}
        </div>
      )}
    </div>
  );
};

/**
 * Full loading overlay with progress
 */
export const LoadingOverlay: React.FC<LoadingProps & {
  showStage?: boolean;
  backdrop?: boolean;
}> = ({ state, showStage = false, backdrop = true, children }) => {
  if (!state.isLoading) {
    return <>{children}</>;
  }

  return (
    <div className={`fixed inset-0 z-[9998] flex items-center justify-center ${backdrop ? 'bg-black/80 backdrop-blur-sm' : ''}`}>
      <div className="bg-[#0d0d0d] border border-white/10 rounded-[2.5rem] p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex items-center gap-4 mb-6">
          <LoadingSpinner state={state} variant="pulse" size="md" />
          <div>
            <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-indigo-400">
              Processing
            </h3>
            {state.message && (
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1">
                {state.message}
              </p>
            )}
          </div>
        </div>

        {state.progress !== undefined && (
          <div className="space-y-4">
            <ProgressBar
              progress={state.progress}
              total={state.total}
              variant="tech"
              showPercentage={true}
            />
            
            {showStage && state.stage && (
              <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">
                Stage: {state.stage}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/5">
          <p className="text-[7px] font-mono text-slate-500 uppercase tracking-widest text-center">
            Neural processing in progress...
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Operation status indicator
 */
export const OperationStatus: React.FC<{
  status: 'idle' | 'processing' | 'success' | 'error' | 'warning';
  message?: string;
  className?: string;
}> = ({ status, message, className = '' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'processing': return 'text-indigo-400';
      case 'success': return 'text-emerald-400';
      case 'error': return 'text-rose-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing': return '⚙';
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      default: return '○';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'processing': return 'PROCESSING';
      case 'success': return 'SUCCESS';
      case 'error': return 'ERROR';
      case 'warning': return 'WARNING';
      default: return 'READY';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full bg-current ${getStatusColor()}`}>
        <span className="text-[8px] flex items-center justify-center">
          {getStatusIcon()}
        </span>
      </div>
      <div className="flex flex-col">
        <span className={`text-[7px] font-black uppercase tracking-widest ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {message && (
          <span className="text-[7px] font-mono text-slate-500">
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Loading hook for managing loading state
 */
export function useLoading(initialState: LoadingState = { isLoading: false }) {
  const [loadingState, setLoadingState] = React.useState<LoadingState>(initialState);

  const startLoading = React.useCallback((message?: string, stage?: string) => {
    setLoadingState({
      isLoading: true,
      message,
      stage,
      progress: 0,
      current: 0,
      total: 100
    });
  }, []);

  const updateProgress = React.useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      message: message || prev.message,
      current: Math.round(progress)
    }));
  }, []);

  const updateTotal = React.useCallback((total: number) => {
    setLoadingState(prev => ({
      ...prev,
      total,
      progress: (prev.current / total) * 100
    }));
  }, []);

  const stopLoading = React.useCallback((message?: string) => {
    setLoadingState({
      isLoading: false,
      message,
      progress: 100,
      stage: undefined
    });
  }, []);

  const reset = React.useCallback(() => {
    setLoadingState(initialState);
  }, [initialState]);

  return {
    loadingState,
    startLoading,
    updateProgress,
    updateTotal,
    stopLoading,
    reset,
    isLoading: loadingState.isLoading,
    progress: loadingState.progress || 0,
    message: loadingState.message,
    stage: loadingState.stage
  };
}

/**
 * Higher-order component for loading state
 */
export function withLoading<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  loadingKey: keyof T = 'isLoading'
) {
  return function WrappedComponent(props: T) {
    const isLoading = props[loadingKey] as boolean;

    if (isLoading) {
      return <LoadingOverlay state={{ isLoading }} />;
    }

    return <Component {...props} />;
  };
}

/**
 * Staggered animation for multiple loading items
 */
export const StaggeredLoading: React.FC<{
  items: number;
  className?: string;
}> = ({ items, className = '' }) => {
  return (
    <div className={`flex gap-2 ${className}`}>
      {Array.from({ length: items }, (_, i) => (
        <div
          key={i}
          className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 100}ms`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
};

/**
 * Tech-style loading text animation
 */
export const TechLoadingText: React.FC<{
  texts: string[];
  interval?: number;
  className?: string;
}> = ({ texts, interval = 2000, className = '' }) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [texts.length, interval]);

  return (
    <div className={`text-[8px] font-mono text-indigo-400 uppercase tracking-widest ${className}`}>
      [{texts[currentIndex]}]
    </div>
  );
};

// Default export
export default LoadingSpinner;