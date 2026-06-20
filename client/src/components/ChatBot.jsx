import React, { useState, useRef, useEffect } from 'react';

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'model', text: 'Hi! I am the YTech Solutions AI Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput('');
        
        const newMessages = [...messages, { role: 'user', text: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: userMsg,
                    history: messages
                })
            });
            const data = await res.json();
            
            if (data.text) {
                setMessages([...newMessages, { role: 'model', text: data.text }]);
            } else {
                setMessages([...newMessages, { role: 'model', text: 'Sorry, I am having trouble connecting to the server.' }]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            setMessages([...newMessages, { role: 'model', text: 'Sorry, a network error occurred.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Button */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-gradient-to-tr from-[#10B981] to-[#047857] rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform text-white group"
                >
                    <span className="material-symbols-outlined text-3xl group-hover:animate-pulse">smart_toy</span>
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-fadeIn h-[500px] max-h-[80vh]">
                    {/* Header */}
                    <div className="bg-[#091426] p-4 flex justify-between items-center text-white">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#10B981]">smart_toy</span>
                            <span className="font-semibold text-sm">YTech AI Assistant</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 text-sm">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#10B981] text-white rounded-tr-sm' : 'bg-white text-gray-700 border border-gray-200 rounded-tl-sm shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl p-3 shadow-sm flex items-center gap-1">
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]"
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            disabled={!input.trim() || isLoading}
                            className="w-10 h-10 bg-[#091426] text-white rounded-full flex items-center justify-center hover:bg-[#10B981] transition-colors disabled:opacity-50 disabled:hover:bg-[#091426]"
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}

export default ChatBot;
