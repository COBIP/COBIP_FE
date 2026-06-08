'use client';

import { useMemo, useRef, type KeyboardEvent, type UIEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import type { CodingLanguage } from '@/types/CodingProblemTypes';

const SUPPORTED_LANGUAGES: CodingLanguage[] = ['JAVA', 'PYTHON', 'JAVASCRIPT'];
const INDENT = '    ';
const PAIRS: Record<string, string> = {
    '{': '}',
    '(': ')',
    '[': ']',
};
const CLOSERS = new Set(Object.values(PAIRS));
const OPENERS = new Set(Object.keys(PAIRS));

interface CodeEditorProps {
    selectedLanguage: CodingLanguage;
    changeLanguage: (lang: CodingLanguage) => void;
    sourceCode: string;
    setSourceCode: (code: string) => void;
    resetCode: () => void;
}

export default function CodeEditor({
    selectedLanguage,
    changeLanguage,
    sourceCode,
    setSourceCode,
    resetCode,
}: CodeEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const gutterRef = useRef<HTMLDivElement>(null);
    const lineNumbers = useMemo(
        () => Array.from({ length: Math.max(1, sourceCode.split('\n').length) }, (_, index) => index + 1),
        [sourceCode]
    );

    const updateCodeAndSelection = (nextCode: string, selectionStart: number, selectionEnd = selectionStart) => {
        setSourceCode(nextCode);
        window.requestAnimationFrame(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(selectionStart, selectionEnd);
        });
    };

    const insertText = (text: string, caretOffset = text.length) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const nextCode = sourceCode.slice(0, selectionStart) + text + sourceCode.slice(selectionEnd);
        updateCodeAndSelection(nextCode, selectionStart + caretOffset);
    };

    const indentSelection = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        if (selectionStart === selectionEnd) {
            insertText(INDENT);
            return;
        }

        const lineStart = sourceCode.lastIndexOf('\n', selectionStart - 1) + 1;
        const before = sourceCode.slice(0, lineStart);
        const selected = sourceCode.slice(lineStart, selectionEnd);
        const after = sourceCode.slice(selectionEnd);
        const indented = selected.replace(/^/gm, INDENT);
        updateCodeAndSelection(before + indented + after, selectionStart + INDENT.length, selectionEnd + (indented.length - selected.length));
    };

    const outdentSelection = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const lineStart = sourceCode.lastIndexOf('\n', selectionStart - 1) + 1;
        const before = sourceCode.slice(0, lineStart);
        const selected = sourceCode.slice(lineStart, selectionEnd);
        const after = sourceCode.slice(selectionEnd);
        let removedBeforeCursor = 0;
        let removedTotal = 0;

        const outdented = selected.replace(/^( {1,4}|\t)/gm, (match, _indent, offset) => {
            removedTotal += match.length;
            if (lineStart + offset < selectionStart) {
                removedBeforeCursor += match.length;
            }
            return '';
        });

        updateCodeAndSelection(
            before + outdented + after,
            Math.max(lineStart, selectionStart - removedBeforeCursor),
            Math.max(lineStart, selectionEnd - removedTotal)
        );
    };

    const insertSmartNewLine = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        const lineStart = sourceCode.lastIndexOf('\n', selectionStart - 1) + 1;
        const currentIndent = sourceCode.slice(lineStart, selectionStart).match(/^\s*/)?.[0] ?? '';
        const beforeCursor = sourceCode[selectionStart - 1];
        const afterCursor = sourceCode[selectionEnd];

        if (beforeCursor && PAIRS[beforeCursor] === afterCursor) {
            const inserted = `\n${currentIndent}${INDENT}\n${currentIndent}`;
            const nextCode = sourceCode.slice(0, selectionStart) + inserted + sourceCode.slice(selectionEnd);
            updateCodeAndSelection(nextCode, selectionStart + 1 + currentIndent.length + INDENT.length);
            return;
        }

        insertText(`\n${currentIndent}`);
    };

    const insertPair = (open: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const close = PAIRS[open];
        const { selectionStart, selectionEnd } = textarea;
        const selected = sourceCode.slice(selectionStart, selectionEnd);
        const inserted = `${open}${selected}${close}`;
        const caret = selected ? inserted.length : 1;
        insertText(inserted, caret);
    };

    const skipOrInsertCloser = (closer: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const { selectionStart, selectionEnd } = textarea;
        if (selectionStart === selectionEnd && sourceCode[selectionStart] === closer) {
            updateCodeAndSelection(sourceCode, selectionStart + 1);
            return;
        }
        insertText(closer);
    };

    const deleteIndentOrPair = () => {
        const textarea = textareaRef.current;
        if (!textarea) return false;

        const { selectionStart, selectionEnd } = textarea;
        if (selectionStart !== selectionEnd || selectionStart === 0) return false;

        const previousChar = sourceCode[selectionStart - 1];
        const nextChar = sourceCode[selectionStart];
        if (previousChar && PAIRS[previousChar] === nextChar) {
            const nextCode = sourceCode.slice(0, selectionStart - 1) + sourceCode.slice(selectionStart + 1);
            updateCodeAndSelection(nextCode, selectionStart - 1);
            return true;
        }

        const previousText = sourceCode.slice(Math.max(0, selectionStart - INDENT.length), selectionStart);
        if (previousText === INDENT) {
            const nextCode = sourceCode.slice(0, selectionStart - INDENT.length) + sourceCode.slice(selectionStart);
            updateCodeAndSelection(nextCode, selectionStart - INDENT.length);
            return true;
        }

        return false;
    };

    const insertSemicolonNearCloser = () => {
        const textarea = textareaRef.current;
        if (!textarea) return false;

        const { selectionStart, selectionEnd } = textarea;
        if (selectionStart !== selectionEnd || sourceCode[selectionStart] !== '}') return false;

        const nextCode = sourceCode.slice(0, selectionStart + 1) + ';' + sourceCode.slice(selectionStart + 1);
        updateCodeAndSelection(nextCode, selectionStart + 2);
        return true;
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            if (event.shiftKey) {
                outdentSelection();
            } else {
                indentSelection();
            }
            return;
        }

        if (event.key === 'Backspace' && deleteIndentOrPair()) {
            event.preventDefault();
            return;
        }

        if (event.key === 'Enter') {
            event.preventDefault();
            insertSmartNewLine();
            return;
        }

        if (OPENERS.has(event.key)) {
            event.preventDefault();
            insertPair(event.key);
            return;
        }

        if (CLOSERS.has(event.key)) {
            event.preventDefault();
            skipOrInsertCloser(event.key);
            return;
        }

        if (event.key === ';' && insertSemicolonNearCloser()) {
            event.preventDefault();
        }
    };

    const syncGutterScroll = (event: UIEvent<HTMLTextAreaElement>) => {
        if (gutterRef.current) {
            gutterRef.current.scrollTop = event.currentTarget.scrollTop;
        }
    };

    return (
        <div className="flex h-full flex-col bg-slate-950">
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">언어</span>
                    <select
                        value={selectedLanguage}
                        onChange={(event) => changeLanguage(event.target.value as CodingLanguage)}
                        className="h-8 rounded-md border border-slate-700 bg-slate-900 px-3 text-sm font-semibold text-slate-100 outline-none focus:border-violet-500"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                        ))}
                    </select>
                </div>
                <button
                    type="button"
                    onClick={resetCode}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
                >
                    <RotateCcw size={14} />
                    코드 초기화
                </button>
            </div>
            <div className="flex min-h-0 flex-grow overflow-hidden bg-[#0f172a]">
                <div
                    ref={gutterRef}
                    className="w-14 shrink-0 overflow-hidden border-r border-slate-800 bg-[#111827] py-4 pr-2 text-right font-mono text-sm leading-6 text-slate-500"
                >
                    {lineNumbers.map((lineNumber) => (
                        <div key={lineNumber} className="h-6 px-2">
                            {lineNumber}
                        </div>
                    ))}
                </div>
                <div className="min-h-0 flex-grow overflow-hidden bg-[#0f172a]">
                    <textarea
                        ref={textareaRef}
                        value={sourceCode}
                        onChange={(event) => setSourceCode(event.target.value)}
                        onKeyDown={handleKeyDown}
                        onScroll={syncGutterScroll}
                        className="h-full w-full resize-none overflow-auto bg-transparent p-4 font-mono text-sm leading-6 text-slate-100 caret-violet-300 outline-none selection:bg-violet-500/40"
                        style={{ tabSize: 4 }}
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
