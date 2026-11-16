// PART 3 - the hook of the exams screen: the list with its three states, delete and create.
// Run it with:  npm test -- useExams
//
// It must return { status, exams, error, actionError, saving, reload, remove, create }:
//   status       "loading" | "ready" | "error"   (the three states of the request that lists)
//   exams        the array of exams ([] while loading and on error)
//   error        the sentence for the person when the LIST failed (null otherwise); use describeError
//   actionError  the sentence when a delete or a create failed (null otherwise); the list stays as it was
//   saving       true while a create is in flight
//   reload()     asks for the list again (status goes back to "loading")
//   remove(id)   DELETE; when the server confirms, the exam disappears from `exams`; resolves true or false
//   create(title) POST; when the server confirms, the new exam is added; resolves true or false
//
// Rule of the course: no hook inside an if, a loop or after a return.
import { useCallback, useEffect, useState } from "react";
import { describeError, listExams } from "./api";

export default function useExams() {
  const [status, setStatus] = useState("loading");
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  // Every call to reload() bumps this counter; the effect depends on it and lists again.
  const [attempt, setAttempt] = useState(0);

  // The request that lists, with its three states: loading -> ready | error.
  useEffect(() => {
    listExams()
      .then((data) => {
        setExams(data);
        setError(null);
        setStatus("ready");
      })
      .catch((err) => {
        setExams([]);
        setError(describeError(err));
        setStatus("error");
      });
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setError(null);
    setExams([]);
    setAttempt((n) => n + 1);
  }, []);

  return {
    status,
    exams,
    error,
    actionError: null,
    saving: false,
    reload,
    remove: async () => false,
    create: async () => false,
  };
}
