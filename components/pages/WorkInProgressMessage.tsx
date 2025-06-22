import React from 'react';

const WorkInProgressMessage: React.FC = () => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-md w-full border-l-4 border-amber-500">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <span
            className="text-3xl sm:text-4xl text-amber-500"
            role="img"
            aria-label="Construction"
          >
            🚧
          </span>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-2">
            Work in Progress
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-1">
            This section or feature is currently under active development.
          </p>
          <p className="text-slate-600 text-sm sm:text-base">
            We're working hard to bring it to you soon. Please check back later!
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgressMessage;