import React from 'react';
import { motion } from 'motion/react';
import type { PatientRecord } from '../types/patient';

interface GlobalHeaderProps {
  patient: PatientRecord;
  isScrolled: boolean;
}

export function GlobalHeader({ patient, isScrolled }: GlobalHeaderProps) {
  const labelClassName = 'text-sm font-medium text-slate-500 whitespace-nowrap';
  const valueClassName = isScrolled ? 'text-sm' : 'text-base';
  const patientValueClassName = isScrolled ? 'text-base' : 'text-lg';
  const labels = {
    patient: '\u60a3\u8005\u4fe1\u606f',
    bed: '\u5e8a\u4f4d',
    roundTime: '\u67e5\u623f\u65f6\u95f4',
  };

  return (
    <motion.header
      className={`sticky top-0 z-30 border-b border-slate-200 bg-white transition-all duration-300 ${
        isScrolled ? 'py-2 shadow-md' : 'py-4 shadow-sm'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
    >
      <div className="flex flex-col gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 overflow-x-auto pb-1">
          <div className="flex min-w-fit items-center gap-2">
            <span className={labelClassName}>{labels.patient}</span>
            <span className={`font-bold text-slate-800 whitespace-nowrap ${patientValueClassName}`}>
              {patient.title}
            </span>
          </div>

          <div className="flex min-w-fit items-center gap-2">
            <span className={labelClassName}>{labels.bed}</span>
            <span className={`font-semibold text-slate-800 whitespace-nowrap ${valueClassName}`}>{patient.bed}</span>
          </div>

          <div className="flex min-w-fit items-center gap-2">
            <span className={labelClassName}>{labels.roundTime}</span>
            <span className={`font-semibold text-slate-800 whitespace-nowrap ${valueClassName}`}>
              {patient.roundTime}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {patient.tags.map((tag) => (
            <span
              key={tag}
              className="whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.header>
  );
}
