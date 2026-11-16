import { useCallback, useEffect, useState } from "react";
import { createExam, deleteExam, describeError, listExams } from "./api";

export default function useExams() {
  const [status, setStatus] = useState("loading");
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus("loading");
    listExams()
      .then((data) => {
        setExams(data);
        setError(null);
        setStatus("ready");
      })
      .catch((err) => {
        // FIX 2 (swallowed error): the error reaches the screen, not only the console.
        setExams([]);
        setError(describeError(err));
        setStatus("error");
      });
  }, [attempt]);

  const reload = useCallback(() => {
    setError(null);
    setAttempt((n) => n + 1);
  }, []);

  const remove = useCallback(async (id) => {
    try {
      await deleteExam(id);
    } catch (err) {
      console.error("Error deleting exam", err);
    }
  }, []);

  const create = useCallback(async (title) => {
    setActionError(null);
    try {
      const exam = await createExam(title);
      setExams((current) => [...current, exam]);
      return true;
    } catch (err) {
      setActionError(describeError(err)); // FIX 2: the API's message is shown to the person
      return false;
    }
  }, []);

  return { status, exams, error, actionError, saving: false, reload, remove, create };
}
