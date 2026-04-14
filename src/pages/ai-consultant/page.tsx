import { useState, useRef, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  image?: string;
  fileName?: string;
}

export default function AIConsultant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '안녕하세요! 향재원 AI 재배 컨설턴트입니다. 스마트팜 재배에 대해 무엇이든 물어보세요. 😊',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ url: string; name: string; type: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const quickQuestions = [
    '3월에 심을 수 있는 수익성 높은 작물은?',
    '고추냉이 양액 농도는 어떻게 설정하나요?',
    '토마토 잎이 노래지는데 원인이 뭔가요?',
    '500평 유리온실 딸기 재배 수익은?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          url: event.target?.result as string,
          name: file.name,
          type: file.type
        });
        setShowAttachMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSend = (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText && !selectedFile) return;

    const hasFile = !!selectedFile; // 클로저 시점 고정
    const fileUrl = selectedFile?.type.startsWith('image/') ? selectedFile.url : undefined;
    const fileName = !selectedFile?.type.startsWith('image/') ? selectedFile?.name : undefined;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText || '이미지를 보냈습니다',
      timestamp: new Date(),
      image: fileUrl,
      fileName: fileName
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setSelectedFile(null);
    setIsTyping(true);

    // AI 응답 시뮬레이션
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const aiResponse = hasFile ? getAIImageResponse() : getAIResponse(messageText);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIImageResponse = (): string => {
    return '이미지를 분석했습니다! 작물의 상태를 확인해보니:\n\n• 전반적으로 건강한 생육 상태입니다\n• 잎의 색상과 형태가 양호합니다\n• 특별한 병해충 징후는 보이지 않습니다\n\n더 자세한 분석이 필요하시면 "작물인식" 메뉴의 AI 분석 기능을 이용해보세요!';
  };

  const getAIResponse = (question: string): string => {
    if (question.includes('3월') || question.includes('작물')) {
      return '3월에 추천드리는 수익성 높은 작물은 다음과 같습니다:\n\n1. 상추 (연 6회전, ㎡당 48만원)\n2. 청경채 (연 8회전, ㎡당 40만원)\n3. 딸기 (연 2회전, ㎡당 75만원)\n\n특히 수경재배 시스템을 활용하면 생산성이 30% 이상 향상됩니다. 어떤 작물에 관심이 있으신가요?';
    } else if (question.includes('양액') || question.includes('농도')) {
      return '고추냉이 양액 농도 설정 가이드입니다:\n\n• EC 농도: 1.2-1.5 mS/cm\n• pH: 6.0-6.5\n• 온도: 15-18°C\n\n생육 초기에는 EC 1.2로 시작하여 중기부터 1.5까지 점진적으로 높이는 것이 좋습니다. 매일 EC와 pH를 체크하시는 것을 권장드립니다.';
    } else if (question.includes('토마토') || question.includes('노래')) {
      return '토마토 잎이 노래지는 주요 원인은:\n\n1. 질소 부족 (하엽부터 황화)\n2. 과습 또는 과건조\n3. 병해 (시들음병, 역병)\n\n대응 방법:\n• 양액 농도 확인 (EC 2.0-2.5)\n• 배수 상태 점검\n• 병든 잎 제거 후 살균제 처리\n\n사진을 촬영하시면 더 정확한 진단이 가능합니다.';
    } else if (question.includes('수익') || question.includes('딸기')) {
      return '500평(1,650㎡) 유리온실 딸기 재배 수익 분석:\n\n【수익】\n• 생산량: 약 16,500kg (㎡당 10kg)\n• 판매가: kg당 15,000원\n• 연 매출: 약 2억 4,750만원\n\n【비용】\n• 인건비: 7,200만원\n• 양액비: 1,200만원\n• 전기료: 1,800만원\n• 기타: 2,000만원\n• 총 비용: 1억 2,200만원\n\n【순수익】약 1억 2,550만원 (ROI 103%)\n\n더 자세한 분석이 필요하시면 수익성 분석 메뉴를 이용해보세요!';
    } else {
      return '질문 감사합니다! 스마트팜 재배와 관련하여 다음 주제로 도움을 드릴 수 있습니다:\n\n• 작물별 재배 방법\n• 양액 관리 및 환경 제어\n• 병해충 진단 및 대응\n• 수익성 분석\n• 시설 설계 상담\n\n구체적으로 어떤 부분이 궁금하신가요?';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Header */}
      <PageHeader
        title="AI 재배 컨설턴트"
        subtitle="온라인"
        rightSlot={<button className="w-10 h-10 flex items-center justify-center" aria-label="더보기"><i className="ri-more-2-line text-xl text-gray-700"></i></button>}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {message.type === 'ai' && (
                  <div className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-full flex-shrink-0">
                    <i className="ri-robot-line text-sm text-purple-600"></i>
                  </div>
                )}
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-900 shadow-sm'
                    }`}
                  >
                    {message.image && (
                      <div className="mb-2 rounded-xl overflow-hidden">
                        <img src={message.image} alt="첨부 이미지" className="w-full max-w-xs" />
                      </div>
                    )}
                    {message.fileName && (
                      <div className={`mb-2 flex items-center gap-2 p-2 rounded-lg ${
                        message.type === 'user' ? 'bg-purple-700' : 'bg-gray-100'
                      }`}>
                        <i className="ri-file-line text-lg"></i>
                        <span className="text-xs">{message.fileName}</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                  </div>
                  <p className={`text-xs text-gray-400 mt-1 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    {message.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex gap-2 max-w-[80%]">
                <div className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded-full flex-shrink-0">
                  <i className="ri-robot-line text-sm text-purple-600"></i>
                </div>
                <div className="px-4 py-3 bg-white rounded-2xl shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-gray-500 mb-3">자주 묻는 질문</p>
          <div className="grid grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSend(question)}
                className="bg-white border border-gray-200 rounded-xl p-3 text-left hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <p className="text-xs text-gray-700 leading-relaxed">{question}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        {/* Selected File Preview */}
        {selectedFile && (
          <div className="mb-3 relative">
            {selectedFile.type.startsWith('image/') ? (
              <div className="relative inline-block">
                <img src={selectedFile.url} alt="선택된 이미지" className="max-w-[120px] max-h-[120px] rounded-xl" />
                <button
                  onClick={handleRemoveFile}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                >
                  <i className="ri-close-line text-sm"></i>
                </button>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl">
                <i className="ri-file-line text-lg text-gray-600"></i>
                <span className="text-xs text-gray-700">{selectedFile.name}</span>
                <button
                  onClick={handleRemoveFile}
                  className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                >
                  <i className="ri-close-line text-xs"></i>
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="relative">
            <button 
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600"
            >
              <i className="ri-add-circle-line text-2xl"></i>
            </button>

            {/* Attach Menu Popup */}
            {showAttachMenu && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 w-48">
                <button
                  onClick={() => {
                    imageInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                    <i className="ri-image-line text-white text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">이미지</p>
                    <p className="text-xs text-gray-500">사진 업로드</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setShowAttachMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                    <i className="ri-file-line text-white text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-gray-900">파일</p>
                    <p className="text-xs text-gray-500">문서 업로드</p>
                  </div>
                </button>

                <button
                  onClick={() => setShowAttachMenu(false)}
                  className="w-full px-4 py-2 text-xs text-gray-500 hover:text-gray-700 border-t border-gray-100"
                >
                  취소
                </button>
              </div>
            )}

            {/* Hidden File Inputs */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                handleSend();
              }
            }}
            placeholder="궁금한 점을 물어보세요..."
            className="flex-1 px-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim() && !selectedFile}
            className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
              inputText.trim() || selectedFile
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-200 text-gray-400'
            }`}
          >
            <i className="ri-send-plane-fill text-lg"></i>
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}