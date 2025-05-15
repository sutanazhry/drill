import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const defaultQuizData = {
  Math: [
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4",
    },
    {
      question: "What is 5 * 6?",
      options: ["30", "25", "20", "35"],
      answer: "30",
    },
  ],
  Geography: [
    {
      question: "What is the capital of France?",
      options: ["Berlin", "Madrid", "Paris", "Rome"],
      answer: "Paris",
    },
    {
      question: "Which continent is Egypt in?",
      options: ["Asia", "Africa", "Europe", "South America"],
      answer: "Africa",
    },
  ],
};

export default function QuizApp() {
  const [quizData, setQuizData] = useState(() => {
    const stored = localStorage.getItem("quizData");
    return stored ? JSON.parse(stored) : defaultQuizData;
  });
  const [selectedTopic, setSelectedTopic] = useState("Math");
  const [questions, setQuestions] = useState(quizData[selectedTopic]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [history, setHistory] = useState([]);

  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newAnswer, setNewAnswer] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showExisting, setShowExisting] = useState(false);
  const [showTopics, setShowTopics] = useState(false);

  const [newTopic, setNewTopic] = useState("");
  const [renameTopic, setRenameTopic] = useState("");

  useEffect(() => {
    setQuestions(quizData[selectedTopic]);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedOption(null);
    setShowScore(false);
  }, [selectedTopic, quizData]);

  useEffect(() => {
    localStorage.setItem("quizData", JSON.stringify(quizData));
  }, [quizData]);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleNextQuestion = () => {
    if (selectedOption === questions[currentQuestion].answer) {
      setScore((prev) => prev + 1);
    }

    const currentHistory = {
      question: questions[currentQuestion].question,
      selected: selectedOption,
      correct: questions[currentQuestion].answer,
    };

    setHistory((prev) => [...prev, currentHistory]);
    setSelectedOption(null);

    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
    setSelectedOption(null);
    setHistory([]);
  };

  const addOrUpdateQuestion = () => {
    if (!newQuestion || newOptions.some((opt) => !opt) || !newAnswer) return;

    const updatedQuestions = [...quizData[selectedTopic]];

    if (editingIndex !== null) {
      updatedQuestions[editingIndex] = {
        question: newQuestion,
        options: newOptions,
        answer: newAnswer,
      };
    } else {
      updatedQuestions.push({
        question: newQuestion,
        options: newOptions,
        answer: newAnswer,
      });
    }

    const updatedQuizData = {
      ...quizData,
      [selectedTopic]: updatedQuestions,
    };
    setQuizData(updatedQuizData);
    setNewQuestion("");
    setNewOptions(["", "", "", ""]);
    setNewAnswer("");
    setEditingIndex(null);
    setShowEditor(false);
  };

  const editQuestion = (index) => {
    const q = quizData[selectedTopic][index];
    setNewQuestion(q.question);
    setNewOptions(q.options);
    setNewAnswer(q.answer);
    setEditingIndex(index);
    setShowEditor(true);
  };

  const confirmDeleteQuestion = () => {
    if (deleteIndex === null) return;
    const updatedQuestions = quizData[selectedTopic].filter((_, i) => i !== deleteIndex);
    const updatedQuizData = {
      ...quizData,
      [selectedTopic]: updatedQuestions,
    };
    setQuizData(updatedQuizData);
    setDeleteIndex(null);
  };

  const addTopic = () => {
    if (!newTopic || quizData[newTopic]) return;
    const updatedQuizData = {
      ...quizData,
      [newTopic]: [],
    };
    setQuizData(updatedQuizData);
    setNewTopic("");
    setSelectedTopic(newTopic);
  };

  const renameCurrentTopic = () => {
    if (!renameTopic || quizData[renameTopic]) return;
    const updatedQuizData = { ...quizData };
    updatedQuizData[renameTopic] = updatedQuizData[selectedTopic];
    delete updatedQuizData[selectedTopic];
    setQuizData(updatedQuizData);
    setSelectedTopic(renameTopic);
    setRenameTopic("");
  };

  const deleteCurrentTopic = () => {
    if (Object.keys(quizData).length <= 1) return;
    const updatedQuizData = { ...quizData };
    delete updatedQuizData[selectedTopic];
    const nextTopic = Object.keys(updatedQuizData)[0];
    setQuizData(updatedQuizData);
    setSelectedTopic(nextTopic);
  };

  return (
    <div className="p-4 max-w-xl mx-auto mt-10">
      <div className="mb-4 flex gap-2 flex-wrap">
        {Object.keys(quizData).map((topic) => (
          <Button
            key={topic}
            variant={selectedTopic === topic ? "default" : "outline"}
            onClick={() => setSelectedTopic(topic)}
          >
            {topic}
          </Button>
        ))}
        <Button onClick={() => setShowEditor(!showEditor)}>
          {showEditor ? "Cancel Editing" : "Add New Question"}
        </Button>
        <Button onClick={() => setShowExisting(!showExisting)}>
          {showExisting ? "Hide Questions" : "View Existing Questions"}
        </Button>
        <Button onClick={() => setShowTopics(!showTopics)}>
          {showTopics ? "Hide Topics" : "Manage Topics"}
        </Button>
      </div>

      {showTopics && (
        <Card className="rounded-2xl shadow-md mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Manage Topics</h3>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="New topic name"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                />
                <Button onClick={addTopic}>Add Topic</Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Rename current topic"
                  value={renameTopic}
                  onChange={(e) => setRenameTopic(e.target.value)}
                />
                <Button onClick={renameCurrentTopic}>Rename</Button>
              </div>
              <Button variant="destructive" onClick={deleteCurrentTopic} disabled={Object.keys(quizData).length <= 1}>
                Delete Current Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(questions.length === 0 && !showEditor && !showExisting && !showScore) && (
        <Card className="rounded-2xl shadow-md mb-6">
          <CardContent className="p-6 text-center text-gray-500">
            No questions in this topic. Please add some.
          </CardContent>
        </Card>
      )}

      {showEditor && (
        <Card className="rounded-2xl shadow-md mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-2">
              {editingIndex !== null ? "Edit Question" : "Add New Question"}
            </h3>
            <Input
              className="mb-2"
              placeholder="Question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
            />
            {newOptions.map((opt, idx) => (
              <Input
                key={idx}
                className="mb-2"
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => {
                  const newOpts = [...newOptions];
                  newOpts[idx] = e.target.value;
                  setNewOptions(newOpts);
                }}
              />
            ))}
            <Input
              className="mb-2"
              placeholder="Correct Answer"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
            />
            <Button onClick={addOrUpdateQuestion} className="mt-2">
              {editingIndex !== null ? "Update Question" : "Add Question"}
            </Button>
          </CardContent>
        </Card>
      )}

      {showExisting && (
        <Card className="rounded-2xl shadow-md mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Existing Questions</h3>
            {quizData[selectedTopic].map((q, idx) => (
              <div key={idx} className="mb-4 border p-2 rounded-md">
                <div className="font-medium">{q.question}</div>
                <ul className="list-disc list-inside">
                  {q.options.map((opt, i) => (
                    <li key={i}>{opt}</li>
                  ))}
                </ul>
                <div className="mt-2">Correct Answer: {q.answer}</div>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => editQuestion(idx)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteIndex(idx)}>Delete</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {questions.length > 0 && (
        <Card className="rounded-2xl shadow-md">
          <CardContent className="p-6">
            {showScore ? (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-4">
                  Your Score: {score} / {questions.length}
                </h2>
                <div className="text-left mb-4">
                  <h3 className="font-semibold mb-2">Review:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {history.map((item, index) => (
                      <li key={index}>
                        <strong>{item.question}</strong><br />
                        Your answer: {item.selected} — Correct: {item.correct}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button onClick={restartQuiz}>Restart Quiz</Button>
              </div>
            ) : (
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  {questions[currentQuestion]?.question}
                </h2>
                <div className="grid gap-2 mb-4">
                  {questions[currentQuestion]?.options.map((option) => (
                    <Button
                      key={option}
                      variant={selectedOption === option ? "default" : "outline"}
                      onClick={() => handleOptionClick(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Button disabled={!selectedOption} onClick={handleNextQuestion}>
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this question?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteIndex(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteQuestion}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
