import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, CheckCircle2, Award, Zap } from "lucide-react";
import type { Flashcard } from "../type/flashcard";



const cards: Flashcard[] = [
  {
    id: 1,
    word: "ambiguous",
    ipa: "/æmˈbɪɡ.ju.əs/",
    meaning: "Open to more than one interpretation; having a double meaning.",
    example: "The ending of the movie was ambiguous, leaving the audience debating its true meaning.",
  },
  {
    id: 2,
    word: "brilliant",
    ipa: "/ˈbrɪl.jənt/",
    meaning: "Extremely intelligent, impressive, or outstanding.",
    example: "She came up with a brilliant solution to the complex problem.",
  },
  {
    id: 3,
    word: "persistent",
    ipa: "/pəˈsɪs.tənt/",
    meaning: "Continuing firmly or obstinately in a course of action in spite of difficulty or opposition.",
    example: "His persistent efforts finally led to a breakthrough in the research.",
  },
  {
    id: 4,
    word: "benevolent",
    ipa: "/bəˈnev.əl.ənt/",
    meaning: "Well meaning and kindly; serving a charitable rather than a profit-making purpose.",
    example: "The benevolent gentleman left his entire fortune to local orphanages.",
  },
  {
    id: 5,
    word: "ephemeral",
    ipa: "/ɪˈfem.ər.əl/",
    meaning: "Lasting for a very short time; transient or fleeting.",
    example: "Fame in the age of social media is often ephemeral.",
  },
];

type Difficulty = "easy" | "medium" | "hard" | "super-hard";

const FlashcardPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardDifficulties, setCardDifficulties] = useState<Record<number, Difficulty>>({});

  const currentCard = cards[currentIndex];
  const currentDifficulty = cardDifficulties[currentCard.id];

  const nextCard = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleDifficultySelect = (difficulty: Difficulty) => {
    setCardDifficulties(prev => ({
      ...prev,
      [currentCard.id]: difficulty,
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case "ArrowLeft":
          prevCard();
          break;
        case "ArrowRight":
          nextCard();
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          setIsFlipped(prev => !prev);
          break;
        case "1":
          handleDifficultySelect("easy");
          break;
        case "2":
          handleDifficultySelect("medium");
          break;
        case "3":
          handleDifficultySelect("hard");
          break;
        case "4":
          handleDifficultySelect("super-hard");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentIndex]);

  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-start py-8 px-4 sm:px-6">
      <div className="w-full max-w-[700px] flex flex-col gap-6">
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-500">
            <span>Progress</span>
            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
              Card {currentIndex + 1} of {cards.length}
            </span>
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label={`Flashcard: ${currentCard.word}. Press space or click to reveal meaning.`}
          onClick={() => setIsFlipped(prev => !prev)}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              setIsFlipped(prev => !prev);
            }
          }}
          className="w-full h-[380px] sm:h-[420px] perspective-1000 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-3xl"
        >
          <div
            className={`w-full h-full relative preserve-3d transition-transform duration-500 rounded-3xl shadow-md hover:shadow-xl hover:scale-[1.01] transition-all bg-white ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            <div className={`absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-white border border-slate-100 p-8 flex flex-col justify-center items-center transition-all duration-300 ${isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-800 tracking-tight capitalize select-none">
                {currentCard.word}
              </h1>
              {currentCard.ipa && (
                <p className="text-lg sm:text-xl text-slate-400 font-mono mt-4 select-none">
                  {currentCard.ipa}
                </p>
              )}
            </div>

            <div className={`absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-white border border-slate-100 p-6 sm:p-10 flex flex-col justify-center gap-5 overflow-y-auto transition-all duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex flex-col items-center gap-1 select-none">
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 text-center leading-relaxed">
                  {currentCard.meaning}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-4 sm:p-6 border border-slate-100 select-none">
                <h4 className="text-xs font-bold uppercase tracking-widest text-orange-500 text-center mb-2">
                  Example Sentence
                </h4>
                <p className="italic text-base sm:text-lg text-slate-600 text-center leading-relaxed">
                  "{currentCard.example}"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
         
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficultySelect("easy");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                currentDifficulty === "easy"
                  ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-200"
                  : "border-green-200 text-green-700 bg-green-50/30 hover:bg-green-50 hover:border-green-300"
              }`}
            >
              <CheckCircle2 size={18} />
              Easy
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficultySelect("medium");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                currentDifficulty === "medium"
                  ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200"
                  : "border-amber-200 text-amber-700 bg-amber-50/30 hover:bg-amber-50 hover:border-amber-300"
              }`}
            >
              <HelpCircle size={18} />
              Medium
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficultySelect("hard");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                currentDifficulty === "hard"
                  ? "bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-200"
                  : "border-orange-200 text-orange-700 bg-orange-50/30 hover:bg-orange-50 hover:border-orange-300"
              }`}
            >
              <Award size={18} />
              Hard
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDifficultySelect("super-hard");
              }}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                currentDifficulty === "super-hard"
                  ? "bg-red-600 border-red-600 text-white shadow-md shadow-red-200"
                  : "border-red-200 text-red-700 bg-red-50/30 hover:bg-red-50 hover:border-red-300"
              }`}
            >
              <Zap size={18} />
              Super Hard
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 mt-2">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <button
            onClick={nextCard}
            disabled={currentIndex === cards.length - 1}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <span>Next</span>
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default FlashcardPage;