import React, { useState, useEffect } from 'react';
import {
  School,
  Building,
  Users,
  ShieldCheck,
  Plus,
  Coins,
  Settings,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Sliders,
  TrendingUp,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Key,
} from 'lucide-react';
import { SchoolEntity, ClassPointUser } from '../types';
import { ClassPointService } from '../services/classPointStorage';

interface CreatorMasterPanelProps {
  onOpenGrantModal: (student?: { usuario: string; nombre: string }) => void;
  onOpenBoscoIA: () => void;
}

export const CreatorMasterPanel: React.FC<CreatorMasterPanelProps> = ({
  onOpenGrantModal,
  onOpenBoscoIA,
}) => {
  const [schools, setSchools] = useState<SchoolEntity[]>([]);
  const [users, setUsers] = useState<ClassPointUser[]>([]);
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState<string | null>(null);

  // New School Form State
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCity, setNewSchoolCity] = useState('');
  const [newSchoolMotto, setNewSchoolMotto] = useState('');
  const [newSchoolColor, setNewSchoolColor] = useState('#176b87');
  const [newSchoolLimit, setNewSchoolLimit] = useState(500);
  const [newDirectorEmail, setNewDirectorEmail] = useState('');
  const [newDirectorName, setNewDirectorName] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadAll = () => {
    const loadedUsers = ClassPointService.getUsers();
    const loadedSchools = ClassPointService.getSchools();
    const students = loadedUsers.filter((u) => u.rol === 'estudiante');

    const enrichedSchools = loadedSchools.map((s) => ({
      ...s,
      estudiantesRegistrados: students.filter(
        (st) => st.institucion?.toLowerCase().trim() === s.nombre.toLowerCase().trim()
      ).length,
    }));

    setSchools(enrichedSchools);
    setUsers(loadedUsers);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleSchoolStatus = (id: string, currentStatus: boolean) => {
    ClassPointService.updateSchool(id, { activo: !currentStatus });
    loadAll();
    showToast(!currentStatus ? 'Escuela activada en la red' : 'Escuela pausada');
  };

  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName.trim()) return;

    const schoolId = newSchoolName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 15) || `school-${Date.now()}`;

    const newDirectorUser = newDirectorEmail
      ? newDirectorEmail.split('@')[0].toLowerCase()
      : `director.${schoolId}`;

    // Add school
    const newSchool: SchoolEntity = {
      id: schoolId,
      nombre: newSchoolName.trim(),
      ciudad: newSchoolCity.trim() || 'Colombia',
      lema: newSchoolMotto.trim() || 'Educación integral y excelencia',
      colorPrimario: newSchoolColor,
      logoUrl: '/assets/aistudio/image_c159dc3e.png',
      activo: true,
      directores: [newDirectorUser],
      limiteEstudiantes: newSchoolLimit,
      estudiantesRegistrados: 1,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      boscoIAConfig: {
        isLocked: false,
        lockedReason: 'Evaluación activa',
        giveCoinsForQuestions: true,
        coinsPerQuestion: 2,
        maxCoinsDaily: 20,
        socraticOnly: false,
        lockedAulas: [],
        lastUpdatedBy: 'Creador Original',
        updatedAt: Date.now(),
      },
    };

    ClassPointService.addSchool(newSchool);

    // If new director details provided, create user
    if (newDirectorEmail) {
      ClassPointService.addUser({
        usuario: newDirectorUser,
        clave: 'director2026',
        nombre: newDirectorName.trim() || `Director ${newSchoolName}`,
        rol: 'administrador',
        institucion: newSchoolName.trim(),
        email: newDirectorEmail.trim(),
      });
    }

    loadAll();
    setIsAddSchoolOpen(false);
    setNewSchoolName('');
    setNewSchoolCity('');
    setNewSchoolMotto('');
    setNewDirectorEmail('');
    setNewDirectorName('');
    showToast(`¡Escuela "${newSchool.nombre}" creada y lista para operar!`);
  };

  const totalRegisteredStudents = schools.reduce((acc, s) => acc + s.estudiantesRegistrados, 0);
  const totalCapacity = schools.reduce((acc, s) => acc + s.limiteEstudiantes, 0);
  const allDirectors = users.filter((u) => u.rol === 'administrador');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Creador Master Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0a2337] via-[#103d5b] to-[#176b87] text-white shadow-xl border-2 border-emerald-400/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Key className="w-64 h-64 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Acceso Exclusivo · Creador Original
              </span>
              <span className="text-xs text-white/70">
                Ricardo Vázquez Caicedo · ricardovazquezcaicedo@gmail.com
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Panel Maestro Multi-Escuela de BoscoClass
            </h2>
            <p className="text-xs text-white/80 max-w-2xl mt-1 leading-relaxed">
              Gestiona todas las escuelas e instituciones que operan bajo BoscoClass. Cada colegio cuenta con sus propios directores, docentes, aulas, límite de estudiantes y su configuración autónoma de <strong>BoscoIA</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenGrantModal()}
              className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Coins className="w-4 h-4 text-amber-950" />
              <span>Otorgar Boscoints</span>
            </button>
            <button
              type="button"
              onClick={() => setIsAddSchoolOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Registrar Nueva Escuela</span>
            </button>
          </div>
        </div>

        {/* Global Network Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold block">
              Escuelas Conectadas
            </span>
            <strong className="text-2xl font-black text-white">{schools.length}</strong>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold block">
              Directores Activos
            </span>
            <strong className="text-2xl font-black text-emerald-300">{allDirectors.length}</strong>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold block">
              Alumnos Registrados
            </span>
            <strong className="text-2xl font-black text-teal-300">
              {totalRegisteredStudents} / {totalCapacity}
            </strong>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs">
            <span className="text-[10px] uppercase tracking-wider text-white/70 font-bold block">
              BoscoIA IA Core
            </span>
            <strong className="text-2xl font-black text-amber-300">Global v2.4</strong>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* School Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-[#12344d] flex items-center gap-2">
              <Building className="w-5 h-5 text-[#176b87]" />
              <span>Escuelas e Instituciones Educativas ({schools.length})</span>
            </h3>
            <p className="text-xs text-slate-500">
              Administración centralizada de colegios y directores independientes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schools.map((school) => (
            <div
              key={school.id}
              className="p-5 rounded-3xl bg-white border border-[#cfe1e6] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#176b87] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-2xl p-1.5 bg-white border border-slate-200 shadow-xs grid place-items-center"
                    style={{ borderColor: school.colorPrimario }}
                  >
                    <img
                      src={school.logoUrl || '/assets/aistudio/image_c159dc3e.png'}
                      alt={school.nombre}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        school.activo
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {school.activo ? 'Operando' : 'Pausado'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleSchoolStatus(school.id, school.activo)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title={school.activo ? 'Pausar escuela' : 'Activar escuela'}
                    >
                      {school.activo ? (
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                      )}
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-extrabold text-[#12344d]">{school.nombre}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {school.ciudad}
                </p>
                <p className="text-[11px] text-slate-600 italic mt-2 line-clamp-2">
                  "{school.lema}"
                </p>

                {/* Progress bar of students limit */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">Alumnos activos:</span>
                    <strong className="text-[#12344d]">
                      {school.estudiantesRegistrados} / {school.limiteEstudiantes}
                    </strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          100,
                          (school.estudiantesRegistrados / school.limiteEstudiantes) * 100
                        )}%`,
                        backgroundColor: school.colorPrimario,
                      }}
                    />
                  </div>
                </div>

                {/* Directors in this school */}
                <div className="mt-3 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                    Directores Asignados:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {school.directores.length === 0 ? (
                      <span className="text-[10px] text-slate-400 italic">Sin director asignado</span>
                    ) : (
                      school.directores.map((dir, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          @{dir}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* School actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenGrantModal({ usuario: 'ana', nombre: `Alumnos de ${school.nombre}` })}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span>Otorgar BC</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    ClassPointService.updateSchool(school.id, {
                      limiteEstudiantes: school.limiteEstudiantes + 100,
                    });
                    loadAll();
                    showToast(`Límite aumentado a ${school.limiteEstudiantes + 100} estudiantes.`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  +100 Cupos
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Directory of School Directors */}
      <div className="p-6 rounded-3xl bg-white border border-[#cfe1e6] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-[#176b87]" />
            <div>
              <h3 className="text-base font-black text-[#12344d]">
                Directorio de Directores Institucionales
              </h3>
              <p className="text-xs text-slate-500">
                Cada colegio cuenta con sus propios directores autorizados para gestionar profesores y aulas.
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-700">
                <th className="p-3 rounded-l-xl">Director</th>
                <th className="p-3">Colegio / Escuela</th>
                <th className="p-3">Usuario</th>
                <th className="p-3">Correo Institucional</th>
                <th className="p-3 rounded-r-xl">Permisos</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allDirectors.map((d, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-[#12344d] flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#176b87] text-white font-bold grid place-items-center text-xs">
                      {d.nombre.charAt(0)}
                    </div>
                    <span>{d.nombre}</span>
                  </td>
                  <td className="p-3 text-slate-600 font-semibold">{d.institucion}</td>
                  <td className="p-3 font-mono text-slate-500">@{d.usuario}</td>
                  <td className="p-3 text-slate-500">{d.email}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-lg bg-teal-100 text-teal-800 font-black text-[10px]">
                      Director Autónomo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create School */}
      {isAddSchoolOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 bg-gradient-to-r from-[#103d5b] to-[#176b87] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black">Registrar Nueva Escuela en BoscoClass</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSchoolOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchool} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#12344d] mb-1">Nombre de la Escuela / Colegio</label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="Ej. Liceo Moderno San Agustín"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#12344d] mb-1">Ciudad y País</label>
                  <input
                    type="text"
                    value={newSchoolCity}
                    onChange={(e) => setNewSchoolCity(e.target.value)}
                    placeholder="Ej. Medellín, Colombia"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#12344d] mb-1">Límite de Estudiantes</label>
                  <input
                    type="number"
                    min={50}
                    max={5000}
                    value={newSchoolLimit}
                    onChange={(e) => setNewSchoolLimit(Number(e.target.value) || 500)}
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#12344d] mb-1">Lema o Filosofía Institucional</label>
                <input
                  type="text"
                  value={newSchoolMotto}
                  onChange={(e) => setNewSchoolMotto(e.target.value)}
                  placeholder="Ej. Ciencia, virtud y liderazgo para el mundo"
                  className="w-full p-2.5 rounded-xl border border-slate-300"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="font-bold text-[#12344d] block">
                  Asignar Director Inicial de la Escuela:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newDirectorName}
                    onChange={(e) => setNewDirectorName(e.target.value)}
                    placeholder="Nombre del Director(a)"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                  <input
                    type="email"
                    value={newDirectorEmail}
                    onChange={(e) => setNewDirectorEmail(e.target.value)}
                    placeholder="director@escuela.edu.co"
                    className="w-full p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  La contraseña inicial por defecto para el nuevo director será: <code>director2026</code>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddSchoolOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#176b87] hover:bg-[#124b68] text-white font-black shadow-sm"
                >
                  Guardar y Activar Escuela
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
