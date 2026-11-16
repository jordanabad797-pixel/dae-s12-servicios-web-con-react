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
import { isCancel } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { createExam, deleteExam, describeError, listExams } from "./api";

export default function useExams() {
  const [status, setStatus] = useState("loading");
  const [exams, setExams] = useState([]);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [saving, setSaving] = useState(false);
  // Every call to reload() bumps this counter; the effect depends on it and lists again.
  const [attempt, setAttempt] = useState(0);

  // Guards that must change SYNCHRONOUSLY. A state update is only visible on the next render, so two clicks in the
  // same tick would both read `saving === false`; a ref is read and written at once, in the same event.
  const savingRef = useRef(false);
  const deletingRef = useRef(new Set()); // ids with a DELETE in flight
  const mountedRef = useRef(false); // no state updates after unmount (remove/create are not inside an effect)

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // The request that lists, with its three states: loading -> ready | error.
  // Two guards, because they solve different problems:
  //   - AbortController: cancels the HTTP request itself (no wasted work, the network panel shows it aborted).
  //   - `cancelled`: even if an answer already left the server, a run of the effect that is no longer the current
  //     one must NEVER write into the state (a slow, old answer would overwrite the newer list).
  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    listExams({ signal: controller.signal })
      .then((data) => {
        if (cancelled) return;
        setExams(data);
        setError(null);
        setStatus("ready");
      })
      .catch((err) => {
        // An aborted request is not an error for the person: it is the cleanup doing its job.
        if (cancelled || isCancel(err)) return;
        setExams([]);
        setError(describeError(err));
        setStatus("error");
      });

    // Runs on unmount and BEFORE the next run of the effect (reload, StrictMode's second run).
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [attempt]);

  const reload = useCallback(() => {
    setStatus("loading");
    setError(null);
    setExams([]);
    setAttempt((n) => n + 1);
  }, []);

  // DELETE /exams/<id>/. Team decision: when the server CONFIRMS (204), the row is filtered out locally. It is not
  // optimistic (on error the row stays) and it does not ask for the whole list again (one request instead of two,
  // no "loading" flash, and the server already told us the only thing that changed).
  const remove = useCallback(async (id) => {
    if (deletingRef.current.has(id)) return false; // the same row cannot be deleted twice at the same time
    deletingRef.current.add(id);
    setActionError(null);
    try {
      await deleteExam(id);
      if (mountedRef.current) setExams((current) => current.filter((exam) => exam.id !== id));
      return true;
    } catch (err) {
      if (mountedRef.current) setActionError(describeError(err));
      return false;
    } finally {
      deletingRef.current.delete(id);
    }
  }, []);

  // POST /exams/. A second call while the first one is in flight is ignored (no duplicated exams).
  const create = useCallback(async (title) => {
    if (savingRef.current) return false;
    savingRef.current = true;
    setSaving(true);
    setActionError(null);
    try {
      const exam = await createExam(title);
      if (mountedRef.current) setExams((current) => [...current, exam]);
      return true;
    } catch (err) {
      if (mountedRef.current) setActionError(describeError(err));
      return false;
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  }, []);

  return { status, exams, error, actionError, saving, reload, remove, create };
}
