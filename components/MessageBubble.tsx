import { Bot, User } from "lucide-react";

interface MessageProps {
    role: "user" | "ai";
    content: string;
    time: string;
    isRich?: boolean;
}

export function MessageBubble({ role, content, time, isRich }: MessageProps) {
    const isAi = role === "ai";

    return (
        <div className={`flex gap-3 mb-6 ${isAi ? "flex-row" : "flex-row-reverse"}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
        ${isAi ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white" : "bg-gray-200 text-gray-600"}`}
            >
                {isAi ? <Bot size={16} /> : <User size={16} />}
            </div>

            <div className={`flex flex-col max-w-[85%] ${isAi ? "items-start" : "items-end"}`}>
                <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
          ${isAi
                            ? "bg-white border border-gray-100 rounded-tl-none text-gray-800"
                            : "bg-blue-600 text-white rounded-tr-none"}`}
                >
                    {isRich ? (
                        <div className="space-y-2">
                            {content.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                            ))}
                        </div>
                    ) : (
                        content
                    )}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1">{time}</span>
            </div>
        </div>
    );
}
