import React, { useEffect, useRef, useState } from 'react';
import Modal from './Modal';
import { saveUserCategory } from './userCategories';
import CategoryDropdown from './CategoryDropdown';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, get, push, set } from 'firebase/database';

function RolesPage({ onBack }) {
  // Remove confirmation state for task deletion
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  // ...existing state hooks...

  // Load tasks for user (hoisted for use in remove handler)
  const loadTasks = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const db = getDatabase();
        const tasksRef = ref(db, `users/${user.uid}/tasks`);
        const snap = await get(tasksRef);
        if (snap.exists()) {
          setTasksByCategory(snap.val());
        } else {
          setTasksByCategory({});
        }
      }
    } catch (e) {
      setTasksByCategory({});
    }
  };

  // Remove task handler
  const handleRemoveTask = async () => {
    if (!selectedTask) return;
    try {
      const db = getDatabase();
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) return;
      // Find the task by title, description, and skulls
      const tasksRef = ref(db, `users/${user.uid}/tasks/${selectedTask.category}`);
      const snapshot = await get(tasksRef);
      if (snapshot.exists()) {
        const tasks = snapshot.val();
        const taskId = Object.keys(tasks).find(key => {
          const t = tasks[key];
          return t.title === selectedTask.title && t.description === selectedTask.description && t.skulls === selectedTask.skulls;
        });
        if (taskId) {
          await set(ref(db, `users/${user.uid}/tasks/${selectedTask.category}/${taskId}`), null);
        }
      }
      setShowRemoveConfirm(false);
      setTaskDetailModalOpen(false);
      setSelectedTask(null);
      await loadTasks();
    } catch (err) {
      console.error('Error removing task:', err);
      setShowRemoveConfirm(false);
    }
  };
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskDetailModalOpen, setTaskDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tasksByCategory, setTasksByCategory] = useState({});
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [skullRating, setSkullRating] = useState(0);
  const [categories, setCategories] = useState(['General']);
  const [selectedCategory, setSelectedCategory] = useState('General');
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [newCat, setNewCat] = useState('');
  const wakeLockRef = useRef(null);

  useEffect(() => {
    // Request wake lock when component mounts
    async function requestWakeLock() {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        // Ignore errors (e.g., not supported)
      }
    }
    requestWakeLock();

    // Load user categories from Firebase
    async function loadCategories() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getDatabase();
          const catRef = ref(db, `users/${user.uid}/categories`);
          const snap = await get(catRef);
          if (snap.exists()) {
            const cats = snap.val();
            if (Array.isArray(cats) && cats.length > 0) {
              setCategories(cats);
              setSelectedCategory(cats[0]);
            }
          }
        }
      } catch (e) {
        // Optionally handle error
        console.error('Failed to load categories:', e);
      }
    }
    loadCategories();

    // Load tasks for user
    async function loadTasks() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          const db = getDatabase();
          const tasksRef = ref(db, `users/${user.uid}/tasks`);
          const snap = await get(tasksRef);
          if (snap.exists()) {
            setTasksByCategory(snap.val());
          } else {
            setTasksByCategory({});
          }
        }
      } catch (e) {
        setTasksByCategory({});
      }
    }
    loadTasks();

    // Release wake lock when component unmounts
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };
  }, []);

  // Add Task handler
  async function handleAddTask() {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getDatabase();
    const task = {
      title: title.trim(),
      description: desc.trim(),
      category: selectedCategory,
      skulls: skullRating,
      createdAt: Date.now(),
    };
    if (!task.title || !task.category || !task.skulls) return; // basic validation
    const tasksRef = ref(db, `users/${user.uid}/tasks/${selectedCategory}`);
    await push(tasksRef, task);
    setModalOpen(false);
    setTitle('');
    setDesc('');
    setSkullRating(0);
    // Reload tasks from database
    try {
      const allTasksRef = ref(db, `users/${user.uid}/tasks`);
      const snap = await get(allTasksRef);
      if (snap.exists()) {
        setTasksByCategory(snap.val());
      } else {
        setTasksByCategory({});
      }
    } catch (e) {
      setTasksByCategory({});
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#181a1b', color: '#f5f6fa', padding: 0, position: 'relative', display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Settings gear icon */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            touchAction: 'manipulation',
          }}
          aria-label="Open settings"
          onClick={() => setSettingsOpen(true)}
        >
          <img
            src="/settings.svg"
            alt="Settings"
            style={{
              width: '28px',
              height: '28px',
              filter: 'invert(1)',
              display: 'block',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          />
        </button>
        <style>{`
          @media (max-width: 600px) {
            .settings-cog-btn {
              width: 32px !important;
              height: 32px !important;
            }
            .settings-cog-img {
              width: 20px !important;
              height: 20px !important;
            }
          }
        `}</style>
      </div>

      {/* Settings Modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <div style={{ padding: 32, minWidth: 220, maxWidth: 320, textAlign: 'center' }}>
          <h2 style={{ color: '#ffeba7', fontWeight: 900, fontSize: 24, marginBottom: 24, letterSpacing: 1 }}>Settings</h2>
          <button
            className="button-30"
            style={{
              background: '#23272a',
              color: '#ffeba7',
              borderRadius: 32,
              fontSize: 18,
              fontWeight: 900,
              border: '2px solid #222',
              letterSpacing: 1,
              boxShadow: '0 2px 8px #0006',
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              cursor: 'pointer',
              width: '100%',
              minHeight: 44,
              marginBottom: 18
            }}
            onClick={onBack}
          >
            Log Out
          </button>
          <button
            className="button-30"
            style={{
              background: '#181a1b',
              color: '#ffeba7',
              borderRadius: 32,
              fontSize: 18,
              fontWeight: 900,
              border: '2px solid #222',
              letterSpacing: 1,
              boxShadow: '0 2px 8px #0006',
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              cursor: 'pointer',
              width: '100%',
              minHeight: 44
            }}
            onClick={() => setSettingsOpen(false)}
          >
            Close Settings
          </button>
        </div>
      </Modal>
      <div style={{ flex: '0 0 auto', padding: '2rem 0 0 0' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 12, marginTop: 36, textAlign: 'center', letterSpacing: 2 }}>Tasks</h1>
        <hr style={{ border: 0, borderTop: '2px solid #333', width: '100%', margin: '0 auto 32px auto' }} />
      </div>
      <div style={{ flex: '1 1 auto', overflowY: 'auto', padding: '0 0 90px 0', width: '100%' }} className="main-task-scroll-area">
        {Object.keys(tasksByCategory).length === 0 && (
          <div
            style={{
              background: '#23272a',
              borderRadius: 16,
              minHeight: 120,
              margin: '0 auto 32px auto',
              width: '100%',
              maxWidth: 600,
              boxShadow: '0 2px 16px #0003',
              padding: '24px 4vw',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
            }}
          >
            <p style={{ color: '#aaa', textAlign: 'center', margin: 0 }}>No tasks yet.</p>
          </div>
        )}
        {Object.entries(tasksByCategory).map(([cat, tasks], idx) => (
          <div
            key={cat}
            className="category-section"
            style={{ marginTop: idx === 0 ? 0 : 24 }}
          >
            <h2 style={{ color: '#ffeba7', fontWeight: 700, fontSize: 22, margin: '0 0 12px 0', letterSpacing: 1 }}>{cat}</h2>
            {Object.entries(tasks).map(([taskId, task]) => (
              <div
                key={taskId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  padding: '4px 0',
                  borderBottom: '1px solid #222',
                  minHeight: 36,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => {
                  setSelectedTask({ ...task, category: cat });
                  setTaskDetailModalOpen(true);
                }}
                tabIndex={0}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setSelectedTask({ ...task, category: cat }); setTaskDetailModalOpen(true); } }}
                aria-label={`View details for ${task.title}`}
              >
                <span style={{ fontWeight: 600, fontSize: 17, lineHeight: 1.3 }}>{task.title}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 110, justifyContent: 'flex-end' }}>
                  {[1,2,3,4,5].map((i) => {
                    // 1: white, 2: light yellow, 3: yellow, 4: orange, 5: red
                    const colorFilters = [
                      'brightness(1.2) saturate(0) invert(0)', // 1: white
                      'sepia(1) saturate(6) hue-rotate(10deg) brightness(1.1)', // 2: light yellow
                      'sepia(1) saturate(10) hue-rotate(0deg) brightness(1)', // 3: yellow
                      'sepia(1) saturate(10) hue-rotate(-30deg) brightness(0.95)', // 4: orange
                      'sepia(1) saturate(8) hue-rotate(-60deg) brightness(0.8) contrast(1.4)', // 5: true red
                    ];
                    let filter = 'grayscale(1) brightness(0.5)';
                    let visible = false;
                    if (task.skulls >= i) {
                      filter = colorFilters[i-1];
                      visible = true;
                    }
                    return (
                      <img
                        key={i}
                        src={'/skull.png'}
                        alt={visible ? 'Skull selected' : 'Skull placeholder'}
                        className="task-skull"
                        style={{
                          filter,
                          opacity: visible ? 1 : 0
                        }}
                      />
                    );
                  })}
                </span>
              </div>
            ))}
      {/* Task Details Modal */}
      <Modal open={taskDetailModalOpen} onClose={() => { setTaskDetailModalOpen(false); setEditMode(false); }}>
        {selectedTask && !editMode && (
          <div className="task-details-modal" style={{ padding: 24, minWidth: 280, maxWidth: 400 }}>
            <style>{`
              @media (max-width: 480px) {
                .task-details-modal {
                  max-width: 98vw !important;
                  min-width: 0 !important;
                  padding: 18px 2vw 12px 2vw !important;
                  border-radius: 18px !important;
                  left: 1vw !important;
                  right: 1vw !important;
                }
                .task-skull-row {
                  gap: 4px !important;
                  margin: 10px auto 2px auto !important;
                  max-width: 160px !important;
                  justify-content: center !important;
                }
                .task-skull-icon {
                  width: 12vw !important;
                  height: 12vw !important;
                  min-width: 18px !important;
                  max-width: 32px !important;
                }
                .task-details-btn {
                  min-width: 90px !important;
                  min-height: 36px !important;
                  font-size: 15px !important;
                }
              }
            `}</style>
            <h2 style={{ color: '#ffeba7', fontWeight: 900, fontSize: 26, marginBottom: 10, textAlign: 'center', letterSpacing: 1 }}>{selectedTask.title}</h2>
            <div style={{ textAlign: 'center', marginBottom: 18 }}>
              <span style={{
                display: 'inline-block',
                background: '#23272a',
                color: '#ffeba7',
                borderRadius: 16,
                padding: '4px 16px',
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: 1,
                marginBottom: 8
              }}>{selectedTask.category}</span>
            </div>
            <div style={{ marginBottom: 18, color: '#f5f6fa', fontSize: 17, textAlign: 'center', whiteSpace: 'pre-line' }}>
              {selectedTask.description}
            </div>
            <div className="task-skull-row" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
              {[1,2,3,4,5].map(i => {
                const colorFilters = [
                  'brightness(1.2) saturate(0) invert(0)', // 1: white
                  'sepia(1) saturate(6) hue-rotate(10deg) brightness(1.1)', // 2: light yellow
                  'sepia(1) saturate(10) hue-rotate(0deg) brightness(1)', // 3: yellow
                  'sepia(1) saturate(10) hue-rotate(-30deg) brightness(0.95)', // 4: orange
                  'sepia(1) saturate(8) hue-rotate(-60deg) brightness(0.8) contrast(1.4)', // 5: true red
                ];
                let filter = 'grayscale(1) brightness(0.5)';
                if (selectedTask.skulls >= i) {
                  filter = colorFilters[i-1];
                }
                return (
                  <img
                    key={i}
                    className="task-skull-icon"
                    src={'/skull.png'}
                    alt={selectedTask.skulls >= i ? 'Skull selected' : 'Skull'}
                    style={{
                      width: 32,
                      height: 32,
                      objectFit: 'contain',
                      filter,
                      margin: '0 2px',
                      display: 'inline-block',
                    }}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="button-30 task-details-btn"
                style={{
                  background: '#23272a',
                  color: '#ffeba7',
                  borderRadius: 32,
                  fontSize: 18,
                  fontWeight: 900,
                  border: '2px solid #222',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px #0006',
                  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                  flex: 1,
                  minHeight: 44
                }}
                onClick={() => setEditMode(true)}
              >
                Edit
              </button>
              <button
                className="button-30 task-details-btn"
                style={{
                  background: '#181a1b',
                  color: '#ffeba7',
                  borderRadius: 32,
                  fontSize: 18,
                  fontWeight: 900,
                  border: '2px solid #222',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px #0006',
                  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                  flex: 1,
                  minHeight: 44
                }}
                onClick={() => setTaskDetailModalOpen(false)}
              >
                Close
              </button>
              <button
                className="button-30 task-details-btn"
                style={{
                  background: '#c0392b',
                  color: '#fff',
                  borderRadius: 32,
                  fontSize: 18,
                  fontWeight: 900,
                  border: '2px solid #222',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px #0006',
                  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                  flex: 1,
                  minHeight: 44
                }}
                onClick={() => setShowRemoveConfirm(true)}
              >
                Remove
              </button>
            </div>
            {showRemoveConfirm && (
              <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0,0,0,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999
              }}>
                <div style={{
                  background: '#23272a',
                  borderRadius: 24,
                  padding: '32px 24px',
                  boxShadow: '0 4px 24px #000a',
                  textAlign: 'center',
                  maxWidth: 320
                }}>
                  <div style={{ color: '#ffeba7', fontWeight: 900, fontSize: 22, marginBottom: 18 }}>Are you sure you want to remove this task?</div>
                  <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                    <button
                      className="button-30"
                      style={{
                        background: '#c0392b',
                        color: '#fff',
                        borderRadius: 32,
                        fontSize: 18,
                        fontWeight: 900,
                        border: '2px solid #222',
                        letterSpacing: 1,
                        boxShadow: '0 2px 8px #0006',
                        transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                        cursor: 'pointer',
                        minWidth: 90,
                        minHeight: 38
                      }}
                      onClick={handleRemoveTask}
                    >
                      Remove
                    </button>
                    <button
                      className="button-30"
                      style={{
                        background: '#181a1b',
                        color: '#ffeba7',
                        borderRadius: 32,
                        fontSize: 18,
                        fontWeight: 900,
                        border: '2px solid #222',
                        letterSpacing: 1,
                        boxShadow: '0 2px 8px #0006',
                        transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                        cursor: 'pointer',
                        minWidth: 90,
                        minHeight: 38
                      }}
                      onClick={() => setShowRemoveConfirm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
        {selectedTask && editMode && (
          <div style={{ padding: 24, minWidth: 280, maxWidth: 400 }}>
            <h2 style={{ color: '#8ab4f8', fontWeight: 900, fontSize: 24, marginBottom: 10, textAlign: 'center', letterSpacing: 1 }}>Edit Task</h2>
            <input
              type="text"
              value={editTask?.title ?? selectedTask.title}
              onChange={e => setEditTask({ ...editTask, title: e.target.value })}
              placeholder="Title"
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', marginBottom: 18, fontSize: 16, background: '#181a1b', color: '#f5f6fa', boxSizing: 'border-box' }}
            />
            <textarea
              value={editTask?.description ?? selectedTask.description}
              onChange={e => setEditTask({ ...editTask, description: e.target.value })}
              placeholder="Description"
              rows={3}
              style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', marginBottom: 18, fontSize: 16, background: '#181a1b', color: '#f5f6fa', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 18 }}>
              {[1,2,3,4,5].map(i => {
                // 1: white, 2: light yellow, 3: yellow, 4: orange, 5: red
                const colorFilters = [
                  'brightness(1.2) saturate(0) invert(0)', // 1: white
                  'sepia(1) saturate(6) hue-rotate(10deg) brightness(1.1)', // 2: light yellow
                  'sepia(1) saturate(10) hue-rotate(0deg) brightness(1)', // 3: yellow
                  'sepia(1) saturate(10) hue-rotate(-30deg) brightness(0.95)', // 4: orange
                  'sepia(1) saturate(8) hue-rotate(-60deg) brightness(0.8) contrast(1.4)', // 5: true red
                ];
                let filter = 'grayscale(1) brightness(0.5)';
                if ((editTask?.skulls ?? selectedTask.skulls) >= i) {
                  filter = colorFilters[i-1];
                }
                return (
                  <img
                    key={i}
                    src={'/skull.png'}
                    alt={(editTask?.skulls ?? selectedTask.skulls) >= i ? 'Skull selected' : 'Skull'}
                    style={{
                      width: 32,
                      height: 32,
                      objectFit: 'contain',
                      filter,
                      margin: '0 2px',
                      display: 'inline-block',
                      cursor: 'pointer',
                      transition: 'filter 0.1s',
                    }}
                    onClick={() => setEditTask({ ...editTask, skulls: i })}
                  />
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <button
                className="button-30"
                style={{
                  background: '#8ab4f8',
                  color: '#181a1b',
                  borderRadius: 32,
                  fontSize: 18,
                  fontWeight: 900,
                  border: '2px solid #222',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px #0006',
                  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                  flex: 1,
                  minHeight: 44
                }}
                onClick={async () => {
                  // Save changes to Firebase
                  const auth = getAuth();
                  const user = auth.currentUser;
                  if (!user) return;
                  const db = getDatabase();
                  const taskRef = ref(db, `users/${user.uid}/tasks/${selectedTask.category}`);
                  // Find the taskId by matching title/desc/skulls (not ideal, but works for now)
                  const snap = await get(taskRef);
                  if (snap.exists()) {
                    const tasks = snap.val();
                    const taskId = Object.keys(tasks).find(id => {
                      const t = tasks[id];
                      return t.title === selectedTask.title && t.description === selectedTask.description && t.skulls === selectedTask.skulls;
                    });
                    if (taskId) {
                      const updated = {
                        ...selectedTask,
                        ...editTask,
                        title: (editTask?.title ?? selectedTask.title).trim(),
                        description: (editTask?.description ?? selectedTask.description).trim(),
                        skulls: editTask?.skulls ?? selectedTask.skulls,
                      };
                      await set(ref(db, `users/${user.uid}/tasks/${selectedTask.category}/${taskId}`), updated);
                      setSelectedTask(updated);
                      setEditMode(false);
                      setEditTask(null);
                      // Optionally reload tasks
                    }
                  }
                }}
              >
                Save
              </button>
              <button
                className="button-30"
                style={{
                  background: '#181a1b',
                  color: '#ffeba7',
                  borderRadius: 32,
                  fontSize: 18,
                  fontWeight: 900,
                  border: '2px solid #222',
                  letterSpacing: 1,
                  boxShadow: '0 2px 8px #0006',
                  transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                  flex: 1,
                  minHeight: 44
                }}
                onClick={() => { setEditMode(false); setEditTask(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>
          </div>
        ))}
      </div>
      <button
        className="button-30"
        style={{
          position: 'fixed',
          left: 0,
          bottom: 0,
          width: '100vw',
          maxWidth: '100%',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          fontSize: 22,
          fontWeight: 900,
          height: 64,
          background: '#23272a',
          color: '#ffeba7',
          boxShadow: '0 -2px 12px #0008',
          zIndex: 20,
          letterSpacing: 1,
          border: 'none',
        }}
        onClick={() => setModalOpen(true)}
      >
        Add Task
      </button>

  <Modal open={modalOpen} onClose={() => setModalOpen(false)} bottomDrawer header="Add Task">
  {/* The header is now in the modal top bar */}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxWidth: 420,
        margin: '0 auto',
        padding: '16px 8px',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        @media (max-width: 480px) {
          .add-task-modal {
            max-width: 98vw !important;
            min-width: 0 !important;
            padding: 8px 2vw !important;
            border-radius: 18px !important;
            left: 1vw !important;
            right: 1vw !important;
          }
          .skull-row {
            gap: 4px !important;
            margin: 10px auto 2px auto !important;
            max-width: 160px !important;
          }
          .skull-icon {
            width: 12vw !important;
            height: 12vw !important;
            min-width: 18px !important;
            max-width: 32px !important;
          }
          .sign-btn {
            min-width: 110px !important;
            min-height: 38px !important;
            font-size: 16px !important;
          }
        }
      `}</style>
  <div className="add-task-modal" style={{ display: 'flex', alignItems: 'center', marginBottom: 18, width: '100%' }}>
        <div style={{ flex: 1, marginRight: 10 }}>
          <CategoryDropdown
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
        <button
          style={{ background: '#23272a', color: '#fff', border: 'none', borderRadius: 6, fontSize: 22, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 700, boxShadow: '0 1px 4px #0003' }}
          onClick={() => setCatModalOpen(true)}
          aria-label="Add category"
        >
          +
        </button>
      </div>
      <label style={{ display: 'block', marginBottom: 10, color: '#aaa', fontWeight: 600, width: '100%' }}>Title</label>
      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Job role/title"
        style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', marginBottom: 18, fontSize: 16, background: '#181a1b', color: '#f5f6fa', boxSizing: 'border-box' }}
      />
      <label style={{ display: 'block', marginBottom: 10, color: '#aaa', fontWeight: 600, width: '100%' }}>Description</label>
      <textarea
        value={desc}
        onChange={e => setDesc(e.target.value)}
        placeholder="Describe the assignment..."
        rows={3}
        style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', marginBottom: 18, fontSize: 16, background: '#181a1b', color: '#f5f6fa', resize: 'none', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div
          className="skull-row"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            maxWidth: 220,
            margin: '14px auto 6px auto',
            padding: 0,
            minHeight: 32,
            gap: '6px',
          }}
        >
          {[1,2,3,4,5].map(i => {
            const colorFilters = [
              'brightness(1.2) saturate(0) invert(0)', // 1: white
              'sepia(1) saturate(6) hue-rotate(10deg) brightness(1.1)', // 2: light yellow
              'sepia(1) saturate(10) hue-rotate(0deg) brightness(1)', // 3: yellow
              'sepia(1) saturate(10) hue-rotate(-30deg) brightness(0.95)', // 4: orange
              'sepia(1) saturate(8) hue-rotate(-60deg) brightness(0.8) contrast(1.4)', // 5: true red
            ];
            let filter = 'grayscale(1) brightness(0.5)';
            if (skullRating >= i) {
              filter = colorFilters[i-1];
            }
            return (
              <img
                key={i}
                className="skull-icon"
                src={'/skull.png'}
                alt={skullRating >= i ? 'Skull selected' : 'Skull'}
                style={{
                  width: 16,
                  height: 16,
                  objectFit: 'contain',
                  filter,
                  cursor: 'pointer',
                  transition: 'filter 0.15s',
                  display: 'block',
                }}
                onClick={() => setSkullRating(i)}
              />
            );
          })}
        </div>
        <div style={{ marginTop: 32, marginBottom: 0, textAlign: 'center', width: '100%' }}>
          <button
            className="button-30 sign-btn"
            style={{
              background: '#111',
              border: '3px solid #222',
              color: '#ffeba7',
              fontSize: 20,
              fontWeight: 900,
              letterSpacing: 2,
              fontFamily: 'monospace, "JetBrains Mono", "Fira Mono", "Courier New", monospace',
              textTransform: 'uppercase',
              borderRadius: 32,
              minWidth: 140,
              minHeight: 48,
              margin: '0 auto 18px auto',
              boxShadow: '0 4px 16px #000a',
              outline: 'none',
              cursor: 'pointer',
              transition: 'background 0.15s, box-shadow 0.15s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
            }}
            onClick={handleAddTask}
          >
            SIGN
          </button>
        </div>
      </div>
    </div>
      </Modal>

      {/* Category Modal */}
      <Modal open={catModalOpen} onClose={() => setCatModalOpen(false)}>
        <h3 style={{ textAlign: 'center', fontWeight: 900, fontSize: '1.1rem', marginBottom: 16 }}>Add Category</h3>
        <input
          type="text"
          value={newCat}
          onChange={e => setNewCat(e.target.value)}
          placeholder="Category name"
          style={{ width: '100%', padding: '10px', borderRadius: 6, border: 'none', marginBottom: 18, fontSize: 16, background: '#181a1b', color: '#f5f6fa', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="button-30"
            style={{
              flex: 1,
              background: '#181a1b',
              color: '#ffeba7',
              borderRadius: 32,
              fontSize: 18,
              height: 44,
              fontWeight: 900,
              border: '2px solid #222',
              fontFamily: 'monospace, "JetBrains Mono", "Fira Mono", "Courier New", monospace',
              letterSpacing: 1,
              boxShadow: '0 2px 8px #0006',
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              cursor: 'pointer',
              marginRight: 6
            }}
            onClick={() => { setCatModalOpen(false); setNewCat(''); }}
            onMouseOver={e => e.currentTarget.style.background = '#23272a'}
            onMouseOut={e => e.currentTarget.style.background = '#181a1b'}
          >
            Cancel
          </button>
          <button
            className="button-30"
            style={{
              flex: 1,
              background: '#23272a',
              color: '#ffeba7',
              borderRadius: 32,
              fontSize: 18,
              height: 44,
              fontWeight: 900,
              border: '2px solid #ffeba7',
              fontFamily: 'monospace, "JetBrains Mono", "Fira Mono", "Courier New", monospace',
              letterSpacing: 1,
              boxShadow: '0 2px 8px #0006',
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              cursor: 'pointer',
              marginLeft: 6,
              opacity: (!newCat.trim() || categories.includes(newCat.trim())) ? 0.5 : 1
            }}
            onClick={async () => {
              const cat = newCat.trim();
              if (cat && !categories.includes(cat)) {
                setCategories([...categories, cat]);
                setSelectedCategory(cat);
                try {
                  await saveUserCategory(cat);
                } catch (e) {
                  // Optionally show error
                  console.error('Failed to save category:', e);
                }
              }
              setCatModalOpen(false);
              setNewCat('');
            }}
            disabled={!newCat.trim() || categories.includes(newCat.trim())}
            onMouseOver={e => e.currentTarget.style.background = '#181a1b'}
            onMouseOut={e => e.currentTarget.style.background = '#23272a'}
          >
            Confirm
          </button>
        </div>
      </Modal>

    </div>
  );
}

export default RolesPage;
