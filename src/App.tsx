import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, Gift, Music, ChevronRight, Stars, Volume2, VolumeX, Camera, Search, Trophy, Lock, Unlock, Settings, Save, X, Plus, Trash2, Layout, Type, Download, Globe, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

// Types
interface PortfolioItem {
  title: string;
  content: string;
  image: string;
}

interface AppData {
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  musicUrl: string;
  landingTitle: string;
  landingSubtitle: string;
  winTitle: string;
  winSubtitle: string;
  portfolioItems: PortfolioItem[];
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DEFAULT_DATA: AppData = {
  birthDay: "03",
  birthMonth: "03",
  birthYear: "2000",
  musicUrl: "/assets/audio/music.mp3",
  landingTitle: "Olá, meu amor.",
  landingSubtitle: "O tempo para quando estou contigo. Mas para avançar, precisas de provar que és a minha pessoa favorita...",
  winTitle: "Sempre soube que eras tu.",
  winSubtitle: "O meu coração nunca se engana. Agora, deixa-me levar-te numa viagem pelas nossas memórias...",
  portfolioItems: [
    { title: "Parabéns", content: "Minha bela adormecida, parabéns por mais um ano de vida!", image: "/assets/images/image1.jpg" },
    { title: "A Nossa História", content: "Agradeço por seres essa parceira dedicada, por valorizares aquilo que estamos a construir e por permitires que eu faça parte da tua história.", image: "/assets/images/image2.jpg" },
    { title: "A Tua Determinação", content: "Admiro profundamente a tua determinação e a forma como encaras a vida com esse sorriso contagiante, mesmo quando o mundo parece não estar a sorrir para ti.", image: "/assets/images/image3.jpg" },
    { title: "O Teu Cuidado", content: "Amo o teu jeito de te preocupares genuinamente com o bem-estar das pessoas que amas e a maneira como tentas ajudá-las a tornarem-se melhores.", image: "/assets/images/image4.jpg" },
    { title: "A Minha Visão", content: "Às vezes penso que, se mais pessoas conseguissem ver esse lado teu como eu vejo, talvez pensassem duas vezes antes de te magoar.", image: "/assets/images/image5.jpg" },
    { title: "A Minha Melhor Escolha", content: "Tu és, sem dúvida, a minha escolha mais complexa — mas, de longe, a melhor que já fiz.", image: "/assets/images/image6.jpg" },
    { title: "Resiliência", content: "Quando a vida te dá limões, tu não apenas fazes limonada: ainda ofereces um copo a quem quiser, de bom grado.", image: "/assets/images/image7.jpg" },
    { title: "O Meu Desejo", content: "Desejo-te muitos e muitos anos de vida. Que Deus continue a guiar os teus passos e a realizar os teus sonhos mais profundos e os desejos mais sinceros do teu coração.", image: "/assets/images/image8.jpg" }
  ]
};

interface FallingItem {
  id: number;
  value: string;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  isWrong?: boolean;
}

const Typewriter = ({ text, speed = 50, delay = 0 }: { text: string; speed?: number; delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, started]);

  return <span>{displayedText}</span>;
};

const HeartParticle = ({ delay, left, size }: { delay: number; left: string; size: number }) => (
  <motion.div
    initial={{ y: "110vh", opacity: 0, rotate: 0 }}
    animate={{ 
      y: "-10vh", 
      opacity: [0, 0.8, 0],
      rotate: 360 
    }}
    transition={{ 
      duration: 10 + Math.random() * 10, 
      repeat: Infinity, 
      delay,
      ease: "linear"
    }}
    className="absolute text-red-400/20 pointer-events-none"
    style={{ left, fontSize: `${size}px` }}
  >
    ❤
  </motion.div>
);

export default function App() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [configUrl, setConfigUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('birthday_config_url') || '/config.json';
    } catch (e) {
      console.error('LocalStorage access failed:', e);
      return '/config.json';
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<'landing' | 'game' | 'win' | 'portfolio' | 'admin'>('landing');
  const [adminTab, setAdminTab] = useState<'general' | 'music' | 'messages' | 'config'>('general');
  const [gameStage, setGameStage] = useState<'day' | 'month' | 'year'>('day');
  const [fallingItems, setFallingItems] = useState<FallingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [hasShownSpecialPhoto, setHasShownSpecialPhoto] = useState(false);
  const [isShowingSpecialPhoto, setIsShowingSpecialPhoto] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load configuration
  const loadConfig = useCallback(async (url: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Falha ao carregar o arquivo de configuração');
      const json = await response.json();
      setData(json);
      try {
        localStorage.setItem('birthday_config_url', url);
      } catch (e) {
        console.error('LocalStorage set failed:', e);
      }
    } catch (err) {
      console.error(err);
      setError('Não foi possível carregar a configuração. Usando dados padrão.');
      setData(DEFAULT_DATA);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig(configUrl);
  }, []);

  const triggerConfetti = useCallback(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff0000', '#ff69b4', '#ffffff']
    });
  }, []);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(e => console.log("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  // Game Logic
  useEffect(() => {
    if (view !== 'game') {
      setFallingItems([]);
      return;
    }

    const interval = setInterval(() => {
      setFallingItems(prev => {
        const target = gameStage === 'day' ? data.birthDay : 
                      gameStage === 'month' ? MONTH_NAMES[parseInt(data.birthMonth) - 1] : 
                      data.birthYear;
        
        // Move existing items
        const movedItems = prev.map(item => ({ ...item, y: item.y + item.speed }));
        
        // Filter out items that fell off
        const filteredItems = movedItems.filter(item => item.y < 110);

        // Spawn new item occasionally
        if (Math.random() < 0.12 && filteredItems.length < 18) {
          const newItem: FallingItem = {
            id: Math.random(),
            value: generateRandomValue(gameStage, target),
            x: Math.random() * 85 + 7.5, // Better spread
            y: -15,
            speed: Math.random() * 0.4 + 0.3, // Slightly slower for better UX
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 2
          };
          return [...filteredItems, newItem];
        }

        return filteredItems;
      });
    }, 30);

    return () => clearInterval(interval);
  }, [view, gameStage, data]);

  const generateRandomValue = (stage: 'day' | 'month' | 'year', target: string) => {
    // 20% chance to spawn the target
    if (Math.random() < 0.2) return target;
    
    if (stage === 'day') {
      return Math.floor(Math.random() * 31 + 1).toString().padStart(2, '0');
    } else if (stage === 'month') {
      return MONTH_NAMES[Math.floor(Math.random() * 12)];
    } else {
      const year = parseInt(data.birthYear) || 2000;
      return (year + Math.floor(Math.random() * 40 - 20)).toString();
    }
  };

  const handleItemClick = (item: FallingItem) => {
    const target = gameStage === 'day' ? data.birthDay : 
                  gameStage === 'month' ? MONTH_NAMES[parseInt(data.birthMonth) - 1] : 
                  data.birthYear;

    if (item.value === target) {
      triggerConfetti();
      setFallingItems([]);
      if (gameStage === 'day') setGameStage('month');
      else if (gameStage === 'month') setGameStage('year');
      else setView('win');
    } else {
      // Visual feedback for wrong item
      setFallingItems(prev => prev.map(i => i.id === item.id ? { ...i, isWrong: true } : i));
      setTimeout(() => {
        setFallingItems(prev => prev.map(i => i.id === item.id ? { ...i, isWrong: false } : i));
      }, 500);
    }
  };

  // Admin Handlers
  const updateData = (updates: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const updatePortfolioItem = (index: number, updates: Partial<PortfolioItem>) => {
    const newItems = [...(data.portfolioItems || [])];
    newItems[index] = { ...newItems[index], ...updates };
    updateData({ portfolioItems: newItems });
  };

  const addPortfolioItem = () => {
    updateData({
      portfolioItems: [
        ...(data.portfolioItems || []),
        { title: "Novo Momento", content: "Escreva algo lindo aqui...", image: "" }
      ]
    });
  };

  const removePortfolioItem = (index: number) => {
    const newItems = (data.portfolioItems || []).filter((_, i) => i !== index);
    updateData({ portfolioItems: newItems });
  };

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePortfolioClick = (index: number) => {
    const isLastItem = index === (data.portfolioItems?.length || 0) - 1;
    
    if (isLastItem && !hasShownSpecialPhoto) {
      setIsShowingSpecialPhoto(true);
      setHasShownSpecialPhoto(true);
      setTimeout(() => {
        setIsShowingSpecialPhoto(false);
        setSelectedItem(index);
      }, 2000);
    } else {
      setSelectedItem(selectedItem === index ? null : index);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fffafa]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-4"
        >
          <RefreshCw className="w-12 h-12 text-pink-400" />
        </motion.div>
        <p className="font-serif text-[#8d6e63]">Carregando sua jornada...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#fffafa] font-sans overflow-x-hidden">
      <audio ref={audioRef} src={data.musicUrl} key={data.musicUrl} loop />

      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <HeartParticle key={i} delay={Math.random() * 20} left={`${Math.random() * 100}%`} size={10 + Math.random() * 30} />
        ))}
      </div>

      {/* Controls */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleMusic}
          className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-md text-pink-500 border border-pink-100"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-pulse" />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setView(view === 'admin' ? 'landing' : 'admin')}
          className="p-3 bg-white/80 backdrop-blur-md rounded-full shadow-md text-gray-500 border border-gray-100"
        >
          {view === 'admin' ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* Special Interstitial Photo */}
      <AnimatePresence>
        {isShowingSpecialPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <motion.img
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.5 }}
              src="https://picsum.photos/seed/romance_special/1200/1800"
              alt="Special Moment"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-pink-500/10 mix-blend-overlay" />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {view === 'admin' ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-4xl px-4 py-12 relative z-10"
          >
            <div className="glass-card rounded-[2.5rem] p-6 md:p-10 bg-white/90 backdrop-blur-xl shadow-2xl border border-pink-50">
              <div className="flex items-center gap-4 mb-8 border-b border-pink-50 pb-6">
                <Settings className="w-8 h-8 text-pink-500" />
                <h2 className="text-2xl font-serif font-bold text-[#5d4037]">Painel Administrativo</h2>
              </div>

              {/* Admin Tabs */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {[
                  { id: 'general', label: 'Geral', icon: Layout },
                  { id: 'music', label: 'Música & Jogo', icon: Music },
                  { id: 'messages', label: 'Mensagens', icon: Type },
                  { id: 'config', label: 'Configuração Externa', icon: Globe }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all whitespace-nowrap ${
                      adminTab === tab.id 
                        ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' 
                        : 'bg-pink-50 text-pink-600 hover:bg-pink-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Admin Content */}
              <div className="space-y-8">
                {adminTab === 'general' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-pink-400 uppercase tracking-widest">Título Inicial</label>
                        <input 
                          type="text" 
                          value={data.landingTitle} 
                          onChange={e => updateData({ landingTitle: e.target.value })}
                          className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all font-serif"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-pink-400 uppercase tracking-widest">Título Vitória</label>
                        <input 
                          type="text" 
                          value={data.winTitle} 
                          onChange={e => updateData({ winTitle: e.target.value })}
                          className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all font-serif"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-pink-400 uppercase tracking-widest">Subtítulo Inicial</label>
                      <textarea 
                        value={data.landingSubtitle} 
                        onChange={e => updateData({ landingSubtitle: e.target.value })}
                        className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all font-serif h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-pink-400 uppercase tracking-widest">Subtítulo Vitória</label>
                      <textarea 
                        value={data.winSubtitle} 
                        onChange={e => updateData({ winSubtitle: e.target.value })}
                        className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all font-serif h-24"
                      />
                    </div>
                  </div>
                )}

                {adminTab === 'music' && (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-pink-400 uppercase tracking-widest">URL da Música (MP3)</label>
                      <input 
                        type="text" 
                        value={data.musicUrl} 
                        onChange={e => updateData({ musicUrl: e.target.value })}
                        className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                        placeholder="https://exemplo.com/musica.mp3"
                      />
                    </div>
                    
                    <div className="pt-6 border-t border-pink-50">
                      <h3 className="text-lg font-serif font-bold text-[#5d4037] mb-4">Configuração do Jogo (Data de Nascimento)</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-pink-400 uppercase">Dia</label>
                          <input 
                            type="text" 
                            maxLength={2}
                            value={data.birthDay} 
                            onChange={e => updateData({ birthDay: e.target.value })}
                            className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100 text-center text-xl font-serif"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-pink-400 uppercase">Mês</label>
                          <input 
                            type="text" 
                            maxLength={2}
                            value={data.birthMonth} 
                            onChange={e => updateData({ birthMonth: e.target.value })}
                            className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100 text-center text-xl font-serif"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-pink-400 uppercase">Ano</label>
                          <input 
                            type="text" 
                            maxLength={4}
                            value={data.birthYear} 
                            onChange={e => updateData({ birthYear: e.target.value })}
                            className="w-full p-4 bg-pink-50/50 rounded-2xl border border-pink-100 text-center text-xl font-serif"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {adminTab === 'messages' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-serif font-bold text-[#5d4037]">Itens do Portfólio ({(data.portfolioItems || []).length})</h3>
                      <button 
                        onClick={addPortfolioItem}
                        className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-full text-sm font-bold hover:bg-pink-600 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Adicionar
                      </button>
                    </div>

                    <div className="space-y-6">
                      {(data.portfolioItems || []).map((item, i) => (
                        <div key={i} className="p-6 bg-pink-50/30 rounded-3xl border border-pink-100 relative group">
                          <button 
                            onClick={() => removePortfolioItem(i)}
                            className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-pink-400 uppercase">Título</label>
                                <input 
                                  type="text" 
                                  value={item.title} 
                                  onChange={e => updatePortfolioItem(i, { title: e.target.value })}
                                  className="w-full p-3 bg-white rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all font-serif"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-pink-400 uppercase">Mensagem</label>
                                <textarea 
                                  value={item.content} 
                                  onChange={e => updatePortfolioItem(i, { content: e.target.value })}
                                  className="w-full p-3 bg-white rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all font-serif h-24"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-pink-400 uppercase">URL da Imagem</label>
                              <input 
                                type="text" 
                                value={item.image} 
                                onChange={e => updatePortfolioItem(i, { image: e.target.value })}
                                className="w-full p-3 bg-white rounded-xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all mb-4"
                                placeholder="https://exemplo.com/foto.jpg"
                              />
                              {item.image && (
                                <div className="aspect-video rounded-xl overflow-hidden border border-pink-100">
                                  <img src={item.image} alt="" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {adminTab === 'config' && (
                  <div className="space-y-8">
                    <div className="p-6 bg-pink-50/30 rounded-3xl border border-pink-100">
                      <h3 className="text-lg font-serif font-bold text-[#5d4037] mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5" /> URL de Configuração Externa
                      </h3>
                      <p className="text-sm text-[#8d6e63] mb-6 leading-relaxed">
                        Você pode hospedar o arquivo <code>config.json</code> em qualquer servidor (como GitHub, Dropbox ou seu próprio servidor) e colocar o link direto aqui. O site carregará tudo automaticamente ao abrir.
                      </p>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={configUrl} 
                          onChange={e => setConfigUrl(e.target.value)}
                          className="flex-1 p-4 bg-white rounded-2xl border border-pink-100 focus:outline-none focus:ring-2 focus:ring-pink-200 transition-all"
                          placeholder="/config.json"
                        />
                        <button 
                          onClick={() => loadConfig(configUrl)}
                          className="px-6 bg-pink-500 text-white rounded-2xl font-bold hover:bg-pink-600 transition-all flex items-center gap-2"
                        >
                          <RefreshCw className="w-4 h-4" /> Atualizar
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-pink-100">
                      <h3 className="text-lg font-serif font-bold text-[#5d4037] mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5" /> Exportar Configuração
                      </h3>
                      <p className="text-sm text-[#8d6e63] mb-6 leading-relaxed">
                        Após fazer suas edições no painel acima, clique no botão abaixo para baixar o arquivo <code>config.json</code>. Depois, basta fazer o upload desse arquivo para o seu servidor.
                      </p>
                      <button 
                        onClick={downloadConfig}
                        className="w-full p-4 bg-[#5d4037] text-white rounded-2xl font-bold hover:bg-[#4e342e] transition-all flex items-center justify-center gap-3"
                      >
                        <Download className="w-5 h-5" /> Baixar config.json
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-12 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    triggerConfetti();
                    setView('landing');
                  }}
                  className="bg-[#5d4037] text-white px-12 py-4 rounded-full font-bold shadow-xl flex items-center gap-3"
                >
                  <Save className="w-5 h-5" /> Salvar e Sair
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          <>
            {view === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center px-6 max-w-xl relative z-10"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-8 inline-block"
                >
                  <Heart className="w-20 h-20 text-pink-400 fill-pink-100" />
                </motion.div>
                <h1 className="font-serif text-4xl md:text-5xl font-light text-[#5d4037] mb-6 tracking-tight">
                  <Typewriter text={data.landingTitle} speed={100} />
                </h1>
                <p className="text-[#8d6e63] text-lg md:text-xl mb-12 font-serif italic leading-relaxed h-24">
                  <Typewriter text={data.landingSubtitle} delay={1500} />
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('game')}
                  className="bg-pink-500 text-white px-12 py-4 rounded-full font-medium shadow-lg shadow-pink-200 flex items-center gap-3 mx-auto transition-colors hover:bg-pink-600"
                >
                  Começar Desafio <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {view === 'game' && (
              <motion.div
                key="game"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center w-full h-screen relative overflow-hidden flex flex-col items-center bg-gradient-to-b from-[#fffafa] to-pink-50/20"
              >
                {/* Subtle Stage Indicator Top */}
                <div className="absolute top-12 left-0 w-full px-8 flex justify-between items-center z-20 opacity-40">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${gameStage === 'day' ? 'bg-pink-500 scale-125' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${gameStage === 'month' ? 'bg-pink-500 scale-125' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${gameStage === 'year' ? 'bg-pink-500 scale-125' : 'bg-gray-300'}`} />
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-gray-400">
                    {gameStage === 'day' ? 'Fase 1' : gameStage === 'month' ? 'Fase 2' : 'Fase 3'}
                  </div>
                </div>

                <div className="absolute inset-0 z-10">
                  <AnimatePresence>
                    {fallingItems.map((item) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.5, y: -20 }}
                        animate={{ 
                          opacity: 1, 
                          scale: 1, 
                          y: 0,
                          x: Math.sin(item.y / 10) * 15, // Swaying effect
                          rotate: item.isWrong ? [0, -10, 10, -10, 10, 0] : item.rotation + (item.y * item.rotationSpeed)
                        }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        transition={{
                          rotate: item.isWrong ? { duration: 0.4 } : { duration: 0 }
                        }}
                        onClick={() => handleItemClick(item)}
                        className={`absolute px-6 py-3 rounded-full text-xl md:text-2xl font-serif shadow-sm transition-all whitespace-nowrap border
                          ${item.isWrong 
                            ? 'bg-red-50 border-red-200 text-red-400 shadow-red-100' 
                            : 'bg-white/70 backdrop-blur-md border-pink-100 text-[#5d4037] hover:bg-white hover:shadow-md active:scale-95'
                          }`}
                        style={{ 
                          left: `${item.x}%`, 
                          top: `${item.y}%`,
                          transform: 'translateX(-50%)'
                        }}
                      >
                        {item.value}
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </div>
                
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
                  <div className="flex gap-4">
                    <div className={`h-1 w-8 rounded-full transition-all duration-500 ${gameStage === 'day' ? 'bg-pink-400 w-12' : 'bg-pink-100'}`} />
                    <div className={`h-1 w-8 rounded-full transition-all duration-500 ${gameStage === 'month' ? 'bg-pink-400 w-12' : 'bg-pink-100'}`} />
                    <div className={`h-1 w-8 rounded-full transition-all duration-500 ${gameStage === 'year' ? 'bg-pink-400 w-12' : 'bg-pink-100'}`} />
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'win' && (
              <motion.div
                key="win"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center px-6 max-w-xl relative z-10"
              >
                <div className="mb-8 flex justify-center">
                  <div className="p-6 bg-pink-50 rounded-full">
                    <Search className="w-16 h-16 text-pink-500" />
                  </div>
                </div>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#5d4037] mb-6">
                  <Typewriter text={data.winTitle} speed={80} />
                </h2>
                <p className="text-[#8d6e63] text-lg md:text-xl mb-12 font-serif italic leading-relaxed h-24">
                  <Typewriter text={data.winSubtitle} delay={2000} />
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView('portfolio')}
                  className="bg-[#5d4037] text-white px-12 py-4 rounded-full font-medium shadow-xl flex items-center gap-3 mx-auto"
                >
                  Ver Meu Presente <ChevronRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {view === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-6xl px-4 py-12 relative z-10"
              >
                <div className="text-center mb-16">
                  <span className="text-xs uppercase tracking-[0.5em] text-pink-400 font-bold mb-4 block">Galeria de Amor</span>
                  <h2 className="font-serif text-4xl md:text-5xl text-[#5d4037]">Para Você</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(data.portfolioItems || []).map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handlePortfolioClick(i)}
                      className="group relative cursor-pointer"
                    >
                      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                        <img 
                          src={item.image} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#5d4037]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="p-4 bg-white/20 backdrop-blur-md rounded-full">
                            <Unlock className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {selectedItem === i && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl border border-pink-50"
                          >
                            <Heart className="w-10 h-10 text-pink-400 mb-6" />
                            <h3 className="font-serif text-2xl font-bold text-[#5d4037] mb-4">
                              <Typewriter text={item.title} speed={70} />
                            </h3>
                            <p className="text-[#795548] font-serif italic leading-relaxed">
                              "<Typewriter text={item.content} delay={1000} />"
                            </p>
                            <motion.button
                              onClick={(e) => { e.stopPropagation(); setSelectedItem(null); }}
                              className="mt-8 text-xs uppercase tracking-widest text-pink-400 font-bold"
                            >
                              Fechar
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-24 text-center">
                  <p className="font-serif text-xl text-[#8d6e63] italic mb-8">
                    Feliz aniversário, meu mundo inteiro. ❤️
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setView('landing')}
                    className="text-xs uppercase tracking-[0.3em] text-pink-300 font-bold hover:text-pink-500 transition-colors"
                  >
                    Recomeçar Jornada
                  </motion.button>
                </div>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      {/* Decorative corners */}
      <div className="fixed bottom-0 left-0 w-32 h-32 bg-pink-50/30 rounded-tr-full blur-3xl -z-10" />
      <div className="fixed top-0 right-0 w-32 h-32 bg-pink-50/30 rounded-bl-full blur-3xl -z-10" />
    </div>
  );
}
