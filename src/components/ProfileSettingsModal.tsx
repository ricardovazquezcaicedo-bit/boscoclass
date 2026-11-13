import React, { useState, useRef } from 'react';
import {
  User,
  Lock,
  Mail,
  Building,
  Moon,
  Sun,
  Camera,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Phone,
  Shield,
  Key,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import { UserSession } from '../types';
import { ClassPointService } from '../services/classPointStorage';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  onUpdateSession: (updated: UserSession) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

const AVATAR_SEEDS = [
  'Ricardo',
  'Javier',
  'Claudia',
  'Sofia',
  'Andres',
  'Mateo',
  'Valentina',
  'Camila',
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  userSession,
  onUpdateSession,
  theme,
  onToggleTheme,
}) => {
  const currentUsername = userSession.username || userSession.email.split('@')[0];

  const [nombre, setNombre] = useState(userSession.name || '');
  const [username, setUsername] = useState(currentUsername);
  const [email, setEmail] = useState(userSession.email || '');
  const [institucion, setInstitucion] = useState(userSession.institutionName || 'Colegio San Juan Bosco');
  const [telefono, setTelefono] = useState('+57 310 000 0000');
  const [selectedAvatar, setSelectedAvatar] = useState(
    userSession.avatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userSession.name)}&backgroundColor=176b87`
  );

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Status
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('La imagen seleccionada supera los 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSelectedAvatar(reader.result);
        setSuccessMsg('¡Foto de perfil cargada! Guarda los cambios para aplicarla.');
        setErrorMsg(null);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error al procesar el archivo de imagen.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customPhotoUrl.trim()) return;
    setSelectedAvatar(customPhotoUrl.trim());
    setSuccessMsg('Enlace de foto aplicado. Recuerda guardar cambios.');
    setShowUrlInput(false);
    setCustomPhotoUrl('');
  };

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nombre.trim()) {
      setErrorMsg('El nombre completo no puede estar vacío.');
      return;
    }

    if (!username.trim()) {
      setErrorMsg('El nombre de usuario no puede estar vacío.');
      return;
    }

    const updates: any = {
      nombre: nombre.trim(),
      usuario: username.trim().toLowerCase(),
      email: email.trim(),
      institucion: institucion.trim(),
      avatar: selectedAvatar,
      telefono: telefono.trim(),
    };

    // If changing password
    if (showPasswordSection && (newPassword || currentPassword)) {
      if (!currentPassword) {
        setErrorMsg('Introduce tu contraseña actual para confirmar los cambios.');
        return;
      }
      if (newPassword.length < 4) {
        setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('Las contraseñas nuevas no coinciden.');
        return;
      }

      // Verify current password
      const auth = ClassPointService.authenticateUser(currentUsername, currentPassword);
      if (!auth) {
        setErrorMsg('La contraseña actual ingresada es incorrecta.');
        return;
      }

      updates.clave = newPassword.trim();
    }

    setIsSaving(true);
    const res = ClassPointService.updateUser(currentUsername, updates);

    if (!res.success) {
      setErrorMsg(res.message);
      setIsSaving(false);
      return;
    }

    // Build updated UserSession
    const updatedSession: UserSession = {
      ...userSession,
      name: nombre.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      institutionName: institucion.trim(),
      avatar: selectedAvatar,
    };

    localStorage.setItem('bosco_user_session', JSON.stringify(updatedSession));
    onUpdateSession(updatedSession);

    setSuccessMsg('¡Perfil y credenciales actualizados exitosamente!');
    setIsSaving(false);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white dark:bg-[#111c2a] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] text-slate-800 dark:text-slate-100 transition-colors">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#103d5b] via-[#176b87] to-[#124b68] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 grid place-items-center text-white shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Configuración de Perfil Escolar</h3>
              <p className="text-xs text-white/80">
                Personaliza tus datos, seguridad, avatar y preferencias
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content form */}
        <form onSubmit={handleSaveProfile} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Foto de Perfil / Avatar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Foto de Perfil Personal</span>
              </label>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Visible para profesores, directores y compañeros
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Profile Photo Preview */}
              <div className="relative group shrink-0">
                <img
                  src={selectedAvatar}
                  alt="Foto de perfil actual"
                  className="w-20 h-20 rounded-2xl border-3 border-emerald-500 shadow-md bg-white dark:bg-slate-800 object-cover"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-2xl bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-[10px] font-bold"
                  title="Cambiar foto"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  Cambiar
                </button>
              </div>

              {/* Upload actions */}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Subir Foto desde mi Dispositivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Enlace Web</span>
                  </button>
                </div>

                {showUrlInput && (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                    <input
                      type="url"
                      value={customPhotoUrl}
                      onChange={(e) => setCustomPhotoUrl(e.target.value)}
                      placeholder="https://ejemplo.com/mi-foto.jpg"
                      className="flex-1 p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCustomUrl}
                      className="px-3 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-500"
                    >
                      Aplicar
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Puedes subir cualquier foto tuya (PNG, JPG, WebP) o seleccionar una inicial institucional:
                </p>

                {/* Quick avatar presets fallback */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {AVATAR_SEEDS.map((seed) => {
                    const url = `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=176b87`;
                    return (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setSelectedAvatar(url)}
                        title={`Usar avatar de ${seed}`}
                        className={`w-7 h-7 rounded-lg overflow-hidden border transition-transform hover:scale-105 ${
                          selectedAvatar === url
                            ? 'border-emerald-500 ring-2 ring-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt={seed} className="w-full h-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Theme preference quick switch */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#182638] border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 text-indigo-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <div>
                <span className="font-bold block text-slate-800 dark:text-slate-200">
                  Tema Visual: {theme === 'dark' ? 'Modo Oscuro' : 'Modo Claro'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Adapta el contraste visual para el estudio nocturno o diurno
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
            >
              {theme === 'dark' ? 'Cambiar a Claro' : 'Cambiar a Oscuro'}
            </button>
          </div>

          {/* Basic Info Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182638] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Nombre de Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182638] text-slate-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182638] text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                Institución Educativa
              </label>
              <input
                type="text"
                value={institucion}
                onChange={(e) => setInstitucion(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#182638] text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Password Change Accordion */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="w-full py-2 flex items-center justify-between text-left font-bold text-[#176b87] dark:text-[#50c6b3] hover:underline"
            >
              <span className="flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>¿Deseas cambiar tu contraseña de acceso?</span>
              </span>
              <span>{showPasswordSection ? '▲ Ocultar' : '▼ Modificar'}</span>
            </button>

            {showPasswordSection && (
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#182638] border border-slate-200 dark:border-slate-700 space-y-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Escribe tu contraseña actual"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111c2a] text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111c2a] text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111c2a] text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-[#176b87] hover:bg-[#124b68] text-white font-black shadow-md flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
