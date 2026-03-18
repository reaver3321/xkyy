from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import pdfplumber
from pypdf import PdfReader


PDF_DIR = Path(r"C:\Users\zhu88\Desktop\胸科医院\心内科查房录音分析")
OUTPUT_PATH = Path(r"D:\trae_projects\xkyy\tmp\patient_pdf_data.json")


def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages)


def normalize_lines(text: str) -> list[str]:
    lines = [line.strip() for line in text.splitlines()]
    return [line for line in lines if line]


def match_group(pattern: str, text: str, default: str = "") -> str:
    match = re.search(pattern, text, re.S)
    return match.group(1).strip() if match else default


def parse_basic_info(text: str) -> dict[str, str]:
    line = match_group(r"(患者床位：.*?)(?:\n|$)", text)
    parts = [part.strip() for part in line.split("|")] if line else []
    result = {
        "bed": "",
        "round_time": "",
        "audio_duration_text": "",
    }
    for part in parts:
        if part.startswith("患者床位："):
            result["bed"] = part.replace("患者床位：", "", 1).strip()
        elif part.startswith("查房时间："):
            result["round_time"] = part.replace("查房时间：", "", 1).strip()
        elif part.startswith("录音时长："):
            result["audio_duration_text"] = part.replace("录音时长：", "", 1).strip()
    return result


def parse_summary(text: str) -> dict[str, str]:
    summary = match_group(r"2\.1 查房总结\s*(.*?)\s*依据：", text)
    basis = match_group(r"2\.1 查房总结.*?依据：(.*?)\s*2\.2 关键发现", text)
    return {"summary": summary, "summary_basis": basis}


def parse_simple_table(section_text: str, header_prefixes: tuple[str, ...]) -> list[dict[str, str]]:
    lines = normalize_lines(section_text)
    rows: list[dict[str, str]] = []
    current_title = ""
    current_basis: list[str] = []
    for line in lines:
        if any(line.startswith(prefix) for prefix in header_prefixes):
            continue
        if "：" in line and (
            line.startswith("医师：")
            or line.startswith("患者：")
            or line.startswith("AI")
            or line.startswith("录音")
            or line.startswith("未提及")
            or line.startswith("明日")
            or line.startswith("如")
            or line.startswith("按")
        ):
            if current_title:
                current_basis.append(line)
            continue
        if current_title:
            rows.append({"title": current_title, "basis": " ".join(current_basis).strip()})
            current_title = ""
            current_basis = []
        current_title = line
    if current_title:
        rows.append({"title": current_title, "basis": " ".join(current_basis).strip()})
    return rows


def parse_tags(text: str) -> list[str]:
    line = match_group(r"4\.4 患者标签\s*(.*?)\s*报告生成时间", text)
    return [part.strip() for part in line.split("|") if part.strip()]


def clean_cell(value: Any) -> str:
    if value is None:
        return ""
    return str(value).replace("\n", " ").strip()


def normalize_header_row(row: list[Any]) -> list[str]:
    return [clean_cell(cell).replace(" ", "") for cell in row]


def append_rows(target: list[dict[str, str]], rows: list[list[Any]], keys: list[str]) -> None:
    for row in rows:
        cleaned = [clean_cell(cell) for cell in row]
        if not any(cleaned):
            continue
        if len(cleaned) < len(keys):
            cleaned.extend([""] * (len(keys) - len(cleaned)))
        target.append({key: cleaned[index] for index, key in enumerate(keys)})


def extract_tables(pdf_path: Path) -> dict[str, list[dict[str, str]]]:
    result = {
        "key_findings": [],
        "risks": [],
        "doctor_todos": [],
        "patient_todos": [],
        "diagnosis": [],
        "indicators": [],
        "medications": [],
    }
    last_table_type: str | None = None
    diagnosis_seen = False

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                if not table:
                    continue
                header = normalize_header_row(table[0])
                rows = table[1:]

                if header == ["发现内容", "依据"]:
                    append_rows(result["key_findings"], rows, ["title", "basis"])
                    last_table_type = "key_findings"
                    continue

                if header == ["风险类型", "风险等级", "说明", "依据"]:
                    append_rows(result["risks"], rows, ["type", "level", "description", "basis"])
                    last_table_type = "risks"
                    continue

                if header == ["待办事项", "依据"]:
                    append_rows(result["doctor_todos"], rows, ["title", "basis"])
                    last_table_type = "doctor_todos"
                    continue

                if header == ["待办事项", "重要性", "依据"]:
                    append_rows(result["patient_todos"], rows, ["title", "importance", "basis"])
                    last_table_type = "patient_todos"
                    continue

                if header == ["项目", "内容", "依据"]:
                    if not diagnosis_seen:
                        append_rows(result["diagnosis"], rows, ["label", "value", "basis"])
                        diagnosis_seen = True
                        last_table_type = "diagnosis"
                    else:
                        append_rows(result["medications"], rows, ["label", "value", "basis"])
                        last_table_type = "medications"
                    continue

                if header == ["指标", "结果", "依据"]:
                    append_rows(result["indicators"], rows, ["name", "value", "basis"])
                    last_table_type = "indicators"
                    continue

                cleaned_rows = [[clean_cell(cell) for cell in row] for row in table]
                if last_table_type == "doctor_todos":
                    append_rows(result["doctor_todos"], cleaned_rows, ["title", "basis"])
                elif last_table_type == "patient_todos":
                    append_rows(result["patient_todos"], cleaned_rows, ["title", "importance", "basis"])
                elif last_table_type == "diagnosis":
                    append_rows(result["diagnosis"], cleaned_rows, ["label", "value", "basis"])
                elif last_table_type == "medications":
                    append_rows(result["medications"], cleaned_rows, ["label", "value", "basis"])

    return result


def build_patient_record(pdf_path: Path) -> dict[str, Any]:
    text = extract_text(pdf_path)
    basic_info = parse_basic_info(text)
    summary_info = parse_summary(text)
    table_data = extract_tables(pdf_path)
    return {
        "source_pdf": str(pdf_path),
        "pdf_name": pdf_path.name,
        "patient_title": match_group(r"^(.*?)\n", text),
        **basic_info,
        **summary_info,
        **table_data,
        "tags": parse_tags(text),
    }


def main() -> None:
    records = []
    for pdf_path in sorted(PDF_DIR.glob("*.pdf")):
        records.append(build_patient_record(pdf_path))

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(
        json.dumps(records, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} patient records to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
