import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Link2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockTasks } from '../../data/mockData';
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
      {/* Active Tasks - Full Width */}
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
              className="flex items-start gap-4 p-4 bg-renal-bg rounded-lg border border-renal-border hover:border-rs-blue/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-renal-text">{task.description}</h4>
                    <p className="text-xs text-renal-muted mt-1">
                      Task #{task.id} • Created {new Date(task.createdDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium border',
                      getPriorityColor(task.priority)
                    )}>
                      {task.priority}
                    </span>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium border',
                      task.status === 'Complete' ? 'bg-rs-green/20 text-rs-green border-rs-green/30' :
                      task.status === 'In Progress' ? 'bg-rs-blue/20 text-rs-blue border-rs-blue/30' :
                      'bg-renal-border text-renal-muted border-renal-border'
                    )}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-renal-muted">Assigned to:</span>
                    <span className="font-medium text-renal-text">{task.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-renal-muted">Due date:</span>
                    <span className={cn(
                      'font-medium',
                      new Date(task.dueDate) < new Date() ? 'text-rs-red' : 'text-renal-text'
                    )}>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {new Date(task.dueDate) < new Date() && (
                      <span className="text-xs text-rs-red">(Overdue)</span>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="flex-shrink-0">
                View
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-renal-border flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-renal-muted">
            <AlertTriangle className="w-4 h-4 text-rs-red" />
            <span>2 tasks overdue</span>
          </div>
          <Button variant="secondary" size="sm">
            View All Tasks
          </Button>
        </div>
      </Card>

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
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
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

      </Card>
    </div>
  );
};