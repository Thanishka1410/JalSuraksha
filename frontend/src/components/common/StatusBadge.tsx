import React from 'react';
import { classNames, getStatusColor, getPriorityColor, getSeverityColor } from '../../utils/helpers';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  type?: 'status' | 'priority' | 'severity';
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  dot = true,
  type = 'status',
}) => {
  const getColorClass = () => {
    switch (type) {
      case 'priority':
        return getPriorityColor(status);
      case 'severity':
        return getSeverityColor(status);
      default:
        return getStatusColor(status);
    }
  };

  const getDotColor = () => {
    if (status.includes('active') || status.includes('safe') || status.includes('resolved') || status.includes('open')) {
      return 'bg-success-500';
    }
    if (status.includes('maintenance') || status.includes('caution') || status.includes('pending') || status.includes('partial')) {
      return 'bg-accent-500';
    }
    if (status.includes('inactive') || status.includes('closed')) {
      return 'bg-gray-500';
    }
    if (status.includes('faulty') || status.includes('unsafe') || status.includes('critical') || status.includes('damaged')) {
      return 'bg-danger-500';
    }
    return 'bg-gray-500';
  };

  const formatStatus = (str: string) => {
    return str
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        getColorClass(),
        sizeClasses[size]
      )}
    >
      {dot && (
        <span className={classNames('w-2 h-2 rounded-full', getDotColor())} />
      )}
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
