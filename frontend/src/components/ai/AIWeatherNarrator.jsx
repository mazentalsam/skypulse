import { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import { useWeather } from '../../context/WeatherContext';
import { fetchAIBriefing } from '../../api/client';

const LANGUAGES = [
  { code: 'en', label: 'EN' }, { code: 'es', label: 'ES' }, { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' }, { code: 'ja', label: 'JA' }, { code: 'zh', label: 'ZH' }, { code: 'pt', label: 'PT' },
];

function formatBriefing(text) {
  if (!text) return null;
  let clean = text.replace(/#{1,3}\s?/g, '').replace(/\*\*/g, '').trim();
  // Remove "New York Weather Briefing" type prefixes
  clean = clean.replace(/^[\w\s]+Weather Briefing\s*/i, '');

  // Split into sentences and group into paragraphs of 2-3 sentences
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const paragraphs = [];
  for (let i = 0; i < sentences.length; i += 3) {
    paragraphs.push(sentences.slice(i, i + 3).join(' ').trim());
  }

  return paragraphs.map((p, i) => {
    // Highlight numbers with units
    const highlighted = p.replace(
      /(\d+\.?\d*\s*(?:°[CF]?|%|km\/h|mph|m\/s|mm|hPa|km|meters|hours?|minutes?|AM|PM))/g,
      '<b style="color:var(--text);font-weight:500">$1</b>'
    );
    return <p key={i} style={{ margin: i > 0 ? '10px 0 0' : 0 }} dangerouslySetInnerHTML={{ __html: highlighted }} />;
  });
}

export default function AIWeatherNarrator() {
  const { aiBriefing, aiLoading, location, weather } = useWeather();
  const [lang, setLang] = useState('en');
  const [translatedText, setTranslatedText] = useState(null);
  const [loadingLang, setLoadingLang] = useState(false);

  if (!weather) return null;

  const rawText = lang === 'en' ? aiBriefing : (translatedText || aiBriefing);

  const handleLangChange = async (code) => {
    setLang(code);
    if (code === 'en') { setTranslatedText(null); return; }
    setLoadingLang(true);
    const { data } = await fetchAIBriefing(weather, location?.city || '', code);
    setLoadingLang(false);
    if (data?.briefing) setTranslatedText(data.briefing);
  };

  return (
    <GlassCard className="rise stagger-1" accentBorder="var(--accent)">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11.5, color: 'var(--muted-2)', fontFamily: 'var(--mono)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
          Weather Narrator
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {LANGUAGES.map(l => (
            <button key={l.code} onClick={() => handleLangChange(l.code)} style={{
              padding: '3px 7px', fontSize: 10, borderRadius: 4, fontFamily: 'var(--mono)',
              fontWeight: lang === l.code ? 600 : 400,
              background: lang === l.code ? 'rgba(59,130,246,.12)' : 'transparent',
              color: lang === l.code ? 'var(--accent-2)' : 'var(--muted-2)',
              border: `1px solid ${lang === l.code ? 'rgba(59,130,246,.2)' : 'transparent'}`,
              transition: 'all .15s',
            }}>{l.label}</button>
          ))}
        </div>
      </div>
      <h3 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 500 }}>
        {location?.city ? `${location.city} weather briefing` : 'Weather briefing'}
      </h3>
      {aiLoading && !aiBriefing ? (
        <div>
          {[100, 90, 95, 60].map((w, i) => (
            <div key={i} className="skeleton" style={{ height: 13, width: `${w}%`, marginBottom: 10 }} />
          ))}
        </div>
      ) : (
        <div style={{
          color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7,
          opacity: loadingLang ? 0.4 : 1, transition: 'opacity .2s',
        }}>
          {formatBriefing(rawText) || <span style={{ color: 'var(--muted-2)' }}>Generating briefing...</span>}
        </div>
      )}
    </GlassCard>
  );
}
