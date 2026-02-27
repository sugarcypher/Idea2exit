import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDocumentTypeLabel(type) {
  const labels = {
    white_paper: 'White Paper',
    business_plan: 'Business Plan',
    pitch_deck: 'Pitch Deck',
    market_research: 'Market Research',
    marketing_strategy: 'Marketing Strategy',
    ip_protection: 'IP Protection Guide',
  };
  return labels[type] || type;
}

export function getDocumentTypeIcon(type) {
  const icons = {
    white_paper: 'FileText',
    business_plan: 'Briefcase',
    pitch_deck: 'Presentation',
    market_research: 'TrendingUp',
    marketing_strategy: 'Megaphone',
    ip_protection: 'Shield',
  };
  return icons[type] || 'File';
}

export function getAgentRoleColor(role) {
  const colors = {
    manager: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    specialist: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    worker: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  };
  return colors[role] || 'text-gray-400 bg-gray-500/10 border-gray-500/30';
}

export function getAgentStatusColor(status) {
  const colors = {
    idle: 'text-slate-400',
    working: 'text-blue-400',
    completed: 'text-emerald-400',
    error: 'text-red-400',
  };
  return colors[status] || 'text-slate-400';
}

export function downloadFile(content, filename, type = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function truncateText(text, maxLength = 100) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
