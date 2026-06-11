import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import ChatComponent from './ChatComponent';

const ManagerDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [loading, setLoading] = useState(true);

    const steps = [
        { id: 1, label: 'Payment Confirmed', icon: 'check_circle' },
        { id: 2, label: 'Requirements Gathering', icon: 'assignment' },
        { id: 3, label: 'Design Phase', icon: 'brush' },
        { id: 4, label: 'Development', icon: 'code' },
        { id: 5, label: 'Deployment & Go-Live', icon: 'rocket_launch' }
    ];

    const fetchProjects = async () => {
        try {
            const token = localStorage.getItem('ytech_token');
            const res = await fetch('http://localhost:3001/api/manager/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setProjects(data);
            if (data.length > 0 && !selectedProject) {
                setSelectedProject(data[0]);
            }
        } catch (err) {
            console.error("Failed to fetch projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleUpdatePhase = async () => {
        if (!selectedProject || selectedProject.current_phase >= 5) return;
        
        try {
            const token = localStorage.getItem('ytech_token');
            const res = await fetch('http://localhost:3001/api/manager/update-phase', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ 
                    projectId: selectedProject.id, 
                    newPhase: selectedProject.current_phase + 1 
                })
            });
            
            if (res.ok) {
                setSelectedProject({ ...selectedProject, current_phase: selectedProject.current_phase + 1 });
                fetchProjects();
            }
        } catch (err) {
            console.error("Failed to update phase", err);
        }
    };

    if (loading) return <div className="p-10">Loading workspace...</div>;

    return (
        <div className="bg-[#F8FAFC] text-[#191c1e] min-h-screen flex flex-col font-sans">
            <header className="w-full top-0 sticky bg-white border-b border-[#c5c6cd] z-50">
                <div className="flex items-center justify-between px-10 py-4 max-w-[1280px] mx-auto">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
                            <div className="w-8 h-8 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                                <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
                            </div>
                            <span className="font-['Outfit'] text-2xl font-black text-gray-900 tracking-tight">YTECH<span className="text-[#10B981]">.</span></span>
                        </div>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h1 className="text-xl font-bold text-[#191c1e]">
                            Manager Workspace
                        </h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex flex-col text-right mr-3 hidden sm:flex">
                            <span className="text-sm font-bold text-[#191c1e]">{user.full_name}</span>
                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                                <span className="text-[11px] font-bold tracking-wider text-[#006c49] uppercase">Active Duty</span>
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-500 border-2 border-gray-300">
                             {user.full_name.charAt(0)}
                        </div>
                        <button onClick={logout} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors">
                            <span className="material-symbols-outlined text-sm">logout</span>
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-10">
                    <div className="max-w-[1280px] mx-auto space-y-8">
                        <div className="grid grid-cols-12 gap-8">
                            {/* CLIENT SELECTION */}
                            <section className="col-span-12 lg:col-span-4 flex flex-col gap-4">
                                <header className="flex justify-between items-end mb-2">
                                    <h2 className="text-2xl font-bold text-[#38485d]">My Assigned Clients</h2>
                                    <span className="text-sm font-bold text-[#006c49] uppercase tracking-widest">Active</span>
                                </header>

                                {projects.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-200 p-6 text-gray-500">
                                        No clients assigned yet.
                                    </div>
                                ) : (
                                    projects.map(p => {
                                        const isSelected = selectedProject?.id === p.id;
                                        return (
                                            <div 
                                                key={p.id}
                                                onClick={() => setSelectedProject(p)}
                                                className={`bg-white rounded-2xl border-2 ${isSelected ? 'border-blue-500 shadow-md' : 'border-[#c5c6cd] border-opacity-50'} p-6 flex flex-col gap-4 cursor-pointer hover:-translate-y-1 transition-transform relative overflow-hidden`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-0 right-0 p-2">
                                                        <span className="material-symbols-outlined text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                        {p.client_name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-[#091426]">{p.client_name}</h3>
                                                        <p className="text-sm text-[#45474c]">Status: {p.status}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </section>

                            {/* ACTIVE PHASE CONTROLLER */}
                            <section className="col-span-12 lg:col-span-8">
                                {selectedProject ? (
                                <div className="bg-white rounded-2xl border border-[#c5c6cd] border-opacity-50 p-8 shadow-sm h-full flex flex-col">
                                    <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#091426]">Project Lifecycle Controller: {selectedProject.client_name}</h2>
                                            <p className="text-[#45474c] mt-1">Managing fulfillment lifecycle milestones and deliverables.</p>
                                        </div>
                                        <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                                            <span className="text-sm font-bold text-blue-600">
                                                Phase {selectedProject.current_phase}: {steps[selectedProject.current_phase - 1]?.label}
                                            </span>
                                        </div>
                                    </header>

                                    {/* Milestone Timeline */}
                                    <div className="flex-1 mb-10">
                                        <div className="relative flex flex-col md:flex-row justify-between gap-8 before:hidden md:before:block before:absolute before:top-6 before:left-0 before:w-full before:h-0.5 before:bg-[#c5c6cd] before:-z-10">
                                            {steps.map((step, idx) => {
                                                const phase = idx + 1;
                                                const isCompleted = phase < selectedProject.current_phase;
                                                const isActive = phase === selectedProject.current_phase;
                                                const isPending = phase > selectedProject.current_phase;

                                                return (
                                                    <div key={phase} className="relative z-10 flex flex-col items-center md:w-1/5">
                                                        {isCompleted ? (
                                                            <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center mb-4 transition-transform hover:scale-110">
                                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                            </div>
                                                        ) : isActive ? (
                                                            <div className="w-12 h-12 rounded-full bg-white border-4 border-blue-500 text-blue-500 flex items-center justify-center mb-4 ring-4 ring-blue-50 animate-pulse">
                                                                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-gray-100 border border-[#c5c6cd] text-gray-400 flex items-center justify-center mb-4">
                                                                <span className="material-symbols-outlined">{step.icon}</span>
                                                            </div>
                                                        )}
                                                        <p className={`text-sm text-center px-2 ${isActive ? 'font-bold text-blue-600' : isCompleted ? 'font-bold text-[#191c1e]' : 'font-medium text-gray-400'}`}>
                                                            {step.label}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Controls */}
                                    <div className="bg-[#f7f9fb] p-6 rounded-xl border border-[#c5c6cd] flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="w-full md:w-1/2">
                                            <label className="block text-sm font-bold text-[#191c1e] mb-2 uppercase tracking-wide">Advance Project to Next Phase</label>
                                            <div className="relative">
                                                <div className="w-full appearance-none bg-white border border-[#c5c6cd] text-[#191c1e] rounded-lg px-4 py-3">
                                                    {selectedProject.current_phase < 5 ? steps[selectedProject.current_phase].label : 'Completed'}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedProject.current_phase < 5 && (
                                            <button 
                                                onClick={handleUpdatePhase}
                                                className="w-full md:w-auto bg-[#10B981] text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-[#0d9469] transition-all transform hover:scale-[1.02] shadow-md"
                                            >
                                                <span className="material-symbols-outlined">sync</span>
                                                Advance Phase
                                            </button>
                                        )}
                                    </div>

                                    {/* Project Chat UI */}
                                    <div className="mt-8">
                                        <ChatComponent projectId={selectedProject.id} currentUserId={user.id} />
                                    </div>
                                </div>
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                                        Select a project to view lifecycle
                                    </div>
                                )}
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ManagerDashboard;
