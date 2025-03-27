import React from 'react';

export const CorkIcon = () => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="30" cy="30" r="28" stroke="#4A0404" strokeWidth="4"/>
    <path d="M20 30C20 24.4772 24.4772 20 30 20C35.5228 20 40 24.4772 40 30C40 35.5228 35.5228 40 30 40" stroke="#4A0404" strokeWidth="4"/>
    <circle cx="30" cy="30" r="5" fill="#4A0404"/>
  </svg>
);

interface FlagProps {
  countryCode: string;
}

export const FlagIcon: React.FC<FlagProps> = ({ countryCode }) => {
  // Mapa de bandeiras por país
  const flags: Record<string, React.ReactNode> = {
    'argentina': (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="29" fill="white" stroke="#000000" strokeWidth="2"/>
        <path d="M10 20H50V40H10V20Z" fill="#75AADB"/>
        <path d="M10 20H50V26.6667H10V20Z" fill="white"/>
        <path d="M10 33.3333H50V40H10V33.3333Z" fill="white"/>
        <circle cx="30" cy="30" r="5" fill="#F4B32E"/>
      </svg>
    ),
    'france': (
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="29" fill="white" stroke="#000000" strokeWidth="2"/>
        <path d="M10 20H20V40H10V20Z" fill="#002395"/>
        <path d="M20 20H40V40H20V20Z" fill="white"/>
        <path d="M40 20H50V40H40V20Z" fill="#ED2939"/>
      </svg>
    ),
    // Adicione mais bandeiras conforme necessário
  };

  return (
    <div className="relative w-[60px] h-[60px]">
      {flags[countryCode.toLowerCase()] || (
        // Bandeira padrão caso o país não seja encontrado
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="30" cy="30" r="29" fill="white" stroke="#000000" strokeWidth="2"/>
        </svg>
      )}
    </div>
  );
}; 