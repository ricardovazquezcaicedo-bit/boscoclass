import React, { useState, useEffect, useMemo } from 'react';
import {
  Coins,
  X,
  Sparkles,
  CheckCircle2,
  Award,
  User,
  ShieldAlert,
  Clock,
  Building,
} from 'lucide-react';
import { BoscointGrantLog, ClassPointUser } from '../types';
import { ClassPointService } from '../services/classPointStorage';

interface GrantBoscointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: 'profesor' | 'administrador' | 'creadorOriginal';
  currentUserName: string;
  currentUserInstitution: string;
  preselectedStudent?: { usuario: string; nombre: string; institucion?: string } | null;
  onGrantSuccess?: () => void;
}

export const GrantBoscointsModal: React.FC<GrantBoscointsModalProps> = ({
  isOpen,
  onClose,
  currentUserRole,
  currentUserName,
  currentUserInstitution,
  preselectedStudent,
  onGrantSuccess,
}) => {
  // Load registered students with their respective institution
  const [students, setStudents] = useState<ClassPointUser[]>([]);
  const [selectedStudentUser, setSelectedStudentUser] = useState<string>('ana');
  const [customStudentName, setCustomStudentName] = useState<string>('');
  const [amount, setAmount] = useState<number>(25);
  const [reason, setReason] = useState<string>('Participación ejemplar y razonamiento socrático');
  const [customReason, setCustomReason] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [grantLogs, setGrantLogs] = useState<BoscointGrantLog[]>([]);

  const presetReasons = [
    'Participación ejemplar y razonamiento socrático',
    'Resolución impecable de taller con procedimientos',
    'Liderazgo y colaboración salesiana con sus compañeros',
    'Excelente desempeño en consultas avanzadas de BoscoIA',
    'Compromiso, puntualidad y superación académica',
  ];

  // Load students & audit logs when opening
  useEffect(() => {
    if (isOpen) {
      const allUsers = ClassPointService.getUsers();
      const studentList = allUsers.filter((u) => u.rol === 'estudiante');
      
      // Ensure default fallback students exist
      if (!studentList.some((s) => s.usuario === 'ana')) {
        studentList.unshift({
          usuario: 'ana',
          clave: '1234',
          nombre: 'Ana García',
          rol: 'estudiante',
          institucion: 'Colegio San Juan Bosco',
          email: 'ana.garcia@salesianos.edu.co',
          grado: 'Grado 9° · Aula 101',
        });
      }
      if (!studentList.some((s) => s.usuario === 'luis')) {
        studentList.push({
          usuario: 'luis',
          clave: '1234',
          nombre: 'Luis Pérez',
          rol: 'estudiante',
          institucion: 'Colegio San Juan Bosco',
          email: 'luis.perez@salesianos.edu.co',
          grado: 'Grado 9° · Aula 101',
        });
      }
      if (!studentList.some((s) => s.usuario === 'mateo.gomez')) {
        studentList.push({
          usuario: 'mateo.gomez',
          clave: '1234',
          nombre: 'Mateo Gómez',
          rol: 'estudiante',
          institucion: 'Colegio Mayor de Los Andes',
          email: 'mateo.gomez@colegiomayor.edu.co',
          grado: 'Grado 11° · Aula 301',
        });
      }

      setStudents(studentList);
      setGrantLogs(ClassPointService.getBoscointGrants());

      if (preselectedStudent) {
        setSelectedStudentUser(preselectedStudent.usuario);
        setCustomStudentName(preselectedStudent.nombre);
      } else if (studentList.length > 0 && !selectedStudentUser) {
        setSelectedStudentUser(studentList[0].usuario);
        setCustomStudentName(studentList[0].nombre);
      }
    }
  }, [isOpen, preselectedStudent]);

  const activeSelectedStudent = useMemo(() => {
    return students.find((s) => s.usuario === selectedStudentUser);
  }, [students, selectedStudentUser]);

  if (!isOpen) return null;

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    let targetUser = selectedStudentUser;
    let targetName = customStudentName;
    const targetInstitution =
      activeSelectedStudent?.institucion ||
      preselectedStudent?.institucion ||
      'Colegio San Juan Bosco';

    if (!targetName) {
      targetName = activeSelectedStudent ? activeSelectedStudent.nombre : targetUser;
    }

    const finalReason = customReason.trim() || reason;

    const ok = ClassPointService.grantBoscoints(
      targetUser,
      targetName,
      amount,
      currentUserName,
      currentUserRole,
      finalReason,
      targetInstitution
    );

    if (ok) {
      setSuccessToast(
        `¡Se otorgaron +${amount} Boscoints a ${targetName} (${targetInstitution})!`
      );
      setGrantLogs(ClassPointService.getBoscointGrants());
      if (onGrantSuccess) onGrantSuccess();
      setTimeout(() => {
        setSuccessToast(null);
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-rose-200 flex flex-col">
        {/* Header with Salesian Red & Amber Logo Palette */}
        <div className="p-5 bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#dc2626] text-white rounded-t-3xl flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 grid place-items-center shadow-md font-black">
              <Coins className="w-5 h-5 text-amber-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">Otorgar Boscoints</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase">
                  BC
                </span>
              </div>
              <p className="text-xs text-amber-100/90 font-medium">
                {currentUserRole === 'creadorOriginal'
                  ? 'Creador Original · Concesión Maestra Multi-Institucional'
                  : currentUserRole === 'administrador'
                  ? 'Director · Concesión Institucional'
                  : 'Docente · Reconocimiento Pedagógico'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational banner */}
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-extrabold">Reglamento de Boscoints:</strong> Los profesores, directores y el creador original únicamente pueden <strong>otorgar</strong> coints a los estudiantes con mérito académico. Los coints son de uso exclusivo para los alumnos en la tienda escolar.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleGrant} className="p-5 space-y-4 flex-1">
          {successToast && (
            <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-300" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Student Selector with clearly labeled School/Institution */}
          <div>
            <label className="block text-xs font-bold text-[#1c1917] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-red-700" />
                <span>Estudiante Destinatario y su Institución Educativa</span>
              </span>
              <span className="text-[11px] text-red-700 font-bold">🏫 Con Institución</span>
            </label>
            <select
              value={selectedStudentUser}
              onChange={(e) => {
                setSelectedStudentUser(e.target.value);
                const found = students.find((s) => s.usuario === e.target.value);
                if (found) setCustomStudentName(found.nombre);
              }}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              {students.map((st) => (
                <option key={st.usuario} value={st.usuario}>
                  {st.nombre} (@{st.usuario}) — 🏫 {st.institucion || 'Colegio San Juan Bosco'}
                </option>
              ))}
            </select>

            {/* Selected student badge showing institution */}
            {activeSelectedStudent && (
              <div className="mt-2 p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-red-600 text-white grid place-items-center text-[10px] font-bold">
                    👨‍🎓
                  </div>
                  <div>
                    <span className="font-extrabold text-[#7f1d1d] block">
                      {activeSelectedStudent.nombre}
                    </span>
                    <span className="text-[11px] text-slate-600 flex items-center gap-1 font-medium">
                      <Building className="w-3 h-3 text-red-700" />
                      <strong>Institución:</strong> {activeSelectedStudent.institucion || 'Colegio San Juan Bosco'}
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-black text-[10px]">
                  {activeSelectedStudent.grado || 'Estudiante'}
                </span>
              </div>
            )}
          </div>

            {/* Coins Amount Selector */}
          <div>
            <label className="block text-xs font-bold text-[#1c1917] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Cantidad de Boscoints a Otorgar</span>
              </span>
              <span className="text-red-700 font-black text-sm">+{amount} BC</span>
            </label>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2 mb-2">
              {[10, 25, 50, 100].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
                    amount === val
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-sm border border-red-700'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  +{val} BC
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">O cantidad libre:</span>
              <input
                type="number"
                min={1}
                max={1000}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value) || 1))}
                className="w-24 p-2 text-xs rounded-xl border border-slate-300 text-center font-bold focus:ring-2 focus:ring-red-600 outline-none"
              />
              <span className="text-xs font-bold text-amber-700">Boscoints</span>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-[#1c1917] mb-1.5 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Motivo o Mérito Académico</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white mb-2 focus:ring-2 focus:ring-red-600 outline-none"
            >
              {presetReasons.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="O escribe un motivo personalizado..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-red-600 outline-none"
            />
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Confirmar y Acreditar +{amount} Boscoints</span>
          </button>
        </form>

        {/* Audit Log Table with School/Institution */}
        <div className="p-5 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-black text-[#1c1917] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-red-700" />
              <span>Registro de Otorgamientos (Con Institución)</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">Auditoría en tiempo real</span>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-1.5 text-xs">
            {grantLogs.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic text-center py-2">
                Aún no hay registros de monedas otorgadas en esta sesión.
              </p>
            ) : (
              grantLogs.slice(0, 8).map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#1c1917] truncate">{log.toNombre}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-50 text-rose-800 font-semibold border border-rose-200">
                        🏫 {log.institucion || 'Colegio San Juan Bosco'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 truncate block mt-0.5">
                      {log.reason} · Por {log.grantedBy} ({log.grantedByRol})
                    </span>
                  </div>
                  <span className="px-2 py-1 rounded-lg font-black text-[11px] bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shrink-0 shadow-xs">
                    +{log.amount} BC
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
