export const DisciplineSelector: React.FC<DisciplineSelectorProps> = ({ onSelectDiscipline }) => {
  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">Mentor de Proyectos IA</h1>
        <p className="text-lg text-slate-600 max-w-2xl">Elige una disciplina para comenzar a planificar tu próximo gran proyecto con la ayuda de la IA.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {(Object.keys(DISCIPLINE_DETAILS) as Discipline[]).map((key) => {
          const details = DISCIPLINE_DETAILS[key];
          const IconComponent = ICONS[details.icon];
          return (
            <button
              key={key}
              onClick={() => onSelectDiscipline(key)}
              className="group flex flex-col items-center p-8 bg-white rounded-2xl shadow-lg border border-slate-200 hover:border-sky-500 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-300"
            >
              <div className="mb-6 p-5 bg-sky-100 rounded-full group-hover:bg-sky-500 transition-colors duration-300">
                {IconComponent && <IconComponent className="h-12 w-12 text-sky-500 group-hover:text-white transition-colors duration-300" />}
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{details.title}</h2>
              <p className="text-slate-500 text-center">{details.description}</p>
            </button>
          );
        })}
      </div>
       <footer className="mt-12 text-center text-sm text-slate-500">
            <p>Selecciona una categoría para recibir preguntas guiadas y generar un plan de proyecto completo.</p>
      </footer>
    </div>
  );
};
    </div>
  );
};
