import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import NavBar from '../../Components/NavBar/NavBar';
import { FaTrash, FaEdit, FaSave, FaTimes, FaPaperPlane, FaImage } from 'react-icons/fa';

function GroupChat() {
    const { id: groupId } = useParams();
    const userId = localStorage.getItem('userID');
    const [messages, setMessages] = useState([]);
    const [msg, setMsg] = useState('');
    const [userNames, setUserNames] = useState({});
    const [groupTitle, setGroupTitle] = useState('');
    const [editMsgId, setEditMsgId] = useState(null);
    const [editMsgValue, setEditMsgValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch group info
    useEffect(() => {
        fetch(`http://localhost:8080/communications/${groupId}`)
            .then(res => res.json())
            .then(data => setGroupTitle(data.groupTitle || ''));
    }, [groupId]);

    // Fetch messages for this group
    const fetchMessages = () => {
        fetch(`http://localhost:8080/groupChat/${groupId}/messages`)
            .then(res => res.json())
            .then(data => {
                setMessages(data);
                // Fetch all unique user fullnames
                const userIds = [...new Set(data.map(m => m.userId))];
                Promise.all(
                    userIds.map(uid =>
                        fetch(`http://localhost:8080/user/${uid}/fullname`)
                            .then(res => res.json())
                            .then(res => ({ uid, fullName: res.fullName }))
                    )
                ).then(results => {
                    const nameMap = {};
                    results.forEach(({ uid, fullName }) => {
                        nameMap[uid] = fullName;
                    });
                    setUserNames(nameMap);
                });
            });
    };

    useEffect(() => {
        fetchMessages();
    }, [groupId]);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Image picker logic
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    // Send message (with optional image)
    const handleSend = async (e) => {
        e.preventDefault();
        if (!msg.trim() && !selectedImage) return;

        let imageFileName = null;
        if (selectedImage) {
            const formData = new FormData();
            formData.append('file', selectedImage);
            const res = await fetch('http://localhost:8080/groupChat/uploadImage', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                imageFileName = data.fileName;
            }
        }

        fetch(`http://localhost:8080/groupChat/${groupId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, msg, image: imageFileName })
        })
            .then(res => res.json())
            .then(newMsg => {
                setMessages(prev => [...prev, newMsg]);
                setMsg('');
                setSelectedImage(null);
                setImagePreview(null);
                // Fetch full name if not already loaded
                if (!userNames[newMsg.userId]) {
                    fetch(`http://localhost:8080/user/${newMsg.userId}/fullname`)
                        .then(res => res.json())
                        .then(res => setUserNames(prev => ({ ...prev, [newMsg.userId]: res.fullName })));
                }
            });
    };

    // Delete message
    const handleDelete = (msgId) => {
        fetch(`http://localhost:8080/groupChat/messages/${msgId}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (res.ok) {
                    setMessages(prev => prev.filter(m => m.id !== msgId));
                }
            });
    };

    // Start editing
    const handleEdit = (msgId, currentMsg) => {
        setEditMsgId(msgId);
        setEditMsgValue(currentMsg);
    };

    // Save edited message
    const handleSaveEdit = (msgId) => {
        fetch(`http://localhost:8080/groupChat/messages/${msgId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ msg: editMsgValue })
        })
            .then(res => res.json())
            .then(updatedMsg => {
                setMessages(prev =>
                    prev.map(m => m.id === msgId ? { ...m, msg: updatedMsg.msg } : m)
                );
                setEditMsgId(null);
                setEditMsgValue('');
            });
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditMsgId(null);
        setEditMsgValue('');
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <NavBar />
            <br />
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px',
                paddingTop: '80px'
            }}>
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden'
                }}>
                    {/* Chat Header */}
                    <div style={{
                        backgroundColor: '#4285F4',
                        color: 'white',
                        padding: '16px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>{groupTitle}</h2>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{messages.length} messages</div>
                    </div>

                    {/* Messages Container */}
                    <div style={{
                        height: '500px',
                        overflowY: 'auto',
                        padding: '20px',
                        background: 'linear-gradient(to bottom, #f9f9f9, #ffffff)'
                    }}>
                        {messages.map((m, idx) => (
                            <div key={m.id || idx} style={{
                                marginBottom: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: m.userId === userId ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{
                                    maxWidth: '70%',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        fontSize: '0.75rem',
                                        color: '#666',
                                        marginBottom: '4px',
                                        textAlign: m.userId === userId ? 'right' : 'left',
                                        padding: '0 8px'
                                    }}>
                                        {userNames[m.userId] || m.userId}
                                    </div>
                                    <div style={{
                                        background: m.userId === userId ? '#4285F4' : '#e9ecef',
                                        color: m.userId === userId ? 'white' : '#333',
                                        borderRadius: m.userId === userId ?
                                            '18px 4px 18px 18px' :
                                            '4px 18px 18px 18px',
                                        padding: '12px 16px',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                                        position: 'relative'
                                    }}>
                                        {editMsgId === m.id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <input
                                                    type="text"
                                                    value={editMsgValue}
                                                    onChange={e => setEditMsgValue(e.target.value)}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 12px',
                                                        borderRadius: '18px',
                                                        border: '1px solid #ddd',
                                                        marginBottom: '8px',
                                                        fontSize: '0.9rem'
                                                    }}
                                                    autoFocus
                                                />
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSaveEdit(m.id)}
                                                        style={{
                                                            background: '#34a853',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '32px',
                                                            height: '32px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FaSave size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        style={{
                                                            background: '#ea4335',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '32px',
                                                            height: '32px',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        <FaTimes size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {m.msg && <div style={{ fontSize: '0.95rem', wordBreak: 'break-word' }}>{m.msg}</div>}
                                                {m.image &&
                                                    <div style={{ marginTop: 8 }}>
                                                        <img
                                                            src={`http://localhost:8080/groupChat/images/${m.image}`}
                                                            alt="chat-img"
                                                            style={{
                                                                maxWidth: '220px',
                                                                maxHeight: '180px',
                                                                borderRadius: 10,
                                                                border: '1px solid #ddd',
                                                                background: '#fff'
                                                            }}
                                                        />
                                                    </div>
                                                }
                                            </>
                                        )}
                                    </div>
                                    <div style={{
                                        fontSize: '0.7rem',
                                        color: '#999',
                                        marginTop: '4px',
                                        textAlign: m.userId === userId ? 'right' : 'left',
                                        padding: '0 8px'
                                    }}>
                                        {m.timestamp && new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    {m.userId === userId && editMsgId !== m.id && !m.image && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: m.userId === userId ? 'calc(100% + 8px)' : 'auto',
                                            left: m.userId === userId ? 'auto' : 'calc(100% + 8px)',
                                            transform: 'translateY(-50%)',
                                            display: 'flex',
                                            gap: '4px',
                                            background: 'white',
                                            borderRadius: '16px',
                                            padding: '4px',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <button
                                                type="button"
                                                onClick={() => handleEdit(m.id, m.msg)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#666',
                                                    cursor: 'pointer',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                <FaEdit size={12} />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(m.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#666',
                                                    cursor: 'pointer',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    )}
                                    {m.userId === userId && editMsgId !== m.id && m.image && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            right: m.userId === userId ? 'calc(100% + 8px)' : 'auto',
                                            left: m.userId === userId ? 'auto' : 'calc(100% + 8px)',
                                            transform: 'translateY(-50%)',
                                            display: 'flex',
                                            gap: '4px',
                                            background: 'white',
                                            borderRadius: '16px',
                                            padding: '4px',
                                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(m.id)}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#666',
                                                    cursor: 'pointer',
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background 0.2s'
                                                }}
                                            >
                                                <FaTrash size={12} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <div style={{
                        padding: '16px',
                        borderTop: '1px solid #eee',
                        backgroundColor: '#f8f9fa'
                    }}>
                        <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <label style={{
                                cursor: 'pointer',
                                margin: 0,
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <FaImage size={22} color={selectedImage ? "#4285F4" : "#888"} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                    disabled={!!editMsgId}
                                />
                            </label>
                            {imagePreview && (
                                <div style={{ position: 'relative', marginRight: 8 }}>
                                    <img
                                        src={imagePreview}
                                        alt="preview"
                                        style={{
                                            width: 48,
                                            height: 48,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                            border: '1px solid #ccc'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        style={{
                                            position: 'absolute',
                                            top: -8,
                                            right: -8,
                                            background: '#ea4335',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 20,
                                            height: 20,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            fontSize: 12
                                        }}
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            )}
                            <input
                                type="text"
                                value={msg}
                                onChange={e => setMsg(e.target.value)}
                                placeholder="Type your message..."
                                style={{
                                    flex: 1,
                                    padding: '12px 16px',
                                    borderRadius: '24px',
                                    border: '1px solid #ddd',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'border 0.2s'
                                }}
                                disabled={!!editMsgId}
                            />
                            <button
                                type="submit"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    background: '#4285F4',
                                    color: 'white',
                                    border: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s'
                                }}
                                disabled={!!editMsgId || (!msg.trim() && !selectedImage)}
                            >
                                <FaPaperPlane size={16} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroupChat;