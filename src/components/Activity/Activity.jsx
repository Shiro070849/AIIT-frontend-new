// src/components/Activity/Activity.jsx
import React from 'react';
import { createPortal } from 'react-dom';
import './Activity.css';

const Activity = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const handleOverlayClick = (e) => {
        if (e.target.className === 'activity-overlay') {
            onClose();
        }
    };

    const modalContent = (
        <div className="activity-overlay" onClick={handleOverlayClick}>
            <div className="activity-modal">
                <button onClick={onClose} className="close-button">
                    ✕
                </button>
                
                <div className="modal-content">
                    <h2>ติดต่อ Developer</h2>
                    
                    <p className="description">
                        หากมีข้อสงสัยตรงไหนหรือพบเจอส่วนที่ผิดปกติ สามารถแจ้ง developer ได้ทางช่องทางต่อไปนี้:
                    </p>
                    
                    <div className="contact-card">
                        <h3>Developer 1</h3>
                        <div className="contact-info">
                            <p>Email: <a href="mailto:pilan.mill@gmail.com">pilan.mill@gmail.com</a></p>
                            <p>Facebook: <a href="https://www.facebook.com/share/18GkBXPLaS/" target="_blank" rel="noopener noreferrer">Mill Kung</a></p>
                        </div>
                    </div>

                    <div className="contact-card">
                        <h3>Developer 2</h3>
                        <div className="contact-info">
                            <p>Email: <a href="mailto:pilan.mill@gmail.com">navinsutramchai@gmail.com</a></p>
                            <p>Facebook: <a href="https://www.facebook.com/share/15jvjKnvoa/" target="_blank" rel="noopener noreferrer">Navin Sutramchai</a></p>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
    );

    return createPortal(
        modalContent,
        document.getElementById('modal-root')
    );
};

export default Activity;