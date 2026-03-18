import rawPatientData from './patientPdfData.json';
import type {
  DiagnosisItem,
  DoctorTodo,
  EvidenceEntity,
  IndicatorItem,
  PatientRecord,
  PatientTodo,
  RiskItem,
  TreatmentItem,
} from '../types/patient';

interface RawItem {
  label?: string;
  value?: string;
  basis?: string;
  name?: string;
  title?: string;
  importance?: string;
  type?: string;
  level?: string;
  description?: string;
}

interface RawPatientRecord {
  patient_title: string;
  bed: string;
  round_time: string;
  audio_duration_text: string;
  summary: string;
  summary_basis: string;
  key_findings: RawItem[];
  risks: RawItem[];
  doctor_todos: RawItem[];
  patient_todos: RawItem[];
  diagnosis: RawItem[];
  indicators: RawItem[];
  medications: RawItem[];
  tags: string[];
}

function cleanPdfText(value: string | undefined) {
  return (value ?? '')
    .replace(/\*\*/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

function createBedSlug(bed: string) {
  const match = bed.match(/(\d+)楼(\d+)床/);
  if (!match) {
    return bed.replace(/\s+/g, '-');
  }

  return `${match[1]}-${match[2]}`;
}

function compareBeds(a: string, b: string) {
  const aMatch = a.match(/(\d+)楼(\d+)床/);
  const bMatch = b.match(/(\d+)楼(\d+)床/);
  if (!aMatch || !bMatch) {
    return a.localeCompare(b, 'zh-CN');
  }

  const [aFloor, aBed] = [Number.parseInt(aMatch[1], 10), Number.parseInt(aMatch[2], 10)];
  const [bFloor, bBed] = [Number.parseInt(bMatch[1], 10), Number.parseInt(bMatch[2], 10)];

  if (aFloor !== bFloor) {
    return aFloor - bFloor;
  }

  return aBed - bBed;
}

function parseRoundTime(value: string) {
  const normalized = cleanPdfText(value);
  const parsed = Date.parse(normalized.replace(' ', 'T'));
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function parseAudioDuration(value: string) {
  const match = cleanPdfText(value).match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function toEntities(items: RawItem[]): EvidenceEntity[] {
  return items
    .map((item) => ({
      term: cleanPdfText(item.title),
      basis: cleanPdfText(item.basis),
    }))
    .filter((item) => item.term && item.basis);
}

function toRisks(items: RawItem[]): RiskItem[] {
  return items
    .map((item) => ({
      type: cleanPdfText(item.type),
      level: cleanPdfText(item.level),
      description: cleanPdfText(item.description),
      basis: cleanPdfText(item.basis),
    }))
    .filter((item) => item.type || item.level || item.description);
}

function toDiagnosis(items: RawItem[]): DiagnosisItem[] {
  return items
    .map((item) => ({
      label: cleanPdfText(item.label),
      value: cleanPdfText(item.value),
      basis: cleanPdfText(item.basis),
    }))
    .filter((item) => item.label || item.value);
}

function toIndicators(items: RawItem[]): IndicatorItem[] {
  return items
    .map((item) => ({
      name: cleanPdfText(item.name),
      value: cleanPdfText(item.value),
      basis: cleanPdfText(item.basis),
    }))
    .filter((item) => item.name || item.value);
}

function toTreatments(items: RawItem[]): TreatmentItem[] {
  return items
    .map((item) => ({
      label: cleanPdfText(item.label),
      value: cleanPdfText(item.value),
      basis: cleanPdfText(item.basis),
    }))
    .filter((item) => item.label || item.value);
}

function toDoctorTodos(items: RawItem[], patientId: string): DoctorTodo[] {
  return items
    .map((item, index) => ({
      id: `${patientId}-doctor-${index + 1}`,
      text: cleanPdfText(item.title),
      basis: cleanPdfText(item.basis),
      completed: false,
    }))
    .filter((item) => item.text);
}

function toPatientTodos(items: RawItem[], patientId: string): PatientTodo[] {
  return items
    .map((item, index) => ({
      id: `${patientId}-patient-${index + 1}`,
      text: cleanPdfText(item.title),
      basis: cleanPdfText(item.basis),
      importanceText: cleanPdfText(item.importance),
      pushed: false,
    }))
    .filter((item) => item.text);
}

function toPatientRecord(record: RawPatientRecord): PatientRecord {
  const bed = cleanPdfText(record.bed);
  const bedSlug = createBedSlug(bed);
  const patientId = `patient-${bedSlug}`;

  return {
    id: patientId,
    title: cleanPdfText(record.patient_title) || bed,
    bed,
    roundTime: cleanPdfText(record.round_time),
    audioDuration: parseAudioDuration(record.audio_duration_text),
    audioDurationText: cleanPdfText(record.audio_duration_text),
    audioSrc: `/audio/${bedSlug}.mp3`,
    pdfSrc: `/reports/${bedSlug}.pdf`,
    tags: record.tags.map(cleanPdfText).filter(Boolean),
    summary: cleanPdfText(record.summary),
    summaryBasis: cleanPdfText(record.summary_basis),
    entities: toEntities(record.key_findings),
    risks: toRisks(record.risks),
    healthRecord: {
      diagnosis: toDiagnosis(record.diagnosis),
      indicators: toIndicators(record.indicators),
      treatments: toTreatments(record.medications),
    },
    doctorTodos: toDoctorTodos(record.doctor_todos, patientId),
    patientTodos: toPatientTodos(record.patient_todos, patientId),
  };
}

const rawRecords = rawPatientData as RawPatientRecord[];

export const patientsData: PatientRecord[] = rawRecords
  .map(toPatientRecord)
  .sort((left, right) => {
    const timeDiff = parseRoundTime(left.roundTime) - parseRoundTime(right.roundTime);
    if (timeDiff !== 0) {
      return timeDiff;
    }

    return compareBeds(left.bed, right.bed);
  });
