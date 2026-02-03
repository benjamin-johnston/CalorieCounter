
import React, { useState, useEffect, useRef } from 'react';
import { analyzeFoodWithConversation } from './services/geminiService.ts';
import { FoodLogEntry, NutritionFacts, DailyStats, AnalysisResponse } from './types.ts';
import { NutritionLabel } from './components/NutritionLabel.tsx';
import { DailySummary } from './components/DailySummary.tsx';
import { Camera, Search, Plus, X, Trash2, History, ChevronRight, MessageCircle, Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

const App: React.FC = () => {
  const [log, setLog] = useState<FoodLogEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [analyzedResult, setAnalyzedResult] = useState<NutritionFacts | null>(null);
  const [clarifyingQuestion, setClarifyingQuestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const savedLog = localStorage.getItem('food-log');
    if (savedLog) {
      try {
        const parsed = JSON.parse(savedLog);
        const today = new Date().setHours(0, 0, 0, 0);
        const filtered = parsed.filter((e: FoodLogEntry) => e.timestamp >= today);
        setLog(filtered);
      } catch (e) {
        console.error("Failed to parse log", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('food-log', JSON.stringify(log));
  }, [log]);

  const handleAnalysisStep = async (query: string, imgBase64?: string) => {
    if (!query && !imgBase64 && chatHistory.length === 0) return;
    
    setIsLoading(true);
    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: query, image: imgBase64 }];
    setChatHistory(newHistory);
    setSearchQuery(''); 

    try {
      const geminiMessages = newHistory.map(m => ({
        role: m.role,
        parts: m.image 
          ? [{ inlineData: { mimeType: 'image/jpeg', data: m.image } }, { text: m.text || "Analyze this food" }] 
          : [{ text: m.text }]
      }));

      const result: AnalysisResponse = await analyzeFoodWithConversation(geminiMessages);

      if (result.status === 'NEED_INFO' && result.clarifying_question) {
        setClarifyingQuestion(result.clarifying_question);
        setChatHistory(prev => [...prev, { role: 'model', text: result.clarifying_question! }]);
      } else if (result.status === 'COMPLETE' && result.nutrition_facts) {
        setAnalyzedResult(result.nutrition_facts);
        setClarifyingQuestion(null);
      }
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please ensure your API key is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  const addToLog = () => {
    if (analyzedResult) {
      const newEntry: FoodLogEntry = {
        ...analyzedResult,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
      };
      setLog(prev => [newEntry, ...prev]);
      resetSearch();
    }
  };

  const resetSearch = () => {
    setAnalyzedResult(null);
    setClarifyingQuestion(null);
    setChatHistory([]);
    setSearchQuery('');
    setIsSearching(false);
  };

  const removeFromLog = (id: string) => {
    setLog(prev => prev.filter(e => e.id !== id));
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      alert("Camera access denied or not available.");
      setShowCamera(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        setShowCamera(false);
        setIsSearching(true);
        handleAnalysisStep("", base64);
      }
    }
  };

  const stats: DailyStats = log.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + (item.protein_g || 0),
      carbs: acc.carbs + (item.total_carbohydrate_g || 0),
      fat: acc.fat + (item.total_fat_g || 0),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24 font-sans selection:bg-green-100">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 py-4">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
              <Plus size={20} strokeWidth={3} />
            </div>
            <h1 className="text-xl font-black tracking-tight">NutriLens</h1>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-900 transition">
            <History size={24} />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8 space-y-8">
        <section>
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-sm uppercase tracking-widest font-black text-gray-400">Today's Progress</h2>
              <p className="text-2xl font-black">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <DailySummary stats={stats} />
        </section>

        <section className="flex gap-4">
          <button 
            onClick={() => setIsSearching(true)}
            className="flex-1 bg-white border border-gray-200 p-4 rounded-3xl flex items-center justify-center gap-3 hover:border-green-500 transition shadow-sm group"
          >
            <Search className="text-gray-400 group-hover:text-green-500" />
            <span className="font-bold text-gray-500 group-hover:text-gray-900">Search Food</span>
          </button>
          <button 
            onClick={startCamera}
            className="w-16 h-16 bg-black text-white rounded-3xl flex items-center justify-center hover:bg-gray-800 transition shadow-lg"
          >
            <Camera size={28} />
          </button>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-widest font-black text-gray-400">Recent Logs</h2>
          <div className="space-y-3">
            {log.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="text-gray-300" />
                </div>
                <p className="text-gray-500 font-bold">No entries yet today</p>
              </div>
            ) : (
              log.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 group hover:shadow-md transition">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 font-black">
                    {item.calories}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-gray-900 truncate">{item.item_name}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase">{item.serving_size} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <button onClick={() => removeFromLog(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                    <Trash2 size={20} />
                  </button>
                  <ChevronRight className="text-gray-200" />
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {isSearching && (
        <div className="fixed inset-0 z-[60] bg-white p-6 overflow-y-auto animate-in slide-in-from-bottom duration-300">
          <div className="max-w-xl mx-auto space-y-6 flex flex-col min-h-full pb-20">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black">Track Food</h2>
              <button onClick={resetSearch} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-3xl p-4 flex gap-3 ${
                    msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}>
                    {msg.role === 'model' && <MessageCircle className="shrink-0 text-green-500" size={20} />}
                    <div className="space-y-2">
                      {msg.image && (
                        <div className="rounded-xl overflow-hidden mb-2">
                          <img src={`data:image/jpeg;base64,${msg.image}`} alt="Food capture" className="w-full h-auto" />
                        </div>
                      )}
                      <p className="font-bold leading-tight">{msg.text}</p>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-3xl p-4 animate-pulse flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              )}

              {analyzedResult && !isLoading && (
                <div className="pt-4 border-t border-gray-100">
                  <NutritionLabel 
                    data={analyzedResult} 
                    onAdd={addToLog} 
                    onCancel={() => setAnalyzedResult(null)}
                  />
                </div>
              )}
            </div>

            {!analyzedResult && (
              <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md">
                <div className="max-w-xl mx-auto relative">
                  <input 
                    autoFocus
                    type="text"
                    placeholder={clarifyingQuestion ? "Answer the AI..." : "What did you eat?"}
                    className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-5 pl-8 pr-16 text-lg font-bold focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalysisStep(searchQuery)}
                  />
                  <button 
                    onClick={() => handleAnalysisStep(searchQuery)}
                    disabled={isLoading || !searchQuery}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center disabled:opacity-50 transition active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showCamera && (
        <div className="fixed inset-0 z-[70] bg-black">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col justify-between p-8">
            <div className="flex justify-end">
              <button onClick={() => setShowCamera(false)} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                <X size={24} />
              </button>
            </div>
            <div className="flex justify-center mb-12">
              <button 
                onClick={captureImage}
                className="w-20 h-20 bg-white rounded-full border-8 border-white/30 flex items-center justify-center shadow-2xl active:scale-90 transition"
              />
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/90 text-white backdrop-blur-xl px-8 py-4 rounded-full flex gap-12 shadow-2xl items-center border border-white/10">
        <button onClick={() => setIsSearching(true)} className="flex flex-col items-center gap-1 group">
          <Plus size={22} className="text-green-400 group-hover:scale-110 transition" />
          <span className="text-[10px] uppercase font-black">Track</span>
        </button>
        <button className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 transition">
          <History size={22} />
          <span className="text-[10px] uppercase font-black">History</span>
        </button>
      </div>
    </div>
  );
};

export default App;
