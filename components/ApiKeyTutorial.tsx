import React, { useState } from 'react';

interface ApiKeyTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyTutorial: React.FC<ApiKeyTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🌐 Ve a Google AI Studio",
      description: "Abre tu navegador y visita el sitio oficial de Google para obtener tu API Key gratuita",
      image: "https://i.imgur.com/example1.png", // Placeholder - necesitarías screenshots reales
      action: "Haz clic en el botón de abajo para abrir en nueva pestaña"
    },
    {
      title: "👤 Inicia sesión con Google", 
      description: "Usa tu cuenta Gmail. ¡No necesitas tarjeta de crédito ni pagar nada!",
      image: "https://i.imgur.com/example2.png",
      action: "Es completamente gratis y solo toma 30 segundos"
    },
    {
      title: "🔑 Crea tu API Key",
      description: "Busca el botón 'Create API Key' o 'Crear clave de API' y haz clic",
      image: "https://i.imgur.com/example3.png", 
      action: "El botón es grande y fácil de encontrar"
    },
    {
      title: "📋 Copia tu clave",
      description: "Copia la clave que comienza con 'AIza...' - es muy larga pero cópiala completa",
      image: "https://i.imgur.com/example4.png",
      action: "No te preocupes por recordarla, solo cópiala y pégala"
    },
    {
      title: "✅ ¡Listo!",
      description: "Ahora vuelve a la app y pega tu API Key. ¡Ya puedes crear sprites con IA!",
      image: "https://i.imgur.com/example5.png",
      action: "Cada cuenta puede crear hasta 5 keys para más cuota"
    }
  ];

  if (!isOpen) return null;

  const nextStep = () => setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(Math.max(currentStep - 1, 0));
  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-[#0d0d0d] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[3rem] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10">
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto sm:hidden mt-4" />
        
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-purple-400">Tutorial_Neural</h2>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Protocolo de Adquisición de API Key</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors text-[20px] font-black"
            >
              ×
            </button>
          </div>
          
          {/* Progress indicators */}
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  index === currentStep 
                    ? 'bg-purple-400 shadow-lg shadow-purple-400/50' 
                    : index < currentStep 
                    ? 'bg-purple-600/60' 
                    : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-[14px] font-black uppercase tracking-[0.3em] text-white">
                {currentStepData.title}
              </h3>
              <p className="text-[9px] text-slate-400 leading-relaxed">
                {currentStepData.description}
              </p>
            </div>
            
            {currentStepData.image && (
              <div className="bg-[#0d0d0d] border border-white/5 rounded-[1.5rem] p-6">
                <div className="bg-[#0a0a0a] border border-dashed border-white/10 rounded-xl h-48 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-3xl opacity-50">📸</div>
                    <p className="text-[8px] text-slate-600 uppercase tracking-widest">Captura del Paso {currentStep + 1}</p>
                    <p className="text-[6px] text-slate-700">(Visualización de interfaz real)</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-purple-600/5 border border-purple-500/20 rounded-xl">
              <p className="text-[8px] text-purple-400 font-black uppercase tracking-widest">
                💡 Directriz: {currentStepData.action}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                currentStep === 0 
                  ? 'bg-[#0d0d0d] border border-white/5 text-slate-700 cursor-not-allowed'
                  : 'bg-[#0d0d0d] border border-white/10 text-slate-600 hover:text-white hover:border-white/20'
              }`}
            >
              ← Anterior
            </button>

            <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">
              PASO {currentStep + 1}/{steps.length}
            </span>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={nextStep}
                className="px-4 py-3 bg-purple-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-600/20"
              >
                Siguiente →
              </button>
            ) : (
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:from-emerald-700 hover:to-green-700 transition-all active:scale-95 shadow-lg shadow-emerald-600/20 flex items-center gap-2"
              >
                🚀 Acceder al Portal
              </a>
            )}
          </div>
        </div>

        {/* Quick tips sidebar */}
        <div className="border-t border-white/5 bg-[#0d0d0d] px-8 py-6">
          <h4 className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-4">🎯 Resumen del Protocolo:</h4>
          <ol className="text-[8px] text-slate-400 space-y-2">
            <li>1. Acceder a <a href="https://aistudio.google.com/app/apikey" className="text-purple-400 underline hover:text-purple-300" target="_blank" rel="noopener noreferrer">aistudio.google.com/app/apikey</a></li>
            <li>2. Autenticar con cuenta Google</li>
            <li>3. Activar "Create API Key"</li>
            <li>4. Extraer clave "AIza..."</li>
            <li>5. Integrar en el sistema</li>
          </ol>
          
          <div className="mt-4 p-3 bg-emerald-600/5 border border-emerald-500/20 rounded-xl">
            <p className="text-[7px] text-emerald-400 font-black uppercase tracking-widest">
              <strong>✨ Costo:</strong> Acceso completamente gratuito con cuota para developers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};