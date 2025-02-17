import React, { useContext, useState, useEffect } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';

const Main = ({ showPromptSets }) => {
    const { 
        onSent, 
        recentPrompt, 
        showResult, 
        loading, 
        resultData, 
        setInput, 
        input, 
        setRecentPrompt 
    } = useContext(Context);
    
    const [selectedPrompt, setSelectedPrompt] = useState('');
    const [promptSets, setPromptSets] = useState([]);

    useEffect(() => {
        const fetchPrompts = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/prompts');
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setPromptSets(data);
            } catch (error) {
                console.error('Error fetching prompts:', error);
            }
        };

        if (showPromptSets) fetchPrompts();
    }, [showPromptSets]);

    const handleCardClick = (prompt) => {
        setSelectedPrompt(prompt);
        setInput(prompt);
        setRecentPrompt(prompt);
    };

    // เพิ่มฟังก์ชันสำหรับส่งข้อความไปบันทึกใน userprompt
    const saveUserPrompt = async (text) => {
      try {
        const response = await fetch('http://localhost:5000/api/userprompt', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });
        if (!response.ok) throw new Error('Network response was not ok');
      } catch (error) {
        console.error('Error saving user prompt:', error);
      }
    };

    const handleSend = () => {
        if (input.trim()) {
            onSent(input);
            saveUserPrompt(input); // เรียกใช้ saveUserPrompt
            setSelectedPrompt('');
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatResponse = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\`\`\`(.*?)\`\`\`/gs, '<pre><code>$1</code></pre>')
            .replace(/\n\n/g, '<br/><br/>')
            .replace(/\n/g, '<br/>');
    };

    return (
        <div className='main'>
            <div className="nav">
                <p>AIIT CHATBOT</p>
                <img src={assets.user_icon} alt="User" />
            </div>

            <div className="main-container">
                {!showResult ? (
                    <>
                        {!showPromptSets && (
                            <div className="greet">
                                <p><span>Hello all IT people.</span></p>
                                <p>How can I help you today?</p>
                            </div>
                        )}
                        {showPromptSets && (
                            <div className="categories-container">
                                {promptSets.map((set, index) => (
                                    <div key={index} className="category">
                                        <h3>{set.category}</h3>
                                        <div className="cards">
                                            {set.prompts.map((prompt, pIndex) => (
                                                <div 
                                                    className="card" 
                                                    key={`${index}-${pIndex}`}
                                                    onClick={() => handleCardClick(prompt.text)}
                                                >
                                                    <p>{prompt.text}</p>
                                                    <img src={assets[prompt.icon]} alt="" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    <div className='result'>
                        <div className="result-title">
                            <img src={assets.user_icon} alt="" />
                            <p>{recentPrompt}</p>
                        </div>
                        <div className="result-data">
                            <img src={assets.gemini_icon} alt="" />
                            {loading ? (
                                <div className='loader'>
                                    <hr />
                                    <hr />
                                    <hr />
                                </div>
                            ) : (
                                <p dangerouslySetInnerHTML={{ __html: formatResponse(resultData) }}></p>
                            )}
                        </div>
                    </div>
                )}

                <div className="main-bottom">
                    <div className="search-box">
                        <input
                            type="text"
                            value={selectedPrompt || input}
                            onChange={(e) => {
                                setInput(e.target.value);
                                setSelectedPrompt('');
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder='พิมพ์คำถามเกี่ยวกับ IT ที่นี่...'
                            aria-label="Search input"
                        />
                        <div>
                            {input && (
                                <img 
                                    src={assets.send_icon} 
                                    alt="Send" 
                                    onClick={handleSend}
                                    title="Send message"
                                />
                            )}
                        </div>
                    </div>
                    <p className="bottom-info">
                        AIIT CHATBOT อาจแสดงข้อมูลที่ไม่ถูกต้อง รวมถึงเกี่ยวกับบุคคล ดังนั้นโปรดตรวจสอบการตอบกลับอีกครั้ง
                        <br />
                        AIIT ของเราไม่สามารถตอบคำถามที่ไม่เกี่ยวกับ IT ได้ เนื่องจากเราได้กำหนดให้ระบบตอบเฉพาะคำถามที่เกี่ยวข้องกับ IT เท่านั้น
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Main;