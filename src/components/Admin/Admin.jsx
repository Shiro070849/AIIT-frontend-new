import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';
import './Admin.css';
import Login from './Login';

const Admin = ({ toggleAdmin }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [prompts, setPrompts] = useState([]);
    const [userPrompts, setUserPrompts] = useState([]);
    const [editingPrompt, setEditingPrompt] = useState(null);
    const [newPrompt, setNewPrompt] = useState({
        type: '',
        text: ''
    });
    const [otherCategory, setOtherCategory] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchPrompts();
            fetchUserPrompts();
        }
    }, [isAuthenticated]);

    const fetchPrompts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/prompts');
            const data = await response.json();
            setPrompts(data);
        } catch (error) {
            console.error('Error fetching prompts:', error);
        }
    };

    const fetchUserPrompts = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/userprompt');
            const data = await response.json();
            setUserPrompts(data);
        } catch (error) {
            console.error('Error fetching user prompts:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const category = newPrompt.type === 'other' ? otherCategory : newPrompt.type;
            const response = await fetch('http://localhost:5000/api/admin/prompts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    type: category,
                    text: newPrompt.text 
                }),
            });

            if (response.ok) {
                alert('เพิ่มคำถามสำเร็จ');
                setNewPrompt({ type: '', text: '' });
                setOtherCategory('');
                fetchPrompts();
            }
        } catch (error) {
            console.error('Error adding prompt:', error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/admin/prompts/${editingPrompt.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: editingPrompt.type,
                    text: editingPrompt.text
                }),
            });

            if (response.ok) {
                alert('แก้ไขคำถามสำเร็จ');
                setEditingPrompt(null);
                fetchPrompts();
            } else {
                alert('เกิดข้อผิดพลาดในการแก้ไข');
            }
        } catch (error) {
            console.error('Error editing prompt:', error);
            alert('เกิดข้อผิดพลาด');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('คุณแน่ใจที่จะลบคำถามนี้?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/admin/prompts/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert('ลบคำถามสำเร็จ');
                    fetchPrompts();
                }
            } catch (error) {
                console.error('Error deleting prompt:', error);
                alert('เกิดข้อผิดพลาด');
            }
        }
    };

    const handleDeleteUserPrompt = async (id) => {
        if (window.confirm('คุณแน่ใจที่จะลบคำถามนี้?')) {
            try {
                const response = await fetch(`http://localhost:5000/api/userprompt/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert('ลบคำถามสำเร็จ');
                    fetchUserPrompts();
                }
            } catch (error) {
                console.error('Error deleting user prompt:', error);
                alert('เกิดข้อผิดพลาดในการลบคำถาม');
            }
        }
    };

    if (!isAuthenticated) {
        return <Login onLogin={setIsAuthenticated} />;
    }

    return (
        <div className="admin-container">
            <div className="admin-header">
                <img src={assets.plus_icon} alt="AIIT Logo" className="admin-logo" />
                <h1>AIIT Chatbot Admin</h1>
                <div className="header-buttons">
                    <button onClick={() => setIsAuthenticated(false)} className="logout-btn">
                        ออกจากระบบ
                    </button>
                    <button onClick={toggleAdmin} className="back-btn">
                        กลับไปหน้าหลัก
                    </button>
                </div>
            </div>
            
            <div className="add-prompt-form">
                <h2>เพิ่มคำถามใหม่</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>หมวดหมู่:</label>
                        <select
                            value={newPrompt.type}
                            onChange={(e) => setNewPrompt({ ...newPrompt, type: e.target.value })}
                            required
                        >
                            <option value="">เลือกหมวดหมู่</option>
                            <option value="Hardware">ฮาร์ดแวร์</option>
                            <option value="Software">ซอฟต์แวร์</option>
                            <option value="Network">การเขียนโปรแกรม</option>
                            <option value="Network">ความปลอดภัยไซเบอร์</option>
                            <option value="other">อื่นๆ</option>
                        </select>
                    </div>
                    {newPrompt.type === 'other' && (
                        <div className="form-group">
                            <label>หมวดหมู่อื่นๆ:</label>
                            <input
                                type="text"
                                value={otherCategory}
                                onChange={(e) => setOtherCategory(e.target.value)}
                                required
                                placeholder="พิมพ์หมวดหมู่ใหม่"
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>คำถาม:</label>
                        <input
                            type="text"
                            value={newPrompt.text}
                            onChange={(e) => setNewPrompt({ ...newPrompt, text: e.target.value })}
                            required
                            placeholder="พิมพ์คำถามที่นี่"
                        />
                    </div>
                    <button type="submit" className="add-btn">
                        <img src={assets.plus_icon} alt="Add" />
                        เพิ่มคำถาม
                    </button>
                </form>
            </div>

            <div className="prompts-list">
                <h2>รายการคำถามทั้งหมด</h2>
                {prompts.map((category) => (
                    <div key={category.category} className="category-section">
                        <h3>
                            <img src={assets.message_icon} alt="Category" />
                            {category.category}
                        </h3>
                        <div className="prompts">
                            {category.prompts.map((prompt) => (
                                <div key={prompt.id} className="prompt-item">
                                    {editingPrompt && editingPrompt.id === prompt.id ? (
                                        <form onSubmit={handleEdit} className="edit-form">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    value={editingPrompt.type}
                                                    onChange={(e) => setEditingPrompt({
                                                        ...editingPrompt,
                                                        type: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    value={editingPrompt.text}
                                                    onChange={(e) => setEditingPrompt({
                                                        ...editingPrompt,
                                                        text: e.target.value
                                                    })}
                                                    required
                                                />
                                            </div>
                                            <div className="edit-actions">
                                                <button type="submit" className="save-btn">
                                                    บันทึก
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditingPrompt(null)}
                                                    className="cancel-btn"
                                                >
                                                    ยกเลิก
                                                </button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <p>{prompt.text}</p>
                                            <div className="prompt-actions">
                                                <button 
                                                    onClick={() => setEditingPrompt(prompt)}
                                                    className="edit-btn"
                                                >
                                                    <img src={assets.edit_icon} alt="Edit" />
                                                    แก้ไข
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(prompt.id)}
                                                    className="delete-btn"
                                                >
                                                    <img src={assets.delete_icon} alt="Delete" />
                                                    ลบ
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="prompts-list mt-8">
                <h2>ประวัติคำถามจากผู้ใช้</h2>
                <div className="user-prompts">
                    {userPrompts.map((prompt) => (
                        <div key={prompt._id} className="prompt-item">
                            <div className="prompt-content">
                                <p>{prompt.text}</p>
                                <span className="text-sm text-gray-500">
                                    {new Date(prompt.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleDeleteUserPrompt(prompt._id)}
                                className="delete-btn"
                            >
                                <img src={assets.delete_icon} alt="Delete" />
                                ลบ
                            </button>
                        </div>
                    ))}
                    {userPrompts.length === 0 && (
                        <p className="text-gray-500 text-center py-4">
                            ยังไม่มีประวัติคำถามจากผู้ใช้
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;