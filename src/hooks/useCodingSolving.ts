import { useEffect, useState } from 'react';
import { getProblemDetail, runCode, submitCode } from '@/api/services/CodingProblemService';
import type {
    CodingCodeRunResponse,
    CodingLanguage,
    CodingProblemDetailResponse,
    CodingSubmissionResponse,
} from '@/types/CodingProblemTypes';

const DEFAULT_LANGUAGE: CodingLanguage = 'JAVA';
const EMPTY_SOURCE_CODES: Partial<Record<CodingLanguage, string>> = {};

export const useCodingSolving = (problemId: number) => {
    const [problem, setProblem] = useState<CodingProblemDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedLanguage, setSelectedLanguage] = useState<CodingLanguage>(DEFAULT_LANGUAGE);
    const [sourceCodesByLanguage, setSourceCodesByLanguage] = useState<Partial<Record<CodingLanguage, string>>>(EMPTY_SOURCE_CODES);
    const [sourceCode, setSourceCode] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [runResult, setRunResult] = useState<CodingCodeRunResponse | null>(null);
    const [submissionResult, setSubmissionResult] = useState<CodingSubmissionResponse | null>(null);
    const [executionError, setExecutionError] = useState<string | null>(null);

    useEffect(() => {
        if (!problemId || Number.isNaN(problemId)) {
            setIsLoading(false);
            setError('유효하지 않은 문제입니다.');
            return;
        }

        let isMounted = true;

        const fetchProblem = async () => {
            setIsLoading(true);
            try {
                const data = await getProblemDetail(problemId);
                if (!isMounted) return;

                const initialLanguage = data.starterCodes.some((starter) => starter.language === DEFAULT_LANGUAGE)
                    ? DEFAULT_LANGUAGE
                    : data.starterCodes[0]?.language ?? DEFAULT_LANGUAGE;
                const starterCodeMap = Object.fromEntries(
                    data.starterCodes.map((starter) => [starter.language, starter.code])
                ) as Partial<Record<CodingLanguage, string>>;

                setProblem(data);
                setSelectedLanguage(initialLanguage);
                setSourceCodesByLanguage(starterCodeMap);
                setSourceCode(starterCodeMap[initialLanguage] ?? '');
                setError(null);
            } catch (err) {
                console.error('Failed to fetch coding problem:', err);
                if (!isMounted) return;
                setError('문제 정보를 불러오지 못했습니다.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchProblem();

        return () => {
            isMounted = false;
        };
    }, [problemId]);

    const updateSourceCode = (code: string) => {
        setSourceCode(code);
        setSourceCodesByLanguage((current) => ({
            ...current,
            [selectedLanguage]: code,
        }));
    };

    const changeLanguage = (lang: CodingLanguage) => {
        setSelectedLanguage(lang);
        setSourceCode(
            sourceCodesByLanguage[lang]
            ?? problem?.starterCodes.find((starter) => starter.language === lang)?.code
            ?? ''
        );
        setRunResult(null);
        setSubmissionResult(null);
        setExecutionError(null);
    };

    const resetCode = () => {
        const starterCode = problem?.starterCodes.find((starter) => starter.language === selectedLanguage)?.code ?? '';
        setSourceCode(starterCode);
        setSourceCodesByLanguage((current) => ({
            ...current,
            [selectedLanguage]: starterCode,
        }));
    };

    const handleRun = async (customInput?: string) => {
        setIsExecuting(true);
        setExecutionError(null);
        try {
            const sampleInput = problem?.sampleTestCases.find((testCase) => testCase.input.trim())?.input ?? '';
            const executionInput = customInput?.trim() ? customInput : sampleInput;
            const result = await runCode(problemId, {
                language: selectedLanguage,
                sourceCode,
                input: executionInput,
            });
            setRunResult(result);
            return result;
        } catch (err) {
            console.error('Failed to run coding problem:', err);
            setExecutionError('코드 실행에 실패했습니다.');
            return null;
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSubmit = async () => {
        setIsExecuting(true);
        setExecutionError(null);
        try {
            const result = await submitCode(problemId, { language: selectedLanguage, sourceCode });
            setSubmissionResult(result);
            return result;
        } catch (err) {
            console.error('Failed to submit coding problem:', err);
            setExecutionError('코드 제출에 실패했습니다.');
            return null;
        } finally {
            setIsExecuting(false);
        }
    };

    return {
        problem,
        isLoading,
        error,
        selectedLanguage,
        changeLanguage,
        sourceCode,
        setSourceCode: updateSourceCode,
        isExecuting,
        handleRun,
        handleSubmit,
        runResult,
        submissionResult,
        resetCode,
        executionError,
    };
};
