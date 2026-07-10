/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, User, Trash2, Edit2, AlertCircle, CheckCircle2,
  ListTodo, ClipboardList, Clock, CheckSquare, Sparkles, RefreshCw
} from 'lucide-react';
import { Task, TaskColumn } from '../types.js';

export default function KanbanBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Drag state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [isOverColumn, setIsOverColumn] = useState<string | null>(null);

  // New task inline creation state
  const [addingToColumn, setAddingToColumn] = useState<TaskColumn | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'baixa' | 'media' | 'alta'>('media');
  const [newAssigned, setNewAssigned] = useState('Alex Santos');
  const [newDueDate, setNewDueDate] = useState('');

  // Editing state
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error("Error fetching tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const columns: { id: TaskColumn; title: string; color: string; border: string; bg: string; icon: any }[] = [
    { 
      id: 'backlog', 
      title: 'Backlog / Ideias', 
      color: 'text-slate-400', 
      border: 'border-white/5', 
      bg: 'bg-white/[0.02]',
      icon: ClipboardList 
    },
    { 
      id: 'todo', 
      title: 'A Fazer (To Do)', 
      color: 'text-amber-400', 
      border: 'border-amber-500/20', 
      bg: 'bg-amber-500/5',
      icon: ListTodo 
    },
    { 
      id: 'in_progress', 
      title: 'Em Progresso', 
      color: 'text-indigo-400', 
      border: 'border-indigo-500/20', 
      bg: 'bg-indigo-500/5',
      icon: Clock 
    },
    { 
      id: 'done', 
      title: 'Concluído (Done)', 
      color: 'text-emerald-400', 
      border: 'border-emerald-500/20', 
      bg: 'bg-emerald-500/5',
      icon: CheckCircle2 
    }
  ];

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: TaskColumn) => {
    e.preventDefault();
    setIsOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setIsOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetColumn: TaskColumn) => {
    e.preventDefault();
    setIsOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    
    if (!taskId) return;

    // Find task
    const taskToMove = tasks.find(t => t.id === taskId);
    if (!taskToMove || taskToMove.column === targetColumn) {
      setDraggedTaskId(null);
      return;
    }

    // Optimistic Update
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, column: targetColumn } : t);
    setTasks(updatedTasks);

    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ column: targetColumn })
      });
      if (!res.ok) {
        // Rollback on fail
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      fetchTasks();
    } finally {
      setDraggedTaskId(null);
    }
  };

  // Create Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !addingToColumn) return;

    const taskData = {
      title: newTitle,
      description: newDesc,
      column: addingToColumn,
      priority: newPriority,
      assignedTo: newAssigned,
      dueDate: newDueDate || new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      });
      if (res.ok) {
        const newTask = await res.json();
        setTasks(prev => [...prev, newTask]);
        resetAddForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Edit Task Submit
  const handleEditTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTask)
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
        setEditingTask(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Deseja realmente excluir esta tarefa?")) return;
    
    // Optimistic Update
    setTasks(prev => prev.filter(t => t.id !== id));

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        fetchTasks();
      }
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const resetAddForm = () => {
    setAddingToColumn(null);
    setNewTitle('');
    setNewDesc('');
    setNewPriority('media');
    setNewAssigned('Alex Santos');
    setNewDueDate('');
  };

  const priorityColor = (priority: 'baixa' | 'media' | 'alta') => {
    switch (priority) {
      case 'alta': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'media': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'baixa': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar" id="trello-tasks-board">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">Quadro de Tarefas (Estilo Trello)</h1>
          <p className="text-xs text-white/40 mt-1.5 font-medium">
            Gerencie tarefas industriais de forma totalmente interativa. Arraste e solte cartões entre colunas para atualizar o status em tempo real.
          </p>
        </div>
        
        <button
          onClick={fetchTasks}
          className="self-start md:self-center inline-flex items-center space-x-1.5 px-3 py-1.5 border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Atualizar Quadro</span>
        </button>
      </div>

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5" id="kanban-columns-grid">
        {columns.map((col) => {
          const colTasks = tasks.filter(t => t.column === col.id);
          const ColIcon = col.icon;
          const isOver = isOverColumn === col.id;

          return (
            <div 
              key={col.id} 
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`rounded-xl border p-4.5 flex flex-col h-[600px] shadow-sm transition-all duration-150 ${
                isOver ? 'border-indigo-500/50 bg-indigo-500/[0.04]' : `${col.border} ${col.bg}`
              }`}
            >
              {/* Column Title */}
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                <div className="flex items-center space-x-2">
                  <ColIcon className={`w-4 h-4 ${col.color}`} />
                  <span className="text-[11px] font-black uppercase tracking-wider text-white">{col.title}</span>
                </div>
                <span className="text-[10px] bg-white/5 text-white/50 font-black px-2 py-0.5 rounded-full border border-white/5">
                  {colTasks.length}
                </span>
              </div>

              {/* Tasks List */}
              <div className="flex-1 space-y-3.5 overflow-y-auto custom-scrollbar pr-1 pb-4">
                {colTasks.map((task) => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    className="bg-[#111113] p-4 rounded-xl border border-white/5 shadow-md hover:border-white/15 transition-all cursor-grab active:cursor-grabbing group space-y-3 relative"
                    id={`task-card-${task.id}`}
                  >
                    {/* Header: Priority & Actions */}
                    <div className="flex justify-between items-start">
                      <span className={`text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded border ${priorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingTask(task)}
                          className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1 rounded text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors">{task.title}</h4>
                      {task.description && (
                        <p className="text-[10px] text-white/40 leading-normal mt-1.5 line-clamp-2">{task.description}</p>
                      )}
                    </div>

                    {/* Footer: User & Date */}
                    <div className="flex justify-between items-center text-[9px] text-white/40 pt-2 border-t border-white/5 font-medium">
                      <span className="flex items-center space-x-1">
                        <User className="w-3 h-3 text-white/30" />
                        <span className="truncate max-w-[80px]">{task.assignedTo || 'Sem atribuição'}</span>
                      </span>

                      {task.dueDate && (
                        <span className="flex items-center space-x-1 text-white/30 font-bold bg-white/5 px-1.5 py-0.5 rounded">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{new Date(task.dueDate).toLocaleDateString('pt-BR', {day: 'numeric', month: 'short'})}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && !addingToColumn && (
                  <div className="h-44 flex items-center justify-center text-center text-white/20 text-[10px] font-medium italic">
                    Sem tarefas pendentes.
                  </div>
                )}
              </div>

              {/* Add Task Button or Form */}
              {addingToColumn === col.id ? (
                <form onSubmit={handleAddTask} className="bg-[#111113] p-3.5 rounded-xl border border-indigo-500/30 space-y-3 mt-2">
                  <input 
                    type="text" 
                    placeholder="Título da tarefa..." 
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                  />
                  <textarea 
                    placeholder="Descrição opcional..." 
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 rounded px-2.5 py-1.5 text-[10px] text-white/70 h-12 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">Prioridade</label>
                      <select 
                        value={newPriority}
                        onChange={(e: any) => setNewPriority(e.target.value)}
                        className="w-full bg-[#111113] border border-white/5 text-[9px] text-white/80 p-1 rounded"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">Responsável</label>
                      <select 
                        value={newAssigned}
                        onChange={(e) => setNewAssigned(e.target.value)}
                        className="w-full bg-[#111113] border border-white/5 text-[9px] text-white/80 p-1 rounded"
                      >
                        <option value="Alex Santos">Alex Santos</option>
                        <option value="Juliana Silva">Juliana Silva</option>
                        <option value="Financeiro">Financeiro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[8px] font-bold text-white/40 uppercase mb-1">Prazo de Entrega</label>
                    <input 
                      type="date" 
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full bg-[#111113] border border-white/5 text-[9px] text-white/80 p-1 rounded"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-1">
                    <button 
                      type="button" 
                      onClick={resetAddForm}
                      className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-bold uppercase transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold uppercase transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddingToColumn(col.id)}
                  className="mt-2 w-full flex items-center justify-center space-x-1.5 py-2 px-3 border border-dashed border-white/5 hover:border-white/10 hover:bg-white/5 text-white/40 hover:text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Tarefa</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats footer panel */}
      <div className="bg-[#111113] p-5 rounded-xl border border-white/5 shadow-xs grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase block">Conclusão de Tarefas</span>
            <p className="text-sm font-semibold text-white mt-1">
              {tasks.filter(t => t.column === 'done').length} de {tasks.length} concluídas 
              <span className="text-teal-400 font-semibold text-[10px] ml-2">
                ({tasks.length > 0 ? Math.round((tasks.filter(t => t.column === 'done').length / tasks.length) * 100) : 0}%)
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase block">Alta Prioridade</span>
            <p className="text-sm font-semibold text-white mt-1">
              {tasks.filter(t => t.priority === 'alta' && t.column !== 'done').length} pendentes urgentes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase block">Status Geral do Fluxo</span>
            <p className="text-sm font-semibold text-white mt-1">Quadro ativo & Sincronizado</p>
          </div>
        </div>
      </div>

      {/* Task Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" id="edit-task-modal">
          <div className="bg-[#111113] border border-white/5 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Editar Tarefa</h3>
              <button 
                onClick={() => setEditingTask(null)}
                className="text-white/40 hover:text-white transition-colors text-xs font-semibold"
              >
                Fechar [x]
              </button>
            </div>

            <form onSubmit={handleEditTaskSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-white/60 uppercase mb-1.5">Título</label>
                <input 
                  type="text" 
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-white/60 uppercase mb-1.5">Descrição</label>
                <textarea 
                  value={editingTask.description || ''}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white h-20 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase mb-1.5">Coluna</label>
                  <select 
                    value={editingTask.column}
                    onChange={(e: any) => setEditingTask({ ...editingTask, column: e.target.value })}
                    className="w-full bg-[#111113] border border-white/5 text-xs text-white p-2 rounded-lg"
                  >
                    <option value="backlog">Backlog / Ideias</option>
                    <option value="todo">A Fazer</option>
                    <option value="in_progress">Em Progresso</option>
                    <option value="done">Concluído</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase mb-1.5">Prioridade</label>
                  <select 
                    value={editingTask.priority}
                    onChange={(e: any) => setEditingTask({ ...editingTask, priority: e.target.value })}
                    className="w-full bg-[#111113] border border-white/5 text-xs text-white p-2 rounded-lg"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase mb-1.5">Responsável</label>
                  <select 
                    value={editingTask.assignedTo || 'Alex Santos'}
                    onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                    className="w-full bg-[#111113] border border-white/5 text-xs text-white p-2 rounded-lg"
                  >
                    <option value="Alex Santos">Alex Santos</option>
                    <option value="Juliana Silva">Juliana Silva</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase mb-1.5">Prazo</label>
                  <input 
                    type="date" 
                    value={editingTask.dueDate ? editingTask.dueDate.substring(0, 10) : ''}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                    className="w-full bg-[#111113] border border-white/5 text-xs text-white p-2 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 border border-white/5 hover:bg-white/5 text-white rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md cursor-pointer"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
