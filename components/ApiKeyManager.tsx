import React, { useState, useEffect } from 'react';
import { ApiKeyManager, ApiKeyInfo } from '../services/apiKeyManager';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyAdded?: () => void;
}

export const ApiKeyManagerUI: React.FC<ApiKeyManagerProps> = ({ isOpen, onClose, onKeyAdded }) => {
  const [keys, setKeys] = useState<ApiKeyInfo[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQuotaBackground = (percentage: number) => {
    if (percentage < 50) return 'bg-green-100';
    if (percentage < 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestión de API Keys</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {rotationStatus && (
          <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg text-blue-800">
            {rotationStatus}
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-700">API Keys Activas</h3>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Añadir Key
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keys.map((key) => {
              const status = quotaStatus[key.id];
              const usagePercentage = status ? status.percentageUsed : 0;
              const maskedKey = `${key.key.slice(0, 8)}...${key.key.slice(-4)}`;

              return (
                <div key={key.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-800">{key.name}</h4>
                      <p className="text-sm text-gray-600 font-mono">{maskedKey}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          Prioridad: {key.priority}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {key.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>

                  {status && (
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Uso de cuota</span>
                        <span className={getQuotaColor(usagePercentage)}>
                          {status.used.toLocaleString()} / {status.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getQuotaBackground(usagePercentage)}`}
                          style={{ width: `${usagePercentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{usagePercentage.toFixed(1)}% usado</span>
                        <span>{status.remaining.toLocaleString()} restantes</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {keys.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No hay API keys configuradas</p>
              <p className="text-sm mt-2">Añade tu primera API Key de Google Gemini para comenzar</p>
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Keys activas: <span className="font-semibold">{ApiKeyManager.getActiveKeysCount()}</span></p>
              <p>Cuota total restante: <span className="font-semibold">{ApiKeyManager.getTotalRemainingQuota().toLocaleString()}</span> tokens</p>
            </div>
            <button
              onClick={loadQuotaStatus}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Actualizar Cuotas
            </button>
          </div>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Añadir Nueva API Key</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre descriptivo
                  </label>
                  <input
                    type="text"
                    value={newKey.name}
                    onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Principal, Secundaria, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key de Google Gemini
                  </label>
                  <input
                    type="password"
                    value={newKey.key}
                    onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="AIza..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Obtén tu API Key gratuita en{' '}
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:underline">
                      Google AI Studio
                    </a>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridad (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newKey.priority}
                    onChange={(e) => setNewKey({ ...newKey, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Más alto = mayor prioridad de uso
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddKey}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Añadir Key
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};