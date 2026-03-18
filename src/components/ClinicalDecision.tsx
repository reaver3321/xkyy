import React, { useEffect, useState } from 'react';
import { CheckSquare, Check, Send, UserCheck, Clock } from 'lucide-react';
import type { DoctorTodo, PatientRecord, PatientTodo } from '../types/patient';
import { EvidenceText } from './EvidenceText';

export function ClinicalDecision({ patient }: { patient: PatientRecord }) {
  const [doctorTodos, setDoctorTodos] = useState<DoctorTodo[]>(patient.doctorTodos);
  const [patientTodos, setPatientTodos] = useState<PatientTodo[]>(patient.patientTodos);

  useEffect(() => {
    setDoctorTodos(patient.doctorTodos);
    setPatientTodos(patient.patientTodos);
  }, [patient]);

  const toggleDoctorTodo = (id: string) => {
    setDoctorTodos((todos) =>
      todos.map((todo) => {
        if (todo.id !== id) {
          return todo;
        }

        const isCompleted = !todo.completed;
        return {
          ...todo,
          completed: isCompleted,
          completedAt: isCompleted ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null,
          completedBy: isCompleted ? '当前医生' : null,
        };
      }),
    );
  };

  const pushPatientTodo = (id: string) => {
    setPatientTodos((todos) => todos.map((todo) => (todo.id === id ? { ...todo, pushed: true } : todo)));
  };

  return (
    <div className="space-y-6 lg:sticky lg:top-28">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center space-x-2">
          <CheckSquare className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-indigo-900">3.1 医生待办</h2>
        </div>
        <div className="p-2">
          {doctorTodos.map((todo) => (
            <div
              key={todo.id}
              className={`p-3 m-2 rounded-xl border transition-all ${
                todo.completed
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-sm'
              }`}
            >
              <label className="flex items-start space-x-3 cursor-pointer">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={todo.completed}
                    onChange={() => toggleDoctorTodo(todo.id)}
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-indigo-600 peer-checked:border-indigo-600 transition-colors"></div>
                  <Check
                    className={`absolute w-3.5 h-3.5 text-white pointer-events-none transition-opacity ${
                      todo.completed ? 'opacity-100' : 'opacity-0'
                    }`}
                    strokeWidth={3}
                  />
                </div>

                <div className="flex-1">
                  <EvidenceText basis={todo.basis} block className="text-sm font-medium text-slate-700">
                    <div className={todo.completed ? 'text-slate-400 line-through whitespace-pre-line' : 'whitespace-pre-line'}>
                      {todo.text}
                    </div>
                  </EvidenceText>

                  {todo.completed ? (
                    <div className="flex items-center space-x-2 mt-2 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md w-fit">
                      <UserCheck className="w-3 h-3" />
                      <span>{todo.completedBy} 已完成</span>
                      <Clock className="w-3 h-3 ml-1" />
                      <span>{todo.completedAt}</span>
                    </div>
                  ) : null}
                </div>
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-50/50 p-4 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Send className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-emerald-900">3.2 患者待办</h2>
          </div>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">悬停查看依据</span>
        </div>
        <div className="p-4 space-y-4">
          {patientTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-start justify-between gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1 pr-4">
                <div className="text-xs text-slate-500 mb-2">{todo.importanceText}</div>
                <EvidenceText basis={todo.basis} block className="text-sm font-medium text-slate-800">
                  <div className="whitespace-pre-line">{todo.text}</div>
                </EvidenceText>
              </div>

              <button
                type="button"
                onClick={() => pushPatientTodo(todo.id)}
                disabled={todo.pushed}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  todo.pushed
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-md active:scale-95'
                }`}
              >
                {todo.pushed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>已推送</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>一键推送</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
