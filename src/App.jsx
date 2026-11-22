import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { SearchX, Sparkles } from 'lucide-react'
import TopBar from './components/TopBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import QuestionCard from './components/QuestionCard.jsx'
import QuestionDetail from './components/QuestionDetail.jsx'
import AskPage from './components/AskPage.jsx'
import Pagination from './components/Pagination.jsx'
import RightRail from './components/RightRail.jsx'
import Modal from './components/Modal.jsx'
import SignInForm from './components/SignInForm.jsx'
import ImportPage from './components/ImportPage.jsx'
import SignInGate from './components/SignInGate.jsx'
import Toast from './components/Toast.jsx'
import HomePage from './pages/HomePage.jsx'
import LearnPage from './pages/LearnPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import { useRoute, navigate, openAuthPage, AUTH_ROUTES } from './lib/route.js'
import { AUTH_ENABLED, clearReturnTo, rememberReturnTo } from './auth/config.js'
import { useAuthUser, useClerkStuck } from './auth/useAuthUser.js'
import { AccountPage, SignInPage, SignUpPage } from './auth/AuthPages.jsx'
import { motionAllowed } from './lib/motion.js'
import { SUBJECTS, applyReaction, applyVote, loadQuestions, newId, parseImport, topicLabel, saveQuestions } from './lib/store.js'
import { PRACTICE_COUNT, PRACTICE_YEARS, isPractice } from './data/pyqMeta.js'
import { PLAYLISTS } from './data/playlists.js'
import {
  allUserNames,
  buildRows,
  ensureProfile,
  getProfiles,
  getSolved,
  recordActiveDay,
  toggleSolved,
  updateProfile,
} from './lib/gamify.js'
import './pages/pages.css'
import './pages/features.css'

const PAGE_SIZE = 10
const DEFAULT_FILTERS = { query: '', subject: 'All', status: 'all', sort: 'newest', year: 'All', marks: 'All', topic: 'All' }

function filterQuestions(questions, f) {
  const q = f.query.trim().toLowerCase()
  const list = questions.filter((item) => {
    if (f.subject !== 'All' && item.subject !== f.subject) return false
    if (f.marks !== 'All' && String(item.marks) !== f.marks) return false
    if (f.topic !== 'All' && item.topic !== f.topic) return false
    if (f.year !== 'All') {
      if (f.year === 'community' && item.year !== undefined) return false
      if (f.year !== 'community' && String(item.year) !== f.year) return false
    }
    if (f.status === 'answered' && item.answers.length === 0) return false
    if (f.status === 'unanswered' && item.answers.length > 0) return false
    if (!q) return true
    return (
      item.title.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      item.subject.toLowerCase().includes(q) ||
      (item.topic || '').includes(q) ||
      item.tags.some((t) => t.includes(q))
    )
  })
  const sorters = {
    newest: (a, b) => b.createdAt - a.createdAt,
    votes: (a, b) => b.votes - a.votes,
    views: (a, b) => b.views - a.views,
  }
  return [...list].sort(sorters[f.sort])
}

function readStoredUser() {
  try {
    const name = localStorage.getItem('gateq-user')
    return name ? { name } : null
  } catch {
    return null
  }
}

export default function App() {
  const route = useRoute()
  // Only community posts are saved to storage. Practice questions are generated in memory.
  const [questions, setQuestions] = useState(loadQuestions)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('gateq-theme') || 'dark'
    } catch {
      return 'dark'
    }
  })
  const [accent, setAccent] = useState(() => {
    try {
      return localStorage.getItem('gateq-accent') || 'indigo'
    } catch {
      return 'indigo'
    }
  })
  // With Clerk configured, the signed-in person comes from Clerk. Without a key the original
  // display-name demo sign-in is used.
  const auth = useAuthUser()
  const clerkStuck = useClerkStuck(auth.loaded)
  const [demoUser, setDemoUser] = useState(readStoredUser)
  const user = AUTH_ENABLED ? auth.user : demoUser
  // Questions are only visible to signed-in people. The practice bank is a separate code chunk
  // that is fetched after sign-in and dropped again on sign-out, so a signed-out visitor's
  // browser never receives the question text.
  const canView = Boolean(user)
  const sessionPending = AUTH_ENABLED && !auth.loaded
  const [practice, setPractice] = useState(null)
  // Progress for the signed-in user. Loaded once on start, and again on sign-in.
  const [solved, setSolved] = useState(() => (user ? getSolved(user.name) : {}))
  const [days, setDays] = useState(() => (user ? recordActiveDay(user.name) : []))
  const [profiles, setProfiles] = useState(getProfiles)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const mainRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    if (!canView) {
      // Signing out: drop the questions from memory.
      // oxlint-disable-next-line react/set-state-in-effect
      setPractice(null)
      return undefined
    }
    let cancelled = false
    import('./data/pyq.js').then((mod) => {
      if (!cancelled) setPractice(mod.PRACTICE_QUESTIONS)
    })
    return () => {
      cancelled = true
    }
  }, [canView])

  const bankLoading = canView && practice === null
  const allQuestions = useMemo(
    () => (canView ? [...(practice || []), ...questions] : []),
    [canView, practice, questions],
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('gateq-theme', theme)
    } catch {
      /* storage unavailable; the theme still applies for this visit */
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.accent = accent
    try {
      localStorage.setItem('gateq-accent', accent)
    } catch {
      /* storage unavailable; the accent still applies for this visit */
    }
  }, [accent])

  useEffect(() => {
    if (AUTH_ENABLED) return
    try {
      if (demoUser) localStorage.setItem('gateq-user', demoUser.name)
      else localStorage.removeItem('gateq-user')
    } catch {
      /* ignore */
    }
  }, [demoUser])

  // Clerk: load this person's progress when they sign in, and clear it when they sign out.
  const userName = user?.name
  useEffect(() => {
    if (!AUTH_ENABLED) return
    if (userName) {
      ensureProfile(userName)
      // Clerk's session is an external system; local progress has to follow it when it changes.
      // oxlint-disable-next-line react/set-state-in-effect
      setProfiles(getProfiles())
      setSolved(getSolved(userName))
      setDays(recordActiveDay(userName))
      clearReturnTo()
    } else {
      setSolved({})
      setDays([])
    }
  }, [userName])

  useEffect(() => {
    if (!saveQuestions(questions)) {
      setToast('Browser storage is full. Remove or shrink some images to save new posts.')
    }
  }, [questions])

  useEffect(() => {
    if (!motionAllowed() || !mainRef.current) return
    const tween = gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' },
    )
    return () => tween.kill()
  }, [route.name, route.id])

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(id)
  }, [toast])

  const usedSubjects = useMemo(
    () => SUBJECTS.filter((s) => s === 'General Aptitude' || allQuestions.some((q) => q.subject === s)),
    [allQuestions],
  )

  const subjectCounts = useMemo(() => {
    const counts = { All: allQuestions.length }
    for (const q of allQuestions) counts[q.subject] = (counts[q.subject] || 0) + 1
    return counts
  }, [allQuestions])

  // Marks and topic counts follow the chosen subject.
  const subjectScoped = useMemo(
    () => (filters.subject === 'All' ? allQuestions : allQuestions.filter((q) => q.subject === filters.subject)),
    [allQuestions, filters.subject],
  )
  const marksCounts = useMemo(() => {
    const counts = { All: subjectScoped.length, 1: 0, 2: 0 }
    for (const q of subjectScoped) if (q.marks) counts[q.marks] = (counts[q.marks] || 0) + 1
    return counts
  }, [subjectScoped])
  const topics = useMemo(() => {
    const counts = {}
    for (const q of subjectScoped) if (q.topic) counts[q.topic] = (counts[q.topic] || 0) + 1
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [subjectScoped])

  const yearCounts = useMemo(() => {
    const counts = { All: allQuestions.length, community: 0 }
    for (const y of PRACTICE_YEARS) counts[String(y)] = 0
    for (const q of allQuestions) {
      if (q.year === undefined) counts.community += 1
      else counts[String(q.year)] = (counts[String(q.year)] || 0) + 1
    }
    return counts
  }, [allQuestions])

  const statusCounts = useMemo(
    () => ({
      all: allQuestions.length,
      answered: allQuestions.filter((q) => q.answers.length > 0).length,
      unanswered: allQuestions.filter((q) => q.answers.length === 0).length,
    }),
    [allQuestions],
  )

  const rows = useMemo(
    () => buildRows(allQuestions, allUserNames(questions, profiles), user?.name, solved, days),
    [allQuestions, questions, profiles, user, solved, days],
  )

  const hotQuestions = useMemo(
    () =>
      [...allQuestions]
        .sort((a, b) => b.votes + b.answers.length * 2 - (a.votes + a.answers.length * 2))
        .slice(0, 3),
    [allQuestions],
  )

  const totalCount = allQuestions.length
  const filtered = useMemo(() => filterQuestions(allQuestions, filters), [allQuestions, filters])
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  function updateFilters(patch) {
    if (!canView) return
    const next = patch.subject !== undefined && patch.topic === undefined ? { ...patch, topic: 'All' } : patch
    setFilters((f) => ({ ...f, ...next }))
    setPage(1)
    if (route.name !== 'list') navigate('/questions')
  }

  const closeModal = useCallback(() => setModal(null), [])

  // Clerk: go to the sign-in page and come back afterwards. Demo: open the display-name dialog.
  function openSignIn() {
    if (AUTH_ENABLED) {
      rememberReturnTo()
      openAuthPage('sign-in')
    } else {
      setModal('signin')
    }
  }

  function openSignUp() {
    rememberReturnTo()
    openAuthPage('sign-up')
  }

  function requireUser() {
    if (user) return true
    // Still checking the Clerk session: do not bounce a signed-in person to the sign-in page.
    if (AUTH_ENABLED && !auth.loaded) return false
    openSignIn()
    return false
  }

  function handleSignIn(name) {
    ensureProfile(name)
    setProfiles(getProfiles())
    setSolved(getSolved(name))
    setDays(recordActiveDay(name))
    setDemoUser({ name })
    setModal(null)
    setToast(`Signed in as ${name}.`)
  }

  function handleSignOut() {
    if (AUTH_ENABLED) {
      auth.signOut()
      return
    }
    setDemoUser(null)
    setSolved({})
    setDays([])
    setToast('You have signed out.')
  }

  function updateQuestion(id, fn) {
    setQuestions((qs) => qs.map((q) => (q.id === id ? fn(q) : q)))
  }

  function handleVote(target, direction) {
    if (isPractice(target.questionId)) {
      setToast('Practice questions are read-only.')
      return
    }
    if (!requireUser()) return
    const name = user.name
    updateQuestion(target.questionId, (q) => {
      if (target.kind === 'question') return applyVote(q, name, direction)
      if (target.kind === 'answer') {
        return { ...q, answers: q.answers.map((a) => (a.id === target.id ? applyVote(a, name, direction) : a)) }
      }
      if (!target.answerId) {
        return { ...q, comments: q.comments.map((c) => (c.id === target.id ? applyVote(c, name, direction) : c)) }
      }
      return {
        ...q,
        answers: q.answers.map((a) =>
          a.id === target.answerId
            ? { ...a, comments: a.comments.map((c) => (c.id === target.id ? applyVote(c, name, direction) : c)) }
            : a,
        ),
      }
    })
  }

  function handleReact(target, type) {
    if (isPractice(target.questionId)) {
      setToast('Practice questions are read-only.')
      return
    }
    if (!requireUser()) return
    const name = user.name
    updateQuestion(target.questionId, (q) => {
      if (target.kind === 'question') return applyReaction(q, name, type)
      return {
        ...q,
        answers: q.answers.map((a) => (a.id === target.id ? applyReaction(a, name, type) : a)),
      }
    })
  }

  function handleAddComment(questionId, answerId, body) {
    if (isPractice(questionId)) {
      setToast('Practice questions are read-only.')
      return false
    }
    if (!requireUser()) return false
    const comment = { id: newId(), body, author: user.name, createdAt: Date.now(), votes: 0, voters: {} }
    updateQuestion(questionId, (q) =>
      answerId
        ? {
            ...q,
            answers: q.answers.map((a) => (a.id === answerId ? { ...a, comments: [...a.comments, comment] } : a)),
          }
        : { ...q, comments: [...q.comments, comment] },
    )
    setToast('Comment added.')
    return true
  }

  function handleAddAnswer(questionId, body, images) {
    if (isPractice(questionId)) {
      setToast('Practice questions are read-only.')
      return false
    }
    if (!requireUser()) return false
    const answer = {
      id: newId(),
      body,
      images,
      author: user.name,
      createdAt: Date.now(),
      votes: 0,
      voters: {},
      comments: [],
    }
    updateQuestion(questionId, (q) => ({ ...q, answers: [...q.answers, answer] }))
    setToast('Answer posted.')
    return true
  }

  function handlePost(data) {
    if (!requireUser()) return false
    const id = newId()
    const question = {
      id,
      ...data,
      author: user.name,
      createdAt: Date.now(),
      votes: 0,
      voters: {},
      views: 0,
      answers: [],
      comments: [],
    }
    setQuestions((qs) => [question, ...qs])
    setFilters(DEFAULT_FILTERS)
    setPage(1)
    navigate(`/q/${id}`)
    setToast('Your question was posted.')
    return true
  }

  // Returns the list of problems (empty when everything was imported).
  function handleImport(text) {
    if (!requireUser()) return []
    const existing = new Set(allQuestions.map((q) => q.id))
    const { questions: added, errors } = parseImport(text, user.name, existing)
    if (added.length) {
      setQuestions((qs) => [...added, ...qs])
      setToast(`Imported ${added.length} question${added.length === 1 ? '' : 's'}.`)
      if (!errors.length) navigate('/questions')
    }
    return errors
  }

  function handleToggleSolved(id) {
    if (!requireUser()) return
    const wasSolved = Boolean(solved[id])
    setSolved(toggleSolved(user.name, id))
    setToast(wasSolved ? 'Marked as not solved.' : 'Marked as solved. +3 points')
  }

  function handleSaveBio(name, bio) {
    updateProfile(name, { bio })
    setProfiles(getProfiles())
    setToast('Profile saved.')
  }

  const handleView = useCallback((id) => {
    if (isPractice(id)) return
    const key = `viewed-${id}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    setQuestions((qs) => qs.map((q) => (q.id === id ? { ...q, views: (q.views || 0) + 1 } : q)))
  }, [])

  const currentQuestion = route.name === 'question' ? allQuestions.find((q) => q.id === route.id) : null
  const isFiltered = filters.query || filters.subject !== 'All' || filters.status !== 'all' || filters.year !== 'All' || filters.marks !== 'All' || filters.topic !== 'All'
  const profileName = route.name === 'profile' ? route.id : null
  const showSidebar = canView && (route.name === 'list' || route.name === 'import' || route.name === 'question' || route.name === 'ask')

  return (
    <div className="app">
      <div className="bg-glow" aria-hidden="true" />

      {!AUTH_ENABLED && import.meta.env.MODE !== 'test' && (
        <div className="auth-missing" role="alert">
          Clerk is not connected, so this is the demo sign-in. Put <code>VITE_CLERK_PUBLISHABLE_KEY=pk_test_...</code> in a
          file named <code>.env.local</code> next to <code>package.json</code>, then stop and restart <code>npm run dev</code>.
        </div>
      )}

      {clerkStuck && (
        <div className="auth-missing" role="alert">
          Clerk could not load. Check that the key in <code>.env.local</code> is the publishable key (starts with{' '}
          <code>pk_test_</code>), turn off ad blockers or shields for localhost, and check your internet connection.
        </div>
      )}

      <TopBar
        ref={searchRef}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        accent={accent}
        onAccent={setAccent}
        route={route.name}
        user={user}
        authLoading={AUTH_ENABLED && !auth.loaded}
        canSearch={canView}
        query={filters.query}
        onQuery={(value) => updateFilters({ query: value })}
        onSignIn={openSignIn}
        onSignUp={openSignUp}
        onSignOut={handleSignOut}
      />

      <div className={`shell${showSidebar ? '' : ' wide'}`}>
        {showSidebar && (
          <Sidebar
            route={route.name}
            filters={filters}
            onChange={updateFilters}
            subjects={usedSubjects}
            subjectCounts={subjectCounts}
            statusCounts={statusCounts}
            years={PRACTICE_YEARS}
            yearCounts={yearCounts}
            marksCounts={marksCounts}
            topics={topics}
          />
        )}

        <main className="main" ref={mainRef}>
          {(route.name === 'home' || (!AUTH_ENABLED && AUTH_ROUTES.has(route.name))) && (
            <HomePage
              stats={{ questions: canView ? totalCount : PRACTICE_COUNT, playlists: PLAYLISTS.length, subjects: SUBJECTS.length }}
              subjects={usedSubjects.map((name) => ({ name, count: subjectCounts[name] || 0 }))}
              topQuestions={hotQuestions}
              onSubject={(subject) => updateFilters({ subject })}
            />
          )}

          {route.name === 'learn' && <LearnPage />}

          {AUTH_ENABLED && route.name === 'sign-in' && <SignInPage auth={auth} />}
          {AUTH_ENABLED && route.name === 'sign-up' && <SignUpPage auth={auth} />}
          {AUTH_ENABLED && route.name === 'account' && <AccountPage auth={auth} />}

          {route.name === 'ask' &&
            (!user ? (
              <SignInGate
                loading={sessionPending}
                title="Sign in to ask a question"
                text="Post questions, add images and tags, and get answers from the community."
                onSignIn={openSignIn}
                onSignUp={openSignUp}
              />
            ) : (
              <AskPage subjects={SUBJECTS} onSubmit={handlePost} onCancel={() => navigate('/questions')} />
            ))}

          {route.name === 'import' &&
            (!user ? (
              <SignInGate
                loading={sessionPending}
                title="Sign in to import questions"
                text="Importing is available to signed-in members."
                onSignIn={openSignIn}
                onSignUp={openSignUp}
              />
            ) : (
              <ImportPage onImport={handleImport} onCancel={() => navigate('/questions')} />
            ))}

          {route.name === 'question' && !user && (
            <SignInGate
              loading={sessionPending}
              title="Sign in to view this question"
              text="Questions, answers and discussions are only visible to signed-in members."
              onSignIn={openSignIn}
              onSignUp={openSignUp}
            />
          )}

          {route.name === 'question' && user && currentQuestion && (
            <QuestionDetail
              question={currentQuestion}
              user={user}
              readonly={isPractice(currentQuestion.id)}
              solved={Boolean(solved[currentQuestion.id])}
              onToggleSolved={handleToggleSolved}
              onView={handleView}
              onVote={handleVote}
              onReact={handleReact}
              onAddAnswer={handleAddAnswer}
              onAddComment={handleAddComment}
            />
          )}

          {route.name === 'question' && user && !currentQuestion && bankLoading && (
            <div className="auth-loading" role="status">
              <span>Loading question</span>
            </div>
          )}

          {route.name === 'question' && user && !currentQuestion && !bankLoading && (
            <div className="empty-state">
              <SearchX size={28} aria-hidden="true" />
              <h2>Question not found</h2>
              <p className="muted">It may have been removed from this browser.</p>
              <a className="btn btn-ghost" href="#/questions">
                Back to questions
              </a>
            </div>
          )}

          {route.name === 'dashboard' && (
            <DashboardPage
              user={user}
              solved={solved}
              days={days}
              practice={canView ? practice || [] : []}
              onSignIn={openSignIn}
              onOpenQuestion={(id) => navigate(`/q/${id}`)}
            />
          )}

          {route.name === 'leaderboard' && <LeaderboardPage rows={rows} user={user} />}

          {route.name === 'profile' && !user && (
            <SignInGate
              loading={sessionPending}
              title="Sign in to view profiles"
              text="Member profiles show activity on questions, so they are only visible to signed-in members."
              onSignIn={openSignIn}
              onSignUp={openSignUp}
            />
          )}

          {route.name === 'profile' && user && (
            <ProfilePage
              name={profileName}
              user={user}
              questions={allQuestions}
              profile={profiles[profileName]}
              solved={solved}
              days={days}
              onSaveBio={handleSaveBio}
            />
          )}

          {route.name === 'list' && !user && (
            <SignInGate
              loading={sessionPending}
              title="Sign in to view questions"
              text="The question bank is only available to signed-in members. Sign in or create a free account to browse GATE CSE questions by year and subject."
              onSignIn={openSignIn}
              onSignUp={openSignUp}
            />
          )}

          {route.name === 'list' && user && (
            <div className="list-layout">
            <section className="list-view">
              <header className="list-head">
                <div>
                  <h1>All questions</h1>
                  <p className="muted">
                    {filtered.length} {filtered.length === 1 ? 'question' : 'questions'}
                    {filters.year !== 'All' ? ` · ${filters.year === 'community' ? 'community posts' : `GATE CSE ${filters.year}`}` : ''}
                    {filters.subject !== 'All' ? ` · ${filters.subject}` : ''}
                    {filters.topic !== 'All' ? ` · ${topicLabel(filters.topic)}` : ''}
                    {filters.marks !== 'All' ? ` · ${filters.marks} mark${filters.marks === '1' ? '' : 's'}` : ''}
                  </p>
                  <p className="muted small note">
                    Built-in 2010–2016 practice questions are original and generated in your browser. Use Import questions to add real previous-year questions, including General Aptitude.
                  </p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => navigate('/ask')}>
                  Ask a question
                </button>
              </header>

              {bankLoading ? (
                <div className="auth-loading" role="status">
                  <span>Loading questions</span>
                </div>
              ) : totalCount === 0 ? (
                <div className="empty-state">
                  <Sparkles size={28} aria-hidden="true" />
                  <h2>No questions yet</h2>
                  <p className="muted">Be the first to post one. You can attach images and tags.</p>
                  <button type="button" className="btn btn-primary" onClick={() => navigate('/ask')}>
                    Ask the first question
                  </button>
                </div>
              ) : pageItems.length === 0 ? (
                <div className="empty-state">
                  <SearchX size={28} aria-hidden="true" />
                  <h2>No matches</h2>
                  <p className="muted">{isFiltered ? 'Try a different search, or clear the filters.' : 'Nothing to show here yet.'}</p>
                </div>
              ) : (
                <div className="question-list">
                  {pageItems.map((q) => (
                    <QuestionCard key={q.id} question={q} />
                  ))}
                </div>
              )}

              <Pagination page={currentPage} pageCount={pageCount} onPage={setPage} />
            </section>
            <RightRail user={user} rows={rows} hot={hotQuestions} onSignUp={openSignUp} />
            </div>
          )}
        </main>
      </div>

      {modal === 'signin' && (
        <Modal title="Sign in" onClose={closeModal}>
          <SignInForm onSubmit={handleSignIn} />
        </Modal>
      )}

      {toast && <Toast key={toast} message={toast} />}
    </div>
  )
}
