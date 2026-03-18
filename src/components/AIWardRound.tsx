import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  FileText,
  Headphones,
  Pause,
  Play,
  SquareArrowOutUpRight,
  Stethoscope,
} from 'lucide-react';
import type { PatientRecord } from '../types/patient';
import { EvidenceText } from './EvidenceText';

function formatTime(totalSeconds: number) {
  const safeSeconds = Number.isFinite(totalSeconds) && totalSeconds > 0 ? Math.floor(totalSeconds) : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const SUMMARY_SEGMENT_SPLIT_REGEX = /([\uFF0C\u3002\uFF1B\uFF01\uFF1F])/;
const IMPORTANT_SUMMARY_SEGMENT_REGEX =
  /(?:\u26A0|\u9700|\u9700\u8981|\u5EFA\u8BAE|\u8BA1\u5212|\u7EE7\u7EED|\u590D\u67E5|\u51FA\u9662|\u89C2\u5BDF|\u76D1\u6D4B|\u6CBB\u7597|\u68C0\u67E5|\u5F02\u5E38|\u504F\u9AD8|\u504F\u4F4E|\u660E\u663E|\u98CE\u9669|\u654F\u611F|\u672F\u540E|\u6062\u590D|\u4F24\u53E3|\u8840\u538B|\u8840\u7CD6|\u8840\u8102|\u5FC3\u7535\u56FE|\u7F3A\u8840|\u80F8\u95F7|\u5934\u6655|\u7761\u7720|\u547C\u5438\u673A|\u8D85\u58F0|\u968F\u8BBF|\u670D\u836F|\u836F\u7269|\u6709\u9650|\u4E0D\u8FDE\u8D2F)/;

function collectSummaryTerms(patient: PatientRecord) {
  const candidates = [
    ...patient.entities.map((entity) => entity.term),
    ...patient.risks.flatMap((risk) => [risk.type, risk.description]),
    ...patient.healthRecord.diagnosis.flatMap((item) => [item.label, item.value]),
    ...patient.healthRecord.indicators.flatMap((item) => [item.name, item.value]),
    ...patient.healthRecord.treatments.flatMap((item) => [item.label, item.value]),
    ...patient.doctorTodos.map((todo) => todo.text),
    ...patient.patientTodos.map((todo) => todo.text),
    ...patient.tags,
  ];

  return [...new Set(candidates)]
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && term.length < patient.summary.length && patient.summary.includes(term))
    .sort((left, right) => right.length - left.length);
}

function renderHighlightedText(text: string, terms: string[], keyPrefix: string) {
  if (terms.length === 0) {
    return text;
  }

  const uniqueTerms = [...new Set(terms.filter((term) => text.includes(term)))];
  if (uniqueTerms.length === 0) {
    return text;
  }

  const regex = new RegExp(`(${uniqueTerms.map((term) => escapeRegExp(term)).join('|')})`, 'g');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (uniqueTerms.includes(part)) {
      return (
        <strong key={`${keyPrefix}-${part}-${index}`} className="font-bold text-slate-900">
          {part}
        </strong>
      );
    }

    return <React.Fragment key={`${keyPrefix}-${part}-${index}`}>{part}</React.Fragment>;
  });
}

function renderHighlightedSummary(patient: PatientRecord) {
  const summaryTerms = collectSummaryTerms(patient);
  const segments = patient.summary.split(SUMMARY_SEGMENT_SPLIT_REGEX);

  return segments.map((segment, index) => {
    if (!segment) {
      return null;
    }

    if (SUMMARY_SEGMENT_SPLIT_REGEX.test(segment)) {
      return <React.Fragment key={`summary-punctuation-${index}`}>{segment}</React.Fragment>;
    }

    const segmentTerms = summaryTerms.filter((term) => segment.includes(term));
    const isImportantSegment =
      IMPORTANT_SUMMARY_SEGMENT_REGEX.test(segment) || segmentTerms.length > 1;

    if (isImportantSegment) {
      return (
        <strong key={`summary-segment-${index}`} className="font-bold text-slate-900">
          {segment}
        </strong>
      );
    }

    return (
      <React.Fragment key={`summary-segment-${index}`}>
        {renderHighlightedText(segment, segmentTerms, `summary-segment-${index}`)}
      </React.Fragment>
    );
  });
}

export function AIWardRound({ patient }: { patient: PatientRecord }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(patient.audioDuration);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.load();
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(patient.audioDuration);
  }, [patient.audioDuration, patient.audioSrc, patient.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      setDuration(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : patient.audioDuration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [patient.audioDuration]);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
        return;
      }

      audio.pause();
      setIsPlaying(false);
    } catch {
      setIsPlaying(false);
    }
  };

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;
  const highlightedSummary = useMemo(() => renderHighlightedSummary(patient), [patient]);

  return (
    <div className="space-y-6">
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <audio ref={audioRef} src={patient.audioSrc} preload="metadata" />

        <div className="p-4 bg-slate-50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  void togglePlayback();
                }}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-colors shadow-sm"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
              </button>

              <div>
                <div className="text-sm font-medium text-slate-700">查房录音</div>
                <div className="text-xs text-slate-500">
                  播放进度：{formatTime(currentTime)} / {formatTime(duration || patient.audioDuration)}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
                <Headphones className="w-4 h-4 text-blue-500" />
                <span>PDF 记载时长：{patient.audioDurationText}</span>
              </div>

              <a
                href={patient.pdfSrc}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700 [&>span:last-of-type]:hidden"
              >
                <FileText className="w-4 h-4" />
                <span>{'\u67E5\u770B\u8BED\u97F3\u8F6CAI\u62A5\u544A'}</span>
                <span>查看 PDF 报告</span>
                <SquareArrowOutUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
        <div className="flex items-center space-x-2 mb-4">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-800">2.1 查房总结</h2>
        </div>
        <div className="text-lg leading-relaxed text-slate-700 whitespace-pre-line">{highlightedSummary}</div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>2.2 关键发现</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patient.entities.map((entity) => (
            <div key={`${patient.id}-${entity.term}`}>
              <EvidenceText basis={entity.basis} block className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="font-semibold text-slate-800 whitespace-pre-line">{entity.term}</div>
              </EvidenceText>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-blue-600" />
          <span>2.3 风险评估</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">风险类型</th>
                <th className="px-4 py-3">风险等级</th>
                <th className="px-4 py-3 rounded-tr-lg">说明</th>
              </tr>
            </thead>
            <tbody>
              {patient.risks.map((risk, index) => (
                <tr key={`${patient.id}-risk-${index}`} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-pre-line">{risk.type}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-pre-line">{risk.level}</td>
                  <td className="px-4 py-3 text-slate-700">
                    <EvidenceText basis={risk.basis} className="whitespace-pre-line">
                      {risk.description}
                    </EvidenceText>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center space-x-2">
          <FileText className="w-5 h-5 text-blue-600" />
          <span>4. 健康档案数据</span>
        </h2>

        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-indigo-400 mr-2"></span>
              4.1 诊疗信息
            </h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patient.healthRecord.diagnosis.map((item) => (
                <div key={`${patient.id}-${item.label}`} className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <dt className="text-xs text-slate-500 mb-1 whitespace-pre-line">{item.label}</dt>
                  <EvidenceText basis={item.basis} block className="text-sm font-medium text-slate-800">
                    <div className="whitespace-pre-line">{item.value}</div>
                  </EvidenceText>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
              4.2 临床指标
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {patient.healthRecord.indicators.map((item) => (
                <div
                  key={`${patient.id}-${item.name}`}
                  className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col items-center justify-center text-center"
                >
                  <Activity className="w-5 h-5 text-emerald-500 mb-2" />
                  <span className="text-xs text-slate-500 whitespace-pre-line">{item.name}</span>
                  <EvidenceText basis={item.basis} block className="text-lg font-bold text-slate-800 mt-1">
                    <div className="whitespace-pre-line">{item.value}</div>
                  </EvidenceText>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
              <span className="w-2 h-2 rounded-full bg-amber-400 mr-2"></span>
              4.3 用药信息
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-tl-lg">项目</th>
                    <th className="px-4 py-3 rounded-tr-lg">内容</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.healthRecord.treatments.map((item) => (
                    <tr key={`${patient.id}-${item.label}`} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-800 whitespace-pre-line">{item.label}</td>
                      <td className="px-4 py-3 text-slate-700">
                        <EvidenceText basis={item.basis} className="whitespace-pre-line">
                          {item.value}
                        </EvidenceText>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
