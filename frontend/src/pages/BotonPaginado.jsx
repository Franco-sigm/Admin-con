import React from 'react';

const BotonPaginado = ({ page, setPage, totalPages }) => {
  return (
    <div className="flex justify-between items-center mt-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
      
      <button
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
        className="
          flex items-center gap-2
          px-5 py-2.5
          text-sm font-semibold
          rounded-xl
          border border-gray-200
          dark:border-gray-600
          bg-white
          dark:bg-gray-700
          text-gray-700
          dark:text-gray-200
          shadow-sm
          transition-all duration-200
          hover:bg-gray-50
          dark:hover:bg-gray-600
          hover:shadow-md
          active:scale-95
          disabled:opacity-40
          disabled:cursor-not-allowed
          disabled:hover:shadow-sm
        "
      >
        <span className="text-base">&larr;</span>
        Anterior
      </button>

      <div className="text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wide">
        Página <span className="text-gray-900 dark:text-white">{page}</span> 
        <span className="mx-1 text-gray-400">/</span> 
        <span className="text-gray-900 dark:text-white">{totalPages || 1}</span>
      </div>

      <button
        disabled={page >= totalPages}
        onClick={() => setPage(page + 1)}
        className="
          flex items-center gap-2
          px-5 py-2.5
          text-sm font-semibold
          rounded-xl
          bg-gray-900
          text-white
          shadow-md
          transition-all duration-200
          hover:bg-gray-800
          hover:shadow-lg
          active:scale-95
          disabled:opacity-40
          disabled:cursor-not-allowed
          disabled:bg-gray-400
        "
      >
        Siguiente
        <span className="text-base">&rarr;</span>
      </button>

    </div>
  );
};

export default BotonPaginado;