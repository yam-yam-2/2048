import { ThemeMode } from '../types';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  appBg: string;
  boardBg: string;
  cellBg: string;
  headerBoxBg: string;
  headerAccent: string;
  getTileStyle: (value: number) => string;
}

export const THEMES: Record<ThemeMode, ThemeConfig> = {
  classic: {
    id: 'classic',
    name: '클래식 베이지',
    appBg: 'bg-[#FAF8EF] text-[#776E65]',
    boardBg: 'bg-[#BBADA0]',
    cellBg: 'bg-[#CDC1B4]/70',
    headerBoxBg: 'bg-[#8F7A66]',
    headerAccent: 'bg-amber-200 text-amber-900 border-amber-300',
    getTileStyle: (value: number) => {
      switch (value) {
        case 2:
          return 'bg-[#EEE4DA] text-[#776E65]';
        case 4:
          return 'bg-[#EDE0C8] text-[#776E65]';
        case 8:
          return 'bg-[#F2B179] text-[#F9F6F2] font-bold';
        case 16:
          return 'bg-[#F59563] text-[#F9F6F2] font-bold';
        case 32:
          return 'bg-[#F67C5F] text-[#F9F6F2] font-bold';
        case 64:
          return 'bg-[#F65E3B] text-[#F9F6F2] font-bold';
        case 128:
          return 'bg-[#EDCF72] text-[#F9F6F2] font-bold shadow-xs';
        case 256:
          return 'bg-[#EDCC61] text-[#F9F6F2] font-bold shadow-xs';
        case 512:
          return 'bg-[#EDC850] text-[#F9F6F2] font-bold shadow-xs';
        case 1024:
          return 'bg-[#EDC53F] text-[#F9F6F2] font-bold shadow-sm';
        case 2048:
          return 'bg-[#EDC22E] text-[#F9F6F2] font-extrabold shadow-md ring-2 ring-amber-300 animate-pulse';
        default:
          return 'bg-[#3C3A32] text-[#F9F6F2] font-extrabold shadow-md';
      }
    },
  },

  dark: {
    id: 'dark',
    name: '다크 네온',
    appBg: 'bg-slate-900 text-slate-100',
    boardBg: 'bg-slate-800',
    cellBg: 'bg-slate-700/50',
    headerBoxBg: 'bg-slate-700',
    headerAccent: 'bg-indigo-900 text-indigo-200 border-indigo-700',
    getTileStyle: (value: number) => {
      switch (value) {
        case 2:
          return 'bg-slate-700 text-slate-200';
        case 4:
          return 'bg-slate-600 text-slate-100';
        case 8:
          return 'bg-blue-600 text-white font-bold shadow-xs';
        case 16:
          return 'bg-indigo-600 text-white font-bold shadow-xs';
        case 32:
          return 'bg-purple-600 text-white font-bold shadow-xs';
        case 64:
          return 'bg-pink-600 text-white font-bold shadow-xs';
        case 128:
          return 'bg-rose-500 text-white font-bold shadow-sm';
        case 256:
          return 'bg-cyan-500 text-slate-950 font-bold shadow-sm';
        case 512:
          return 'bg-teal-400 text-slate-950 font-bold shadow-md';
        case 1024:
          return 'bg-emerald-400 text-slate-950 font-extrabold shadow-md';
        case 2048:
          return 'bg-amber-400 text-slate-950 font-black shadow-lg ring-2 ring-amber-300 animate-pulse';
        default:
          return 'bg-violet-500 text-white font-black shadow-lg';
      }
    },
  },

  pastel: {
    id: 'pastel',
    name: '파스텔 마카롱',
    appBg: 'bg-pink-50/90 text-pink-950',
    boardBg: 'bg-pink-200/80',
    cellBg: 'bg-white/70',
    headerBoxBg: 'bg-pink-400',
    headerAccent: 'bg-pink-200 text-pink-900 border-pink-300',
    getTileStyle: (value: number) => {
      switch (value) {
        case 2:
          return 'bg-pink-100 text-pink-900';
        case 4:
          return 'bg-purple-100 text-purple-900';
        case 8:
          return 'bg-sky-200 text-sky-950 font-bold';
        case 16:
          return 'bg-teal-200 text-teal-950 font-bold';
        case 32:
          return 'bg-emerald-200 text-emerald-950 font-bold';
        case 64:
          return 'bg-amber-200 text-amber-950 font-bold';
        case 128:
          return 'bg-orange-300 text-orange-950 font-bold shadow-xs';
        case 256:
          return 'bg-rose-300 text-rose-950 font-bold shadow-xs';
        case 512:
          return 'bg-fuchsia-300 text-fuchsia-950 font-bold shadow-xs';
        case 1024:
          return 'bg-violet-300 text-violet-950 font-extrabold shadow-sm';
        case 2048:
          return 'bg-pink-400 text-white font-black shadow-md ring-2 ring-pink-300 animate-pulse';
        default:
          return 'bg-purple-400 text-white font-black shadow-md';
      }
    },
  },

  emerald: {
    id: 'emerald',
    name: '에메랄드 숲',
    appBg: 'bg-emerald-50 text-emerald-950',
    boardBg: 'bg-emerald-800/80',
    cellBg: 'bg-emerald-900/40',
    headerBoxBg: 'bg-emerald-700',
    headerAccent: 'bg-teal-200 text-teal-950 border-teal-300',
    getTileStyle: (value: number) => {
      switch (value) {
        case 2:
          return 'bg-emerald-100 text-emerald-900';
        case 4:
          return 'bg-teal-100 text-teal-900';
        case 8:
          return 'bg-teal-400 text-slate-950 font-bold';
        case 16:
          return 'bg-emerald-500 text-white font-bold';
        case 32:
          return 'bg-green-600 text-white font-bold';
        case 64:
          return 'bg-lime-500 text-slate-950 font-bold';
        case 128:
          return 'bg-yellow-400 text-slate-950 font-bold shadow-xs';
        case 256:
          return 'bg-amber-500 text-white font-bold shadow-xs';
        case 512:
          return 'bg-orange-500 text-white font-bold shadow-xs';
        case 1024:
          return 'bg-rose-500 text-white font-extrabold shadow-sm';
        case 2048:
          return 'bg-emerald-300 text-emerald-950 font-black shadow-md ring-2 ring-emerald-200 animate-pulse';
        default:
          return 'bg-teal-800 text-white font-black shadow-md';
      }
    },
  },

  sunset: {
    id: 'sunset',
    name: '노을 선셋',
    appBg: 'bg-orange-50/90 text-stone-800',
    boardBg: 'bg-stone-700/85',
    cellBg: 'bg-stone-600/50',
    headerBoxBg: 'bg-orange-700',
    headerAccent: 'bg-orange-200 text-orange-950 border-orange-300',
    getTileStyle: (value: number) => {
      switch (value) {
        case 2:
          return 'bg-orange-100 text-stone-800';
        case 4:
          return 'bg-amber-100 text-stone-800';
        case 8:
          return 'bg-amber-400 text-amber-950 font-bold';
        case 16:
          return 'bg-orange-400 text-white font-bold';
        case 32:
          return 'bg-orange-600 text-white font-bold';
        case 64:
          return 'bg-rose-500 text-white font-bold';
        case 128:
          return 'bg-pink-600 text-white font-bold shadow-xs';
        case 256:
          return 'bg-purple-600 text-white font-bold shadow-xs';
        case 512:
          return 'bg-indigo-600 text-white font-bold shadow-xs';
        case 1024:
          return 'bg-amber-300 text-amber-950 font-extrabold shadow-sm';
        case 2048:
          return 'bg-red-500 text-white font-black shadow-md ring-2 ring-orange-300 animate-pulse';
        default:
          return 'bg-rose-700 text-white font-black shadow-md';
      }
    },
  },
};
