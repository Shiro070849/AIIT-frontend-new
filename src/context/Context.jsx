import React, { createContext, useState, useEffect } from "react";
import runChat from "../config/gemini";

export const Context = createContext();

const API_URL = 'http://localhost:5000';
const MAX_HISTORY = 5;

function ContextProvider({ children }) {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [showPromptSets, setShowPromptSets] = useState(false);
    const [promptSets, setPromptSets] = useState([]);

    const BASE_PROMPT = `
        You are an IT support assistant. Please answer questions only related to information technology, including topics like software, hardware, networking, cybersecurity, troubleshooting, and IT best practices. Do not provide answers on unrelated topics. Stay focused on solving IT-related issues, explaining technical concepts, or giving advice on IT tools and systems.
        
        If the user asks a question that is not related to IT, politely inform them that you can only assist with IT-related queries.
        
        Please respond in the same language that the user uses (Thai or English).
    `;

    const saveToDatabase = async (prompt, response) => {
        try {
            await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, response })
            });
        } catch (error) {
            console.error('Error saving to database:', error);
        }
    };

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`${API_URL}/api/chat`);
            if (!response.ok) throw new Error('Failed to load chat history');
            return await response.json();
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    };

    // เพิ่มฟังก์ชันใหม่สำหรับโหลดประวัติการแชท
    const loadHistory = async () => {
        try {
            const history = await loadChatHistory();
            if (history.length > 0) {
                setPrevPrompts(history.map(chat => ({ 
                    input: chat.prompt, 
                    response: chat.response 
                })));
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setRecentPrompt("");
        setShowPromptSets(false);
        // โหลดประวัติการแชทใหม่แทนที่จะเคลียร์
        loadHistory();
    };

    const onSent = async (prompt) => {
        try {
            setResultData("");
            setLoading(true);
            setShowResult(true);
            setShowPromptSets(false);
            
            // รวมประวัติการสนทนา (จำกัดที่ MAX_HISTORY)
            const historyContext = prevPrompts.slice(-MAX_HISTORY)
                .map(p => `User: ${p.input}\nAssistant: ${p.response}`)
                .join("\n");
            
            const fullPrompt = `${BASE_PROMPT}\n\n${historyContext}\nUser: ${prompt}\nAssistant:`;
            
            // เรียกใช้ runChat
            const response = await runChat(fullPrompt);
            
            setResultData(response);
            setRecentPrompt(prompt);
            
            // เพิ่มในประวัติการสนทนา
            setPrevPrompts(prev => [...prev, { input: prompt, response }]);
            
            // บันทึกลงฐานข้อมูล
            await saveToDatabase(prompt, response);
            
        } catch (error) {
            console.error('Error in onSent:', error);
            setResultData("Sorry, there was an error processing your request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchChatHistory = async () => {
            const history = await loadChatHistory();
            if (history.length > 0) {
                setPrevPrompts(history.map(chat => ({ input: chat.prompt, response: chat.response })));
            }
        };
        fetchChatHistory();
    }, []);

    const contextValue = {
        prevPrompts,
        setPrevPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        showPromptSets,
        setShowPromptSets,
        promptSets
    };

    return (
        <Context.Provider value={contextValue}>
            {children}
        </Context.Provider>
    );
}

export default ContextProvider;