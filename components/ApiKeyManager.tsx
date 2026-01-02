import React, { useState, useEffect } from 'react';
import { ApiKeyManager, ApiKeyInfo } from '../services/apiKeyManager';
import { ApiKeyTutorial } from './ApiKeyTutorial';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyAdded?: () => void;
}

export const ApiKeyManagerUI: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose, onKeyAdded }) => {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', key: '', priority: 5 });
  const [rotationStatus, setRotationStatus] = useState<string>('');
  const [quotaStatus, setQuotaStatus] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    if (isOpen) {
      loadKeys();
      loadQuotaStatus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Escuchar eventos de rotación
    const handleRotation = (event: CustomEvent) => {
      setRotationStatus(`Rotado a key: ${event.detail.keyName || 'desconocida'}`);
      setTimeout(() => setRotationStatus(''), 5000);
    };

    const handleRequireKey = (event: CustomEvent) => {
      setShowAddForm(true);
      setRotationStatus(event.detail.message);
    };

    window.addEventListener('apikey-rotated', handleRotation as EventListener);
    window.addEventListener('require-api-key', handleRequireKey as EventListener);

    return () => {
      window.removeEventListener('apikey-rotated', handleRotation as EventListener);
      window.removeEventListener('require-api-key', handleRequireKey as EventListener);
    };
  }, []);

  const loadKeys = async () => {
    const allKeys = ApiKeyManager.getAllKeys();
    setKeys(allKeys);
  };

  const loadQuotaStatus = async () => {
    const status: { [key: string]: any } = {};
    for (const key of keys) {
      status[key.id] = await ApiKeyManager.checkQuotaStatus(key.key);
    }
    setQuotaStatus(status);
  };

  const handleAddKey = async () => {
    if (!newKey.name || !newKey.key) {
      alert('Por favor completa todos los campos');
      return;
    }

    try {
      await ApiKeyManager.addKey({
        name: newKey.name,
        key: newKey.key,
        quotaLimit: 15000, // Default para free tier
        isActive: true,
        priority: newKey.priority
      });

      setNewKey({ name: '', key: '', priority: 5 });
      setShowAddForm(false);
      await loadKeys();
      onKeyAdded?.();
      
      setRotationStatus('✅ API Key añadida exitosamente');
      setTimeout(() => setRotationStatus(''), 3000);
    } catch (error) {
      alert('Error al añadir la API Key: ' + error);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta API Key?')) return;
    
    // Implementar delete en ApiKeyManager
    const updatedKeys = keys.filter(k => k.id !== keyId);
    // await ApiKeyManager.updateKeys(updatedKeys);
    setKeys(updatedKeys);
  };

  const getQuotaColor = (percentage: number) => {
    if (percentage < 50) return 'text-emerald-400';
    if (percentage < 80) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getQuotaBackground = (percentage: number) => {
    if (percentage < 50) return 'bg-emerald-400/80';
    if (percentage < 80) return 'bg-amber-400/80';
    return 'bg-rose-400/80';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-[#0d0d0d] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[3rem] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-10">
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto sm:hidden mt-4" />
        
        {/* Header */}
        <div className="px-8 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-600/10 border border-purple-500/20 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-purple-600/20 pulse-active">
                <span className="text-2xl">🔑</span>
              </div>
              <div>
                <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-purple-400">Core_KeyManager</h2>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sistema de Rotación de API Keys</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors text-[20px] font-black"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Status Messages */}
          {rotationStatus && (
            <div className="p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">
                {rotationStatus}
              </span>
            </div>
          )}

          {/* API Keys Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Core_Keys</h3>
                <p className="text-[7px] font-bold text-slate-600 uppercase tracking-widest">Gestiona tus claves de acceso neuronal</p>
              </div>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[#0d0d0d] border border-purple-500/20 rounded-2xl flex items-center gap-3 active:scale-95 transition-all active:bg-purple-600/5 active:border-purple-500/30 hover:border-purple-500/40"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-600/10 flex items-center justify-center">
                  <span className="text-purple-400 text-sm">+</span>
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-white">Añadir Key</span>
                  <span className="block text-[6px] font-bold text-slate-700 uppercase tracking-widest">Nuevo Acceso</span>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {keys.map((key) => {
                const status = quotaStatus[key.id];
                const usagePercentage = status ? status.percentageUsed : 0;
                const maskedKey = `${key.key.slice(0, 8)}...${key.key.slice(-4)}`;

                return (
                  <div key={key.id} className="bg-[#0d0d0d] border border-white/5 rounded-[2rem] p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-2">{key.name}</h4>
                        <p className="text-[8px] font-mono text-slate-500 mb-3">{maskedKey}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[6px] px-2 py-1 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-lg font-black uppercase tracking-widest">
                            Prioridad: {key.priority}
                          </span>
                          <span className={`text-[6px] px-2 py-1 border font-black uppercase tracking-widest rounded-lg ${
                            key.isActive 
                              ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' 
                              : 'bg-rose-600/10 border-rose-500/20 text-rose-400'
                          }`}>
                            {key.isActive ? 'ACTIVA' : 'INACTIVA'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteKey(key.id)}
                        className="text-slate-600 hover:text-rose-400 transition-colors text-[20px] font-black leading-none p-2"
                      >
                        ×
                      </button>
                    </div>

                    {status && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[7px] font-black uppercase tracking-widest text-slate-600">Uso de Cuota</span>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${getQuotaColor(usagePercentage)}`}>
                            {status.used.toLocaleString()} / {status.limit.toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${getQuotaBackground(usagePercentage)}`}
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[6px] text-slate-500">{usagePercentage.toFixed(1)}% utilizado</span>
                          <span className="text-[6px] text-slate-500">{status.remaining.toLocaleString()} restantes</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {keys.length === 0 && (
              <div className="bg-[#0d0d0d] border border-white/5 border-dashed rounded-[2.5rem] p-12 text-center space-y-8">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-purple-600/10 border border-purple-500/20 rounded-[2rem] mx-auto flex items-center justify-center shadow-lg shadow-purple-600/20">
                    <span className="text-4xl">🔑</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[14px] font-black uppercase tracking-[0.5em] text-white">Key_Required</h3>
                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest max-w-[300px] mx-auto leading-relaxed opacity-60">Inicializa una API Key para comenzar la síntesis neuronal</p>
                  </div>
                </div>
                
                <div className="bg-[#0d0d0d] border border-white/10 rounded-[1.5rem] p-6 max-w-sm mx-auto">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Core_Protocol</h4>
                  <p className="text-[8px] text-slate-600 leading-relaxed">
                    Una API Key es el enlace neural entre esta interfaz y los procesadores de Google. Permite el flujo de datos para la generación de sprites.
                  </p>
                </div>

                <div className="flex flex-col w-full max-w-[280px] gap-3 mx-auto">
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="p-6 bg-[#0d0d0d] border border-purple-500/20 rounded-[2.5rem] flex items-center gap-6 active:scale-95 transition-all active:bg-purple-600/5 active:border-purple-500/30"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center">
                      <span className="text-purple-400 text-xl">📚</span>
                    </div>
                    <div className="text-left">
                      <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-white">Tutorial_Neural</span>
                      <span className="block text-[8px] font-bold text-slate-700 uppercase tracking-widest">Guía Paso a Paso</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="p-6 bg-[#0d0d0d] border border-indigo-500/20 rounded-[2.5rem] flex items-center gap-6 active:scale-95 transition-all active:bg-indigo-600/5 active:border-indigo-500/30"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center">
                      <span className="text-indigo-400 text-xl">🚀</span>
                    </div>
                    <div className="text-left">
                      <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-white">Key_Genesis</span>
                      <span className="block text-[8px] font-bold text-slate-700 uppercase tracking-widest">Crear Nueva Key</span>
                    </div>
                  </button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                    • Duración: <span className="text-emerald-400">~2 minutos</span>
                  </p>
                  <p className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                    • Costo: <span className="text-emerald-400">GRATIS</span>
                  </p>
                  <p className="text-[7px] font-mono text-slate-600 uppercase tracking-widest">
                    • Tarjeta: <span className="text-emerald-400">NO REQUERIDA</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="border-t border-white/5 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-purple-600/5 border border-purple-500/20 p-4 rounded-[1.5rem]">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-purple-400 mb-3 flex items-center gap-2">
                  💡 Protocolo de Optimización
                </h4>
                <ul className="text-[7px] text-slate-400 space-y-1">
                  <li>• Genere 2-3 API Keys desde su cuenta neural</li>
                  <li>• El sistema rotará automáticamente cuando se agote una</li>
                  <li>• Cada key tiene ~15,000 tokens gratis por ciclo</li>
                  <li>• Los tokens se reinician cada 24 horas estándar</li>
                </ul>
              </div>
              
              <div className="bg-emerald-600/5 border border-emerald-500/20 p-4 rounded-[1.5rem]">
                <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-3 flex items-center gap-2">
                  🎯 Especificaciones del Token
                </h4>
                <p className="text-[7px] text-slate-400 mb-2 leading-relaxed">
                  Los tokens son unidades de procesamiento que consumen los modelos neuronales para generar sprites.
                </p>
                <p className="text-[6px] text-emerald-400 font-black uppercase tracking-widest">
                  Con 15,000 tokens ≈ 75-150 sprites por key por ciclo
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-[8px] space-y-1">
                <p>Keys activas: <span className="font-black text-purple-400">{ApiKeyManager.getActiveKeysCount()}</span></p>
                <p>Cuota restante: <span className="font-black text-emerald-400">{ApiKeyManager.getTotalRemainingQuota().toLocaleString()}</span> tokens</p>
                <p className="text-[6px] text-slate-500">
                  ≈ {Math.floor(ApiKeyManager.getTotalRemainingQuota() / 150)} sprites disponibles
                </p>
              </div>
              <button
                onClick={loadQuotaStatus}
                className="px-4 py-2 bg-[#0d0d0d] border border-white/10 rounded-xl text-[7px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:border-white/20 transition-all active:scale-95 flex items-center gap-2"
              >
                🔄 Actualizar Cuotas
              </button>
            </div>
          </div>
        </div>

        {/* Tutorial modal */}
        <ApiKeyTutorial
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
        />

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-2xl bg-[#0d0d0d] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[3rem] max-h-[90vh] overflow-y-auto">
              {/* Mobile drag handle */}
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto sm:hidden mt-4" />
              
              {/* Header */}
              <div className="px-8 pt-6 pb-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[12px] font-black uppercase tracking-[0.4em] text-purple-400">Key_Genesis</h3>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Inicializar Nueva Clave Neural</p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-slate-500 hover:text-white transition-colors text-[20px] font-black"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Tutorial Section */}
              <div className="px-8 pt-6">
                <div className="p-6 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 border border-purple-500/20 rounded-[1.5rem] space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-400 flex items-center gap-2">
                    🎯 Protocolo de Adquisición de Key
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">1</span>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white">Acceder al Portal Neural</p>
                        <p className="text-[7px] text-slate-400 mt-1">Navegue a: <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">aistudio.google.com/app/apikey</a></p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">2</span>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white">Autenticación Google</p>
                        <p className="text-[7px] text-slate-400 mt-1">Inicie sesión con su cuenta Gmail. Proceso completamente gratuito.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">3</span>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white">Generar Clave</p>
                        <p className="text-[7px] text-slate-400 mt-1">Localice y active el botón "Create API Key"</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">4</span>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white">Extracción de Datos</p>
                        <p className="text-[7px] text-slate-400 mt-1">Copie la clave completa que comienza con "AIza..."</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[8px] font-black">5</span>
                      <div>
                        <p className="text-[8px] font-black uppercase tracking-widest text-white">Integración</p>
                        <p className="text-[7px] text-slate-400 mt-1">Pegue la clave en el formulario inferior para activar el sistema.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-600/10 border border-amber-500/20 rounded-xl">
                    <p className="text-[7px] text-amber-400">
                      <strong>💡 Directriz:</strong> Cada cuenta puede generar hasta 5 keys. Multiplique su cuota diaria.
                    </p>
                  </div>

                  <div className="p-2 bg-emerald-600/10 border border-emerald-500/20 rounded-xl">
                    <p className="text-[7px] text-emerald-400">
                      <strong>✅ Costo:</strong> Acceso gratuito - Sin requerimientos de pago
                    </p>
                  </div>
                </div>

                {/* Quick Link */}
                <div className="mt-4 text-center">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-[1.5rem] hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg text-[9px] font-black uppercase tracking-widest"
                  >
                    🔗 Acceso Directo al Portal
                  </a>
                </div>
              </div>

              {/* Form */}
              <div className="px-8 py-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      Identificador de Clave
                    </label>
                    <input
                      type="text"
                      value={newKey.name}
                      onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/5 rounded-xl text-[9px] text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/30 focus:bg-purple-600/5 transition-all"
                      placeholder="Ej: Primary, Secondary, Neural_01"
                    />
                    <p className="text-[6px] text-slate-500 mt-1">
                      Designación única para identificación del sistema
                    </p>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      🗝️ Clave Neural de Google
                    </label>
                    <input
                      type="password"
                      value={newKey.key}
                      onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/5 rounded-xl text-[9px] text-white font-mono placeholder-slate-600 focus:outline-none focus:border-purple-500/30 focus:bg-purple-600/5 transition-all"
                      placeholder="AIzaSyC..."
                    />
                    <p className="text-[6px] text-slate-500 mt-1">
                      Inserte su clave de acceso del portal Google AI Studio
                    </p>
                    <div className="mt-2 p-2 bg-[#0d0d0d] border border-white/5 rounded-lg">
                      <p className="text-[6px] text-slate-500">
                        <strong>Verificación:</strong> Formato válido comienza con "AIza" y contiene ~39 caracteres
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">
                      ⭐ Prioridad del Sistema
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newKey.priority}
                      onChange={(e) => setNewKey({ ...newKey, priority: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 bg-[#0d0d0d] border border-white/5 rounded-xl text-[9px] text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/30 focus:bg-purple-600/5 transition-all"
                    />
                    <p className="text-[6px] text-slate-500 mt-1">
                      Prioridad alta = uso preferencial del sistema (10 = máxima)
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-4 text-[9px] font-black uppercase text-slate-600 hover:text-white transition-colors border border-white/5 rounded-xl active:scale-95"
                  >
                    Cancelar Proceso
                  </button>
                  <button
                    onClick={handleAddKey}
                    className="flex-[2] py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    ✅ Inicializar Key
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};