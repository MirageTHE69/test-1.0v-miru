'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Plus,
  Percent,
  TrendingUp,
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Tag,
  ArrowRight,
  ArrowLeft,
  Loader,
} from 'lucide-react';

interface TaskType {
  id: string;
  title: string;
  status: string; // TODO, IN_PROGRESS, REVIEW, DONE
  priority: string; // LOW, MEDIUM, HIGH
  dueDate: string | null;
}

interface ProjectType {
  id: string;
  name: string;
  status: string;
  budget: number;
  spent: number;
  tasks: TaskType[];
}

export default function ProjectsPage() {
  const { activeClient } = useApp();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('MEDIUM');
  const [showAddTaskForm, setShowAddTaskForm] = useState<string | null>(null); // projectId

  const fetchProjects = async () => {
    if (!activeClient) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?clientId=${activeClient.id}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Failed to load projects', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [activeClient]);

  const handleUpdateTaskStatus = async (taskId: string, currentStatus: string, direction: 'forward' | 'backward') => {
    const statuses = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
    const currentIndex = statuses.indexOf(currentStatus);
    let nextIndex = currentIndex;

    if (direction === 'forward' && currentIndex < statuses.length - 1) {
      nextIndex = currentIndex + 1;
    } else if (direction === 'backward' && currentIndex > 0) {
      nextIndex = currentIndex - 1;
    }

    if (nextIndex === currentIndex) return;
    const nextStatus = statuses[nextIndex];

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_task_status',
          taskId,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        // Optimistic state update
        setProjects((prev) =>
          prev.map((proj) => ({
            ...proj,
            tasks: proj.tasks.map((task) =>
              task.id === taskId ? { ...task, status: nextStatus } : task
            ),
          }))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (projectId: string) => {
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_task',
          projectId,
          title: newTaskTitle,
          priority: newTaskPriority,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Append task to project
        setProjects((prev) =>
          prev.map((proj) =>
            proj.id === projectId
              ? { ...proj, tasks: [data.task, ...proj.tasks] }
              : proj
          )
        );
        setNewTaskTitle('');
        setShowAddTaskForm(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!activeClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
            <Tag className="h-3 w-3" /> {activeClient.name} Workspaces
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 font-tight">Project Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track active deliverables and task backlogs. Switch account switcher to load other client projects.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Loader className="h-6 w-6 text-indigo-600 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700 mt-4">No Projects Configured</h3>
          <p className="text-xs text-slate-400 mt-1">This account has no active projects running.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {projects.map((project) => {
            const margin = project.budget > 0 ? Math.round(((project.budget - project.spent) / project.budget) * 100) : 100;
            
            // Task groups
            const tasksTodo = project.tasks.filter((t) => t.status === 'TODO');
            const tasksInProgress = project.tasks.filter((t) => t.status === 'IN_PROGRESS');
            const tasksReview = project.tasks.filter((t) => t.status === 'REVIEW');
            const tasksDone = project.tasks.filter((t) => t.status === 'DONE');

            const columns = [
              { title: 'Backlog / Todo', status: 'TODO', tasks: tasksTodo, color: 'border-slate-200' },
              { title: 'In Progress', status: 'IN_PROGRESS', tasks: tasksInProgress, color: 'border-indigo-200' },
              { title: 'Client Review', status: 'REVIEW', tasks: tasksReview, color: 'border-amber-200' },
              { title: 'Done', status: 'DONE', tasks: tasksDone, color: 'border-emerald-200' },
            ];

            return (
              <div key={project.id} className="space-y-6">
                {/* Project Stats Summary Header */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{project.name}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Budget Tracker & live profitability index</p>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-center md:text-right">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Budget</p>
                      <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
                        ₹{project.budget.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Spent</p>
                      <p className="text-base font-bold text-slate-800 font-mono mt-0.5">
                        ₹{project.spent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Margin</p>
                      <p className={`text-base font-bold font-mono mt-0.5 ${
                        margin > 40 ? 'text-emerald-600' : margin > 20 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {margin}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Project Kanban Board */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                  {columns.map((col) => (
                    <div key={col.status} className={`rounded-xl border border-slate-200 bg-slate-50/50 p-4 flex flex-col max-h-[70vh]`}>
                      {/* Column Title */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-slate-700">{col.title}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-slate-200 text-slate-600 rounded-full font-bold px-2 py-0.5">
                            {col.tasks.length}
                          </span>
                          {col.status === 'TODO' && (
                            <button
                              onClick={() => setShowAddTaskForm(showAddTaskForm === project.id ? null : project.id)}
                              className="rounded p-1 text-slate-500 hover:bg-slate-200"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Add Task Inline Form */}
                      {col.status === 'TODO' && showAddTaskForm === project.id && (
                        <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3 space-y-3 shadow-sm animate-pulse">
                          <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="Task title..."
                            className="w-full text-xs rounded border border-slate-200 p-1.5 outline-none focus:border-indigo-500"
                          />
                          <div className="flex justify-between items-center">
                            <select
                              value={newTaskPriority}
                              onChange={(e) => setNewTaskPriority(e.target.value)}
                              className="text-[10px] rounded border border-slate-200 p-1 bg-white"
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                            </select>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setShowAddTaskForm(null)}
                                className="rounded px-2 py-1 text-[10px] text-slate-400 hover:bg-slate-100"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleCreateTask(project.id)}
                                className="rounded bg-indigo-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-indigo-700"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Tasks Container */}
                      <div className="space-y-3 overflow-y-auto flex-1 pb-4">
                        {col.tasks.length === 0 ? (
                          <div className="text-center py-8 text-[11px] text-slate-400 border border-dashed border-slate-200 rounded-lg">
                            No tasks
                          </div>
                        ) : (
                          col.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm card-hover relative group"
                            >
                              <h4 className="text-xs font-semibold text-slate-800 leading-relaxed">
                                {task.title}
                              </h4>
                              
                              <div className="mt-3 flex items-center justify-between">
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                  task.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                                  task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                  'bg-slate-50 text-slate-600 border border-slate-100'
                                }`}>
                                  {task.priority}
                                </span>

                                {/* Quick status move arrows */}
                                <div className="flex gap-1">
                                  {col.status !== 'TODO' && (
                                    <button
                                      onClick={() => handleUpdateTaskStatus(task.id, task.status, 'backward')}
                                      className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    >
                                      <ArrowLeft className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                  {col.status !== 'DONE' && (
                                    <button
                                      onClick={() => handleUpdateTaskStatus(task.id, task.status, 'forward')}
                                      className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    >
                                      <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
