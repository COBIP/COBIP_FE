import { useState, useEffect } from 'react';
import { getProblemDetail, runCode, submitCode } from '@/api/services/CodingTestService';
import type { 
    CodingProblemDetail, 
    CodingLanguage, 
    CodingCodeRunResponse, 
    CodingSubmissionResponse 
} from '@/features/coding-test/types/CodingProblemTypes';

export const useCodingTest = (problemId: number) => {
    const [problem, setProblem] = useState<CodingProblemDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const [selectedLanguage, setSelectedLanguage] = useState<CodingLanguage>('JAVA');
    const [sourceCode, setSourceCode] = useState('');
    
    const [isExecuting, setIsExecuting] = useState(false);
    const [runResult, setRunResult] = useState<CodingCodeRunResponse | null>(null);
    const [submissionResult, setSubmissionResult] = useState<CodingSubmissionResponse | null>(null);

    useEffect(() => {
        const fetchProblem = async () => {
            if (!problemId) return;

            try {
                setIsLoading(true);
                const data = await getProblemDetail(problemId);
                setProblem(data);
                
                const starter = data.starterCodes?.find(s => s.language === selectedLanguage);
                if (starter) {
                    setSourceCode(starter.code);
                }
            } catch (error) {
                console.error("Failed to fetch problem", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProblem();
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
            const result = await runCode(problemId, { 
                language: selectedLanguage, 
                sourceCode, 
                input: customInput 
            });
            setRunResult(result);
        } catch (error) {
            console.error("Failed to run code", error);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSubmit = async () => {
        setIsExecuting(true);
        try {
            const result = await submitCode(problemId, { 
                language: selectedLanguage, 
                sourceCode 
            });
            setSubmissionResult(result);
        } catch (error) {
            console.error("Failed to submit code", error);
        } finally {
            setIsExecuting(false);
        }
    };

    return {
        problem, 
        isLoading, 
        selectedLanguage, 
        changeLanguage, 
        sourceCode, 
        setSourceCode, 
        isExecuting, 
        handleRun, 
        handleSubmit, 
        runResult, 
        submissionResult, 
        resetCode
    };
};