interface SuggestionChipsProps {
    onSelect?: (text: string) => void;
}

export function SuggestionChips({ onSelect }: SuggestionChipsProps) {
    const chips = [
        "How do I get to the next location?",
        "Is today too packed?",
        "What's nearby if I have free time?",
        "Any cultural tips for today?",
        "Where should I eat nearby?"
    ];

    return (
        <div className="flex gap-2 overflow-x-auto pb-4 pt-2 px-4 snap-x no-scrollbar">
            {chips.map((chip, i) => (
                <button
                    key={i}
                    onClick={() => onSelect?.(chip)}
                    className="whitespace-nowrap bg-white border border-gray-200 text-gray-600 text-xs px-4 py-2 rounded-full hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-colors snap-center shadow-sm"
                >
                    {chip}
                </button>
            ))}
        </div>
    );
}
