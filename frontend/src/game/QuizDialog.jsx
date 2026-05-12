import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { sfxCorrect, sfxWrong, sfxQuizOpen } from "./audio";

/**
 * Props:
 *  - open
 *  - question
 *  - exitClicks
 *  - completed (boolean) — if true, show "Good job!" deactivation view + only Exit available
 *  - onExit()
 *  - onAnswered(isCorrect)
 */
export default function QuizDialog({ open, question, exitClicks, completed, onExit, onAnswered }) {
  const [picked, setPicked] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [numericInput, setNumericInput] = useState("");
  const [mode, setMode] = useState("multi");

  useEffect(() => {
    if (open) {
      setPicked(null);
      setFeedback(null);
      setNumericInput("");
      sfxQuizOpen();
    }
  }, [open, question]);

  if (!question && !completed) return null;

  const handlePick = (i) => {
    if (feedback || completed) return;
    setPicked(i);
    const correct = i === question.answerIndex;
    setFeedback(correct ? "right" : "wrong");
    if (correct) sfxCorrect(); else sfxWrong();
    setTimeout(() => onAnswered(correct), 900);
  };

  const handleNumericSubmit = () => {
    if (feedback || completed) return;
    const cleaned = numericInput.trim().replace(/\s+/g, "");
    const correct = cleaned === question.numeric;
    setFeedback(correct ? "right" : "wrong");
    if (correct) sfxCorrect(); else sfxWrong();
    setTimeout(() => onAnswered(correct), 900);
  };

  const exitLabel = completed ? "Close" : (exitClicks === 0 ? "Exit" : "Exit (Final)");

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onExit(); }}>
      <DialogContent
        data-testid="quiz-dialog"
        className="max-w-xl bg-[#120c1f] border-[#3a2a52] text-[#e9d8a6]"
      >
        <DialogHeader>
          <DialogTitle className="pixel-font glow-cyan text-base sm:text-lg">
            {completed ? "ROBOT.STATUS // DEACTIVATED" : "ROBOT.QUERY // MATH MODULE"}
          </DialogTitle>
          <DialogDescription className="text-[#bba6e0] text-base">
            {completed
              ? '"Good job!" the robot beeps proudly. Its eyes dim — this challenge is complete.'
              : "Answer correctly to deactivate this robot. Click Exit to leave. Click Exit twice to power the robot down."}
          </DialogDescription>
        </DialogHeader>

        {completed ? (
          <div data-testid="quiz-good-job" className="py-8 text-center">
            <div className="pixel-font text-2xl text-[#9affd6] glow-cyan mb-2">GOOD JOB!</div>
            <div className="text-[#bba6e0]">The robot has powered down. The exit will open once all mobs are defeated.</div>
          </div>
        ) : (
          <>
            <div
              data-testid="quiz-question"
              className="text-lg sm:text-xl leading-snug text-[#f4bf4f] glow-amber px-2 py-3 border-l-4 border-[#f4bf4f]/70 bg-black/30"
            >
              {question.q}
            </div>

            <Tabs value={mode} onValueChange={setMode} className="w-full">
              <TabsList className="grid grid-cols-2 bg-[#1a1326] border border-[#3a2a52]">
                <TabsTrigger value="multi" data-testid="quiz-mode-multi" className="pixel-font text-xs">MULTI-CHOICE</TabsTrigger>
                <TabsTrigger value="numeric" data-testid="quiz-mode-numeric" className="pixel-font text-xs">NUMERIC</TabsTrigger>
              </TabsList>
              <TabsContent value="multi" className="mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {question.options.map((opt, i) => {
                    const isPicked = picked === i;
                    const isRight = feedback === "right" && isPicked;
                    const isWrong = feedback === "wrong" && isPicked;
                    const isAnswerReveal = feedback === "wrong" && i === question.answerIndex;
                    return (
                      <button
                        key={i}
                        data-testid={`quiz-option-${i}`}
                        disabled={!!feedback}
                        onClick={() => handlePick(i)}
                        className={`btn-pixel text-left ${isRight ? "!bg-[#22c08a] !text-black !border-[#22c08a]" : ""} ${isWrong ? "!bg-[#a8133e] !text-white !border-[#ff4d6d]" : ""} ${isAnswerReveal ? "!border-[#22c08a]" : ""}`}
                      >
                        <span className="opacity-60 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                      </button>
                    );
                  })}
                </div>
              </TabsContent>
              <TabsContent value="numeric" className="mt-4">
                <div className="space-y-3">
                  <Input
                    data-testid="quiz-numeric-input"
                    value={numericInput}
                    onChange={(e) => setNumericInput(e.target.value)}
                    placeholder='Type your answer (e.g. "1/2", "42", "40%")'
                    disabled={!!feedback}
                    className="bg-[#0b0712] border-[#3a2a52] text-[#e9d8a6] text-lg"
                  />
                  <Button
                    data-testid="quiz-numeric-submit"
                    onClick={handleNumericSubmit}
                    disabled={!!feedback || !numericInput.trim()}
                    className="btn-pixel"
                  >
                    SUBMIT
                  </Button>
                  <p className="text-sm text-[#bba6e0]">Match the format shown in the multi-choice options.</p>
                </div>
              </TabsContent>
            </Tabs>

            {feedback && (
              <div
                data-testid="quiz-feedback"
                className={`pixel-font text-sm mt-2 ${feedback === "right" ? "text-[#9affd6] glow-cyan" : "text-[#ff6ec7] glow-magenta"}`}
              >
                {feedback === "right"
                  ? "// CORRECT! ROBOT DEACTIVATING..."
                  : `// INCORRECT. CORRECT ANSWER: ${(question.numeric || "").toUpperCase()}`}
              </div>
            )}
          </>
        )}

        <DialogFooter className="mt-2">
          <Button
            data-testid="quiz-exit-btn"
            onClick={onExit}
            className={`btn-pixel btn-exit ${!completed && exitClicks === 1 ? "animate-pulse" : ""}`}
          >
            {exitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
