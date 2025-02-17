import React, { useContext, useState } from 'react';
import './Sidebar.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import Activity from '../Activity/Activity';

const Sidebar = ({ togglePromptSets, toggleAdmin }) => {
    const [extended, setExtended] = useState(false);
    const [showActivity, setShowActivity] = useState(false);
    const { onSent, prevPrompts, setRecentPrompt, recentPrompt, newChat, setPrevPrompts } = useContext(Context);

    const handlePromptSetClick = () => {
        togglePromptSets();
    };

    const handleDeletePrompt = (index, e) => {
        e.stopPropagation();
        const newPrompts = prevPrompts.filter((_, i) => i !== index);
        setPrevPrompts(newPrompts);
    };

    return (
        <div className='sidebar'>
            <div className="top">
                <img 
                    onClick={() => setExtended(prev => !prev)} 
                    className="menu" 
                    src={assets.menu_icon} 
                    alt="" 
                />
                <div onClick={() => newChat()} className="new-chat">
                    <img src={assets.plus_icon} alt="" />
                    {extended ? <p>New Chat</p> : null}
                </div>
                {extended && (
                    <div className="recent">
                        <p className="recent-title">Recent</p>
                        {prevPrompts.length > 0 ? (
                            prevPrompts.map((item, index) => (
                                <div key={index} className="recent-entry-wrapper">
                                    <div 
                                        onClick={() => onSent(item.input)} 
                                        className="recent-entry"
                                    >
                                        <img src={assets.message_icon} alt="" />
                                        <p>{item.input.slice(0, 18)} ...</p>
                                    </div>
                                    <button 
                                        className="delete-btn"
                                        onClick={(e) => handleDeletePrompt(index, e)}
                                        title="Delete"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>...</p>
                        )}
                    </div>
                )}
            </div>
            <div className="bottom">
                <div className="bottom-item recent-entry" onClick={handlePromptSetClick}>
                    <img src={assets.question_icon} alt="" />
                    {extended ? <p>ชุดคำถาม</p> : null}
                </div>
                <div className="bottom-item recent-entry" onClick={() => setShowActivity(true)}>
                    <img src={assets.history_icon} alt="" />
                    {extended ? <p>Activity</p> : null}
                </div>
                <div className="bottom-item recent-entry" onClick={toggleAdmin}>
                    <img src={assets.setting_icon} alt="" />
                    {extended ? <p>Admin Mode</p> : null}
                </div>
            </div>
            <Activity isOpen={showActivity} onClose={() => setShowActivity(false)} />
        </div> 
    );
};

export default Sidebar;