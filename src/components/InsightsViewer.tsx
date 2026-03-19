import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';

interface InsightsViewerProps {
  reportSrc: string;
}

const copy = {
  title: '\u603b\u7ed3\u4e0e\u6d1e\u5bdf',
  description:
    '\u67e5\u770b\u300a\u80f8\u79d1\u533b\u9662AI\u67e5\u623f\u62a5\u544a\u6d1e\u5bdf\u4e0e\u5efa\u8bae\u300b\uff0c\u4f7f\u7528\u6d4f\u89c8\u5668\u539f\u751f PDF \u9884\u89c8\u5668\u52a0\u8f7d\uff0c\u4ee5\u4fdd\u7559\u6587\u5185\u53ef\u70b9\u51fb\u94fe\u63a5\u3002',
  openExternal: '\u5728\u65b0\u7a97\u53e3\u6253\u5f00 PDF',
  linkHintTitle: '\u94fe\u63a5\u8bbf\u95ee',
  linkHintBody:
    '\u5f53\u524d\u89c6\u56fe\u4f18\u5148\u4f7f\u7528\u6d4f\u89c8\u5668\u539f\u751f PDF \u67e5\u770b\u5668\uff0cPDF \u5185\u7684\u8d85\u94fe\u63a5\u53ef\u76f4\u63a5\u70b9\u51fb\u3002\u5982\u679c\u4f60\u7684\u6d4f\u89c8\u5668\u9650\u5236\u5d4c\u5165\u89c6\u56fe\u4ea4\u4e92\uff0c\u53ef\u4ee5\u4f7f\u7528\u53f3\u4e0a\u89d2\u6309\u94ae\u5728\u65b0\u7a97\u53e3\u6253\u5f00\u3002',
  iframeTitle: '\u603b\u7ed3\u4e0e\u6d1e\u5bdf PDF',
};

export function InsightsViewer({ reportSrc }: InsightsViewerProps) {
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
                <FileText className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">{copy.title}</h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{copy.description}</p>
              </div>
            </div>

            <a
              href={reportSrc}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-300 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
              <span>{copy.openExternal}</span>
            </a>
          </div>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
            <span className="font-semibold">{copy.linkHintTitle}</span>
            <span className="ml-2">{copy.linkHintBody}</span>
          </div>
        </div>

        <div className="bg-slate-100 p-3">
          <iframe
            title={copy.iframeTitle}
            src={reportSrc}
            className="h-[78vh] min-h-[560px] w-full rounded-xl border border-slate-200 bg-white"
          />
        </div>
      </section>
    </div>
  );
}
