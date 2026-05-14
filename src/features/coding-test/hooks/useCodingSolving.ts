import { useState, useEffect } from 'react';
// 1. 서비스 파일명 소문자로 수정
import { getProblemDetail, runCode, submitCode } from '@/api/services/CodingTestService'; 
// 2. 타입 파일명과 타입 이름 수정 (CodingProblemDetailResponse -> CodingProblemDetail)
import type { 
    CodingProblemDetail, 
    CodingLanguage, 
    CodingCodeRunResponse, 
    CodingSubmissionResponse 
} from '../types/CodingProblemTypes';

export const useCodingSolving = (problemId: number) => {
    // 3. 타입 변경 적용
    const [problem, setProblem] = useState<CodingProblemDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedLanguage, setSelectedLanguage] = useState<CodingLanguage>('JAVA');
    const [sourceCode, setSourceCode] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);
    const [runResult, setRunResult] = useState<CodingCodeRunResponse | null>(null);
    const [submissionResult, setSubmissionResult] = useState<CodingSubmissionResponse | null>(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setIsLoading(true);
                const data = await getProblemDetail(problemId);
                setProblem(data);
                
                const starter = data.starterCodes?.find(s => s.language === selectedLanguage);
                if (starter) setSourceCode(starter.code);
            } catch (error) {
                console.error("Failed to fetch problem", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblem();
    // 4. 버그 수정: selectedLanguage 제거! (언어 바꿀 때마다 새로고침 되는 현상 방지)
    }, [problemId]); 

    const changeLanguage = (lang: CodingLanguage) => {
        setSelectedLanguage(lang);
        const starter = problem?.starterCodes?.find(s => s.language === lang);
        setSourceCode(starter ? starter.code : '');
    };

    const resetCode = () => {
        const starter = problem?.starterCodes?.find(s => s.language === selectedLanguage);
        setSourceCode(starter ? starter.code : '');
    };

    const handleRun = async (customInput?: string) => {
        setIsExecuting(true);
        try {
            const result = await runCode(problemId, { language: selectedLanguage, sourceCode, input: customInput });
            setRunResult(result);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSubmit = async () => {
        setIsExecuting(true);
        try {
            const result = await submitCode(problemId, { language: selectedLanguage, sourceCode });
            setSubmissionResult(result);
        } finally {
            setIsExecuting(false);
        }
    };

    return {
        problem, isLoading, selectedLanguage, changeLanguage, sourceCode, 
        setSourceCode, isExecuting, handleRun, handleSubmit, runResult, 
        submissionResult, resetCode
    };
};