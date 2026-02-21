import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface IconProps {
  size?: number;
}

// ─── PROVIDER ICONS ───────────────────────────────────────────────────────────

// Groq — https://lobehub.com/ru/icons/groq
export const GroqIcon: React.FC<IconProps> = ({ size = 20 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg fill={fg} fillRule="evenodd" height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Groq</title>
      <path d="M12.036 2c-3.853-.035-7 3-7.036 6.781-.035 3.782 3.055 6.872 6.908 6.907h2.42v-2.566h-2.292c-2.407.028-4.38-1.866-4.408-4.23-.029-2.362 1.901-4.298 4.308-4.326h.1c2.407 0 4.358 1.915 4.365 4.278v6.305c0 2.342-1.944 4.25-4.323 4.279a4.375 4.375 0 01-3.033-1.252l-1.851 1.818A7 7 0 0012.029 22h.092c3.803-.056 6.858-3.083 6.879-6.816v-6.5C18.907 4.963 15.817 2 12.036 2z" />
    </svg>
  );
};

// Cerebras — https://lobehub.com/ru/icons/cerebras (PNG, using geometric SVG)
export const CerebrasIcon: React.FC<IconProps> = ({ size = 20 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="28" stroke={fg} strokeWidth="3" fill="none"/>
      <circle cx="32" cy="32" r="18" stroke={fg} strokeWidth="3" fill="none"/>
      <circle cx="32" cy="32" r="8" fill={fg}/>
      <line x1="32" y1="4" x2="32" y2="14" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
      <line x1="32" y1="50" x2="32" y2="60" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
      <line x1="4" y1="32" x2="14" y2="32" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
      <line x1="50" y1="32" x2="60" y2="32" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
      <line x1="11.5" y1="11.5" x2="18.5" y2="18.5" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
      <line x1="45.5" y1="45.5" x2="52.5" y2="52.5" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
      <line x1="52.5" y1="11.5" x2="45.5" y2="18.5" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
      <line x1="18.5" y1="45.5" x2="11.5" y2="52.5" stroke={fg} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
};

// Google AI — https://lobehub.com/ru/icons/google
export const GoogleIcon: React.FC<IconProps> = ({ size = 20 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg fill={fg} fillRule="evenodd" height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" />
      <path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" />
      <path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" />
      <path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" />
    </svg>
  );
};

// OpenRouter — https://lobehub.com/ru/icons/openrouter
export const OpenRouterIcon: React.FC<IconProps> = ({ size = 20 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg fill={fg} fillRule="evenodd" height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>OpenRouter</title>
      <path d="M16.804 1.957l7.22 4.105v.087L16.73 10.21l.017-2.117-.821-.03c-1.059-.028-1.611.002-2.268.11-1.064.175-2.038.577-3.147 1.352L8.345 11.03c-.284.195-.495.336-.68.455l-.515.322-.397.234.385.23.53.338c.476.314 1.17.796 2.701 1.866 1.11.775 2.083 1.177 3.147 1.352l.3.045c.694.091 1.375.094 2.825.033l.022-2.159 7.22 4.105v.087L16.589 22l.014-1.862-.635.022c-1.386.042-2.137.002-3.138-.162-1.694-.28-3.26-.926-4.881-2.059l-2.158-1.5a21.997 21.997 0 00-.755-.498l-.467-.28a55.927 55.927 0 00-.76-.43C2.908 14.73.563 14.116 0 14.116V9.888l.14.004c.564-.007 2.91-.622 3.809-1.124l1.016-.58.438-.274c.428-.28 1.072-.726 2.686-1.853 1.621-1.133 3.186-1.78 4.881-2.059 1.152-.19 1.974-.213 3.814-.138l.02-1.907z" />
    </svg>
  );
};

// Together AI — https://lobehub.com/ru/icons/together
export const TogetherIcon: React.FC<IconProps> = ({ size = 20 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg fill={fg} fillRule="evenodd" height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>together.ai</title>
      <path d="M17.385 11.23a4.615 4.615 0 100-9.23 4.615 4.615 0 000 9.23zm0 10.77a4.615 4.615 0 100-9.23 4.615 4.615 0 000 9.23zm-10.77 0a4.615 4.615 0 100-9.23 4.615 4.615 0 000 9.23z" opacity=".4" />
      <circle cx="6.615" cy="6.615" r="4.615" />
    </svg>
  );
};

// SambaNova — https://lobehub.com/ru/icons/sambanova
export const SambaNovaIcon: React.FC<IconProps> = ({ size = 20 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg fill={fg} fillRule="evenodd" height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>SambaNova</title>
      <path d="M23 23h-1.223V8.028c0-3.118-2.568-5.806-5.744-5.806H8.027c-3.176 0-5.744 2.565-5.744 5.686 0 3.119 2.568 5.684 5.744 5.684h.794c1.346 0 2.445 1.1 2.445 2.444 0 1.346-1.1 2.446-2.445 2.446H1v-1.223h7.761c.671 0 1.223-.551 1.223-1.16 0-.67-.552-1.16-1.223-1.16h-.794C4.177 14.872 1 11.756 1 7.909 1 4.058 4.176 1 8.027 1h8.066C19.88 1 23 4.239 23 8.028V23z" />
      <path d="M8.884 12.672c1.71.06 3.361 1.588 3.361 3.422 0 1.833-1.528 3.421-3.421 3.421H1v1.223h7.761c2.568 0 4.705-2.077 4.705-4.644 0-.672-.123-1.283-.43-1.894-.245-.551-.67-1.1-1.099-1.528-.489-.429-1.039-.734-1.65-.977-.525-.175-1.048-.193-1.594-.212-.218-.008-.441-.016-.669-.034-.428 0-1.406-.245-1.956-.61a3.369 3.369 0 01-1.223-1.406c-.183-.489-.305-.977-.305-1.528A3.417 3.417 0 017.96 4.482h8.066c1.895 0 3.422 1.65 3.422 3.483v15.032h1.223V8.027c0-2.568-2.077-4.768-4.645-4.768h-8c-2.568 0-4.705 2.077-4.705 4.646 0 .67.123 1.282.43 1.894a4.45 4.45 0 001.099 1.528c.429.428 1.039.734 1.588.976.306.123.611.183.976.246.857.06 1.406.123 1.466.123h.003z" />
      <path d="M1 23h7.761v-.003c3.85 0 7.03-3.116 7.09-7.026 0-3.79-3.117-6.906-6.967-6.906H8.09c-.672 0-1.222-.552-1.222-1.16 0-.608.487-1.16 1.159-1.16h8.069c.608 0 1.159.611 1.159 1.283v14.97h1.223V8.024c0-1.345-1.1-2.505-2.445-2.505H7.967a2.451 2.451 0 00-2.445 2.445 2.45 2.45 0 002.445 2.445h.794c3.176 0 5.744 2.568 5.744 5.684s-2.568 5.684-5.744 5.684H1V23z" />
    </svg>
  );
};

// Ollama / Llama — https://lobehub.com/ru/icons/ollama
export const OllamaIcon: React.FC<IconProps> = ({ size = 20 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg fill={fg} fillRule="evenodd" height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Ollama</title>
      <path d="M7.905 1.09c.216.085.411.225.588.41.295.306.544.744.734 1.263.191.522.315 1.1.362 1.68a5.054 5.054 0 012.049-.636l.051-.004c.87-.07 1.73.087 2.48.474.101.053.2.11.297.17.05-.569.172-1.134.36-1.644.19-.52.439-.957.733-1.264a1.67 1.67 0 01.589-.41c.257-.1.53-.118.796-.042.401.114.745.368 1.016.737.248.337.434.769.561 1.287.23.934.27 2.163.115 3.645l.053.04.026.019c.757.576 1.284 1.397 1.563 2.35.435 1.487.216 3.155-.534 4.088l-.018.021.002.003c.417.762.67 1.567.724 2.4l.002.03c.064 1.065-.2 2.137-.814 3.19l-.007.01.01.024c.472 1.157.62 2.322.438 3.486l-.006.039a.651.651 0 01-.747.536.648.648 0 01-.54-.742c.167-1.033.01-2.069-.48-3.123a.643.643 0 01.04-.617l.004-.006c.604-.924.854-1.83.8-2.72-.046-.779-.325-1.544-.8-2.273a.644.644 0 01.18-.886l.009-.006c.243-.159.467-.565.58-1.12a4.229 4.229 0 00-.095-1.974c-.205-.7-.58-1.284-1.105-1.683-.595-.454-1.383-.673-2.38-.61a.653.653 0 01-.632-.371c-.314-.665-.772-1.141-1.343-1.436a3.288 3.288 0 00-1.772-.332c-1.245.099-2.343.801-2.67 1.686a.652.652 0 01-.61.425c-1.067.002-1.893.252-2.497.703-.522.39-.878.935-1.066 1.588a4.07 4.07 0 00-.068 1.886c.112.558.331 1.02.582 1.269l.008.007c.212.207.257.53.109.785-.36.622-.629 1.549-.673 2.44-.05 1.018.186 1.902.719 2.536l.016.019a.643.643 0 01.095.69c-.576 1.236-.753 2.252-.562 3.052a.652.652 0 01-1.269.298c-.243-1.018-.078-2.184.473-3.498l.014-.035-.008-.012a4.339 4.339 0 01-.598-1.309l-.005-.019a5.764 5.764 0 01-.177-1.785c.044-.91.278-1.842.622-2.59l.012-.026-.002-.002c-.293-.418-.51-.953-.63-1.545l-.005-.024a5.352 5.352 0 01.093-2.49c.262-.915.777-1.701 1.536-2.269.06-.045.123-.09.186-.132-.159-1.493-.119-2.73.112-3.67.127-.518.314-.95.562-1.287.27-.368.614-.622 1.015-.737.266-.076.54-.059.797.042zm4.116 9.09c.936 0 1.8.313 2.446.855.63.527 1.005 1.235 1.005 1.94 0 .888-.406 1.58-1.133 2.022-.62.375-1.451.557-2.403.557-1.009 0-1.871-.259-2.493-.734-.617-.47-.963-1.13-.963-1.845 0-.707.398-1.417 1.056-1.946.668-.537 1.55-.849 2.485-.849zm0 .896a3.07 3.07 0 00-1.916.65c-.461.37-.722.835-.722 1.25 0 .428.21.829.61 1.134.455.347 1.124.548 1.943.548.799 0 1.473-.147 1.932-.426.463-.28.7-.686.7-1.257 0-.423-.246-.89-.683-1.256-.484-.405-1.14-.643-1.864-.643zm.662 1.21l.004.004c.12.151.095.37-.056.49l-.292.23v.446a.375.375 0 01-.376.373.375.375 0 01-.376-.373v-.46l-.271-.218a.347.347 0 01-.052-.49.353.353 0 01.494-.051l.215.172.22-.174a.353.353 0 01.49.051zm-5.04-1.919c.478 0 .867.39.867.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zm8.706 0c.48 0 .868.39.868.871a.87.87 0 01-.868.871.87.87 0 01-.867-.87.87.87 0 01.867-.872zM7.44 2.3l-.003.002a.659.659 0 00-.285.238l-.005.006c-.138.189-.258.467-.348.832-.17.692-.216 1.631-.124 2.782.43-.128.899-.208 1.404-.237l.01-.001.019-.034c.046-.082.095-.161.148-.239.123-.771.022-1.692-.253-2.444-.134-.364-.297-.65-.453-.813a.628.628 0 00-.107-.09L7.44 2.3zm9.174.04l-.002.001a.628.628 0 00-.107.09c-.156.163-.32.45-.453.814-.29.794-.387 1.776-.23 2.572l.058.097.008.014h.03a5.184 5.184 0 011.466.212c.086-1.124.038-2.043-.128-2.722-.09-.365-.21-.643-.349-.832l-.004-.006a.659.659 0 00-.285-.239h-.004z" />
    </svg>
  );
};

// ─── MODEL ICONS ──────────────────────────────────────────────────────────────

// Llama (Meta) — same as Ollama icon
export const LlamaIcon: React.FC<IconProps> = ({ size = 16 }) => {
  return <OllamaIcon size={size} />;
};

// Gemini (Google) — using Google icon
export const GeminiIcon: React.FC<IconProps> = ({ size = 16 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg fill={fg} fillRule="evenodd" height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Google</title>
      <path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" />
      <path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" />
      <path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" />
      <path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" />
    </svg>
  );
};

// Mixtral — https://www.shadcn.io/icon/ri-mixtral-line
export const MistralIcon: React.FC<IconProps> = ({ size = 16 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={fg}>
      <path d="M3 3h5.2v3.2h3.2v3.2h1.2V6.2h3.2V3H21v18h-5.2v-6.4h-1.2v3.2H9.4v-3.2H8.2V21H3zm2 2v14h1.2v-6.4h5.2v3.2h1.2v-3.2h5.2V19H19V5h-1.2v3.2h-3.2v3.2H9.4V8.2H6.2V5z" />
    </svg>
  );
};

// Qwen (Alibaba)
export const QwenIcon: React.FC<IconProps> = ({ size = 16 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="9" stroke={fg} strokeWidth="1.5" fill="none"/>
      <circle cx="12" cy="12" r="3" fill={fg}/>
      <line x1="12" y1="3" x2="12" y2="7" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12" y1="17" x2="12" y2="21" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="12" x2="7" y2="12" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="17" y1="12" x2="21" y2="12" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

// DeepSeek
export const DeepSeekIcon: React.FC<IconProps> = ({ size = 16 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 4a5 5 0 010 10A5 5 0 0112 7zm0 2a3 3 0 100 6 3 3 0 000-6z" fill={fg}/>
      <path d="M19.5 4.5l-3 3M4.5 4.5l3 3" stroke={fg} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
};

// Gemma (Google) — https://lobehub.com/ru/icons/gemma
export const GemmaIcon: React.FC<IconProps> = ({ size = 16 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg fill={fg} fillRule="evenodd" height={size} width={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>Gemma</title>
      <path d="M12.34 5.953a8.233 8.233 0 01-.247-1.125V3.72a8.25 8.25 0 015.562 2.232H12.34zm-.69 0c.113-.373.199-.755.257-1.145V3.72a8.25 8.25 0 00-5.562 2.232h5.304zm-5.433.187h5.373a7.98 7.98 0 01-.267.696 8.41 8.41 0 01-1.76 2.65L6.216 6.14zm-.264-.187H2.977v.187h2.915a8.436 8.436 0 00-2.357 5.767H0v.186h3.535a8.436 8.436 0 002.357 5.767H2.977v.186h2.976v2.977h.187v-2.915a8.436 8.436 0 005.767 2.357V24h.186v-3.535a8.436 8.436 0 005.767-2.357v2.915h.186v-2.977h2.977v-.186h-2.915a8.436 8.436 0 002.357-5.767H24v-.186h-3.535a8.436 8.436 0 00-2.357-5.767h2.915v-.187h-2.977V2.977h-.186v2.915a8.436 8.436 0 00-5.767-2.357V0h-.186v3.535A8.436 8.436 0 006.14 5.892V2.977h-.187v2.976zm6.14 14.326a8.25 8.25 0 005.562-2.233H12.34c-.108.367-.19.743-.247 1.126v1.107zm-.186-1.087a8.015 8.015 0 00-.258-1.146H6.345a8.25 8.25 0 005.562 2.233v-1.087zm-8.186-7.285h1.107a8.23 8.23 0 001.125-.247V6.345a8.25 8.25 0 00-2.232 5.562zm1.087.186H3.72a8.25 8.25 0 002.232 5.562v-5.304a8.012 8.012 0 00-1.145-.258zm15.47-.186a8.25 8.25 0 00-2.232-5.562v5.315c.367.108.743.19 1.126.247h1.107zm-1.086.186c-.39.058-.772.144-1.146.258v5.304a8.25 8.25 0 002.233-5.562h-1.087zm-1.332 5.69V12.41a7.97 7.97 0 00-.696.267 8.409 8.409 0 00-2.65 1.76l3.346 3.346zm0-6.18v-5.45l-.012-.013h-5.451c.076.235.162.468.26.696a8.698 8.698 0 001.819 2.688 8.698 8.698 0 002.688 1.82c.228.097.46.183.696.259zM6.14 17.848V12.41c.235.078.468.167.696.267a8.403 8.403 0 012.688 1.799 8.404 8.404 0 011.799 2.688c.1.228.19.46.267.696H6.152l-.012-.012zm0-6.245V6.326l3.29 3.29a8.716 8.716 0 01-2.594 1.728 8.14 8.14 0 01-.696.259zm6.257 6.257h5.277l-3.29-3.29a8.716 8.716 0 00-1.728 2.594 8.135 8.135 0 00-.259.696zm-2.347-7.81a9.435 9.435 0 01-2.88 1.96 9.14 9.14 0 012.88 1.94 9.14 9.14 0 011.94 2.88 9.435 9.435 0 011.96-2.88 9.14 9.14 0 012.88-1.94 9.435 9.435 0 01-2.88-1.96 9.434 9.434 0 01-1.96-2.88 9.14 9.14 0 01-1.94 2.88z" />
    </svg>
  );
};

// Microsoft Phi
export const PhiIcon: React.FC<IconProps> = ({ size = 16 }) => {
  const { theme } = useTheme();
  const fg = theme === 'light' ? '#000000' : '#ffffff';
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="9" height="9" fill={fg}/>
      <rect x="13" y="2" width="9" height="9" fill={fg}/>
      <rect x="2" y="13" width="9" height="9" fill={fg}/>
      <rect x="13" y="13" width="9" height="9" fill={fg}/>
    </svg>
  );
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function getProviderIcon(providerId: string, size = 20): React.ReactNode {
  switch (providerId) {
    case 'groq':       return <GroqIcon size={size} />;
    case 'google':     return <GoogleIcon size={size} />;
    case 'openrouter': return <OpenRouterIcon size={size} />;
    case 'cerebras':   return <CerebrasIcon size={size} />;
    case 'together':   return <TogetherIcon size={size} />;
    case 'sambanova':  return <SambaNovaIcon size={size} />;
    default: return (
      <span style={{
        width: size, height: size, borderRadius: 6,
        background: '#333', display: 'inline-flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.4, color: '#fff', fontWeight: 700,
      }}>
        {providerId[0]?.toUpperCase()}
      </span>
    );
  }
}

export function getModelIcon(modelId: string, size = 14): React.ReactNode {
  const id = modelId.toLowerCase();
  if (id.includes('llama'))                             return <LlamaIcon size={size} />;
  if (id.includes('gemini'))                            return <GeminiIcon size={size} />;
  if (id.includes('gemma'))                             return <GemmaIcon size={size} />;
  if (id.includes('mistral') || id.includes('mixtral')) return <MistralIcon size={size} />;
  if (id.includes('qwen') || id.includes('qwq'))        return <QwenIcon size={size} />;
  if (id.includes('deepseek'))                          return <DeepSeekIcon size={size} />;
  if (id.includes('phi'))                               return <PhiIcon size={size} />;
  return (
    <span style={{
      width: size, height: size, borderRadius: 4,
      background: '#444', display: 'inline-flex',
      alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.55, color: '#fff', fontWeight: 700,
    }}>
      {modelId[0]?.toUpperCase()}
    </span>
  );
}
