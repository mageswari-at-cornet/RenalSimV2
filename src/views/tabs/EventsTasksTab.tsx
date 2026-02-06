import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Calendar, Link2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockClinicalEvents, mockTasks, mockCarePlan } from '../../data/mockData';
import { cn } from '../../utils/cn';
import type { Task } from '../../types';

interface EventsTasksTabProps {
  patient: { id: string; name: string };
}

const getPriorityColor = (priority: Task['priority']) => {
  switch (priority) {
    case 'Urgent':
      return 'text-rs-red border-rs-red bg-rs-red/10';
    case 'High':
      return 'text-rs-amber border-rs-amber bg-rs-amber/10';
    case 'Medium':
      return 'text-rs-blue border-rs-blue bg-rs-blue/10';
    case 'Low':
      return 'text-renal-muted border-renal-border bg-renal-panel';
  }
};

const getStatusIcon = (status: Task['status']) => {
  switch (status) {
    case 'Complete':
      return <CheckCircle className="w-4 h-4 text-rs-green" />;
    case 'In Progress':
      return <Clock className="w-4 h-4 text-rs-blue" />;
    default:
      return <div className="w-4 h-4 rounded-full border-2 border-renal-muted" />;
  }
};

export const EventsTasksTab: React.FC<EventsTasksTabProps> = ({ patient }) => {
  // Patient data available for future task assignment features: patient.name
  void patient;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-renal-text">Active Tasks</h3>
            <Button variant="primary" size="sm">
              + New Task
            </Button>
          </div>

          <div className="space-y-3">
            {mockTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-renal-bg rounded-lg border border-renal-border"
              >
                {getStatusIcon(task.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-medium text-renal-text truncate">{task.description}</h4>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0',
                      getPriorityColor(task.priority)
                    )}>
                      {task.priority}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-renal-muted">
                    <span>Assigned: {task.assignedTo}</span>
                    <span className={cn(
                      new Date(task.dueDate) < new Date() ? 'text-rs-red' : ''
                    )}>
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-renal-border">
            <div className="flex items-center gap-2 text-xs text-renal-muted">
              <AlertTriangle className="w-4 h-4 text-rs-red" />
              <span>2 tasks overdue</span>
            </div>
          </div>
        </Card>

        {/* Care Plan */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-renal-text">Current Care Plan</h3>
            <Button variant="secondary" size="sm">
              Edit Plan
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-medium text-renal-muted uppercase tracking-wider mb-2">Active Problems</h4>
              <ul className="space-y-1">
                {mockCarePlan.activeProblems.map((problem, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-renal-text">
                    <div className="w-1.5 h-1.5 rounded-full bg-rs-red" />
                    {problem}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-medium text-renal-muted uppercase tracking-wider mb-2">Goals of Care</h4>
              <ul className="space-y-1">
                {mockCarePlan.goals.map((goal, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-renal-text">
                    <div className="w-1.5 h-1.5 rounded-full bg-rs-green" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-medium text-renal-muted uppercase tracking-wider mb-2">Upcoming Procedures</h4>
              <ul className="space-y-1">
                {mockCarePlan.upcomingProcedures.map((proc, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-renal-text">
                    <Calendar className="w-3.5 h-3.5 text-rs-blue" />
                    {proc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Clinical Events Timeline */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-renal-text">Clinical Events Timeline</h3>
          <div className="flex gap-2">
            <select className="bg-renal-bg border border-renal-border rounded-lg px-3 py-1.5 text-sm text-renal-text">
              <option>All Events</option>
              <option>Hospitalizations</option>
              <option>Access Procedures</option>
              <option>Infections</option>
            </select>
            <select className="bg-renal-bg border border-renal-border rounded-lg px-3 py-1.5 text-sm text-renal-text">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative mb-6">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-renal-border" />
          <div className="relative flex justify-between">
            {['Jan 2024', 'Dec 2023', 'Nov 2023', 'Oct 2023'].map((month, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-rs-blue border-2 border-renal-panel z-10" />
                <span className="text-xs text-renal-muted mt-2">{month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-3 bg-rs-red/10 border border-rs-red/30 rounded-lg">
            <div className="text-xs text-rs-red font-medium mb-1">Jan 5, 2024</div>
            <div className="text-sm font-medium text-renal-text">Hospitalization</div>
            <div className="text-xs text-renal-muted">Pneumonia - 5 days</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-rs-green">
              <CheckCircle className="w-3 h-3" />
              Resolved
            </div>
          </div>

          <div className="p-3 bg-rs-amber/10 border border-rs-amber/30 rounded-lg">
            <div className="text-xs text-rs-amber font-medium mb-1">Dec 12, 2023</div>
            <div className="text-sm font-medium text-renal-text">Access Procedure</div>
            <div className="text-xs text-renal-muted">Fistulogram - 50% stenosis</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-rs-amber">
              <Link2 className="w-3 h-3" />
              Referred
            </div>
          </div>

          <div className="p-3 bg-rs-blue/10 border border-rs-blue/30 rounded-lg">
            <div className="text-xs text-rs-blue font-medium mb-1">Nov 20, 2023</div>
            <div className="text-sm font-medium text-renal-text">Infection</div>
            <div className="text-xs text-renal-muted">CVC exit site erythema</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-rs-green">
              <CheckCircle className="w-3 h-3" />
              Treated
            </div>
          </div>

          <div className="p-3 bg-rs-red/10 border border-rs-red/30 rounded-lg">
            <div className="text-xs text-rs-red font-medium mb-1">Oct 15, 2023</div>
            <div className="text-sm font-medium text-renal-text">Cardiac Event</div>
            <div className="text-xs text-renal-muted">Chest pain - troponin negative</div>
            <div className="mt-2 flex items-center gap-1 text-xs text-renal-muted">
              R/o MI
            </div>
          </div>
        </div>

        {/* Detailed Event Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-renal-border">
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Date</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Description</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Severity</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-renal-muted uppercase">Outcome</th>
              </tr>
            </thead>
            <tbody>
              {mockClinicalEvents.map((event) => (
                <tr key={event.id} className="border-b border-renal-border/50 hover:bg-white/5">
                  <td className="px-4 py-3 text-sm text-renal-text">{event.date}</td>
                  <td className="px-4 py-3 text-sm text-renal-text">{event.type}</td>
                  <td className="px-4 py-3 text-sm text-renal-text">{event.description}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      event.severity === 'High' ? 'bg-rs-red/20 text-rs-red' :
                      event.severity === 'Moderate' ? 'bg-rs-amber/20 text-rs-amber' :
                      'bg-rs-blue/20 text-rs-blue'
                    )}>
                      {event.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-renal-text">{event.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};