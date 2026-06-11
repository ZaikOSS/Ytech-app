import React, { useState, useEffect, useRef } from 'react';

const ChatComponent = ({ projectId, currentUserId, isLocked = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [attachmentPreview, setAttachmentPreview] = useState(null);
    const [error, setError] = useState('');
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);
    const prevMessagesLength = useRef(0);

    const fetchMessages = async () => {
        try {
            const token = localStorage.getItem('ytech_token');
            const res = await fetch(`http://localhost:3001/api/messages/${projectId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch messages");
        }
    };

    useEffect(() => {
        prevMessagesLength.current = 0; // reset for new project
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // poll every 5s
        return () => clearInterval(interval);
    }, [projectId]);

    useEffect(() => {
        if (chatContainerRef.current && messages.length > prevMessagesLength.current) {
            // Only auto-scroll the internal chat container, not the whole page!
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            prevMessagesLength.current = messages.length;
        }
    }, [messages]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError("File size must be under 5MB.");
            return;
        }
        setError('');
        setAttachment(file);
        if (file.type.startsWith('image/')) {
            setAttachmentPreview(URL.createObjectURL(file));
        } else {
            setAttachmentPreview('PDF Document');
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() && !attachment) return;
        if (newMessage.length > 500) {
            setError("Message must be under 500 characters.");
            return;
        }
        
        setError('');
        try {
            const token = localStorage.getItem('ytech_token');
            const formData = new FormData();
            formData.append('projectId', projectId);
            if (newMessage.trim()) formData.append('messageText', newMessage);
            if (attachment) formData.append('attachment', attachment);

            const res = await fetch('http://localhost:3001/api/messages', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setNewMessage('');
                removeAttachment();
                fetchMessages(); // refresh instantly
            } else {
                setError(data.error || "Failed to send message.");
            }
        } catch (err) {
            setError("Network error occurred.");
        }
    };

    return (
        <div className="bg-white border border-[#c5c6cd] rounded-2xl flex flex-col h-[500px] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-[#091426] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#10B981]">chat</span>
                    Project Chat
                </h3>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Secure</span>
            </div>
            
            <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto bg-[#f7f9fb] space-y-4">
                {isLocked ? (
                    <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center italic gap-4">
                        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="material-symbols-outlined text-gray-400 text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                        </div>
                        <p>Chat is locked until a dedicated manager is assigned to this project.</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center italic">
                        No messages yet. Say hello!
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <span className="text-xs text-gray-500 mb-1 ml-1 mr-1">
                                    {isMe ? 'You' : msg.sender_name} ({msg.sender_role})
                                </span>
                                <div className={`px-4 py-2 rounded-2xl max-w-[85%] ${isMe ? 'bg-[#10B981] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-[#091426] rounded-tl-sm shadow-sm'}`}>
                                    {msg.file_url && (
                                        <div className="mb-2">
                                            {msg.file_url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                                                <a href={`http://localhost:3001${msg.file_url}`} target="_blank" rel="noopener noreferrer">
                                                    <img src={`http://localhost:3001${msg.file_url}`} alt={msg.file_name} className="max-w-[200px] max-h-[200px] rounded-lg object-cover mb-1 border border-white/20" />
                                                </a>
                                            ) : (
                                                <a href={`http://localhost:3001${msg.file_url}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 underline text-sm ${isMe ? 'text-white hover:text-green-100' : 'text-[#10B981] hover:text-[#059669]'}`}>
                                                    <span className="material-symbols-outlined text-sm">description</span>
                                                    {msg.file_name}
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    {msg.message_text && <p className="whitespace-pre-wrap text-sm">{msg.message_text}</p>}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex flex-col gap-2">
                {error && <div className="text-red-500 text-xs">{error}</div>}
                
                {attachmentPreview && (
                    <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200 w-fit">
                        {attachment?.type?.startsWith('image/') ? (
                            <img src={attachmentPreview} alt="Preview" className="w-10 h-10 object-cover rounded" />
                        ) : (
                            <span className="material-symbols-outlined text-gray-400">description</span>
                        )}
                        <span className="text-sm text-gray-700 max-w-[150px] truncate">{attachment.name}</span>
                        <button type="button" onClick={removeAttachment} className="text-gray-400 hover:text-red-500">
                            <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                    </div>
                )}

                <form onSubmit={handleSend} className="flex gap-2 relative items-end">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/png, image/jpeg, application/pdf" 
                        className="hidden" 
                    />
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLocked}
                        className="p-3 text-gray-400 hover:text-[#10B981] transition-colors disabled:opacity-50 h-[50px] flex items-center justify-center"
                        title="Attach Image or PDF"
                    >
                        <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    <textarea 
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] resize-none h-[50px] max-h-[120px] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        placeholder={isLocked ? "Awaiting manager assignment..." : "Type a message..."}
                        value={newMessage}
                        disabled={isLocked}
                        onChange={(e) => {
                            if(e.target.value.length <= 500) setNewMessage(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(e);
                            }
                        }}
                    />
                    <div className="absolute right-16 bottom-3 text-xs text-gray-400">
                        {newMessage.length}/500
                    </div>
                    <button 
                        type="submit" 
                        disabled={(!newMessage.trim() && !attachment) || isLocked}
                        className="bg-[#10B981] text-white p-3 rounded-xl hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center h-[50px] w-[50px]"
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatComponent;
