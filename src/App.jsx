import { useEffect, useMemo, useState } from "react";
import {
  Search, MapPin, BriefcaseBusiness, Clock3, Plus, X, Pencil, Trash2,
  ArrowUpRight, Sparkles, Building2, CheckCircle2, AlertCircle, Send, Code2
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const emptyJob = { title: "", company: "", location: "", type: "Full-time", salary: "", description: "", skills: "" };

function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("All types");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [appForm, setAppForm] = useState({ applicantName: "", email: "", profileUrl: "", coverLetter: "" });
  const [busy, setBusy] = useState(false);

  async function loadJobs() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (type !== "All types") params.set("type", type);
      const response = await fetch(`${API}/jobs?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not load jobs");
      setJobs(data);
    } catch (err) {
      setError(`${err.message}. Make sure the backend and MongoDB are running.`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadJobs(); }, [search, type]);

  const featuredCount = useMemo(() => jobs.filter(job => job.type === "Internship").length, [jobs]);

  function openCreate() {
    setJobForm(emptyJob);
    setModal({ kind: "job" });
  }

  function openEdit(job) {
    setJobForm({ ...job, skills: (job.skills || []).join(", ") });
    setModal({ kind: "job", job });
  }

  function openApply(job) {
    setAppForm({ applicantName: "", email: "", profileUrl: "", coverLetter: "" });
    setModal({ kind: "apply", job });
  }

  async function saveJob(event) {
    event.preventDefault();
    setBusy(true);
    setNotice("");
    try {
      const editing = Boolean(modal.job);
      const response = await fetch(editing ? `${API}/jobs/${modal.job._id}` : `${API}/jobs`, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save job");
      setModal(null);
      setNotice(editing ? "Job listing updated successfully." : "Job listing published successfully.");
      await loadJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteJob(job) {
    if (!window.confirm(`Delete "${job.title}" at ${job.company}?`)) return;
    try {
      const response = await fetch(`${API}/jobs/${job._id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not delete job");
      setNotice("Job listing deleted.");
      await loadJobs();
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitApplication(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch(`${API}/jobs/${modal.job._id}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not submit application");
      setModal(null);
      setNotice("Application submitted successfully. Good luck!");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#" aria-label="JobNest home">
          <span className="brand-mark"><BriefcaseBusiness size={21} /></span>
          <span>job<span className="brand-accent">nest</span></span>
        </a>
        <nav><a className="nav-active" href="#jobs">Find jobs</a><a href="#how-it-works">How it works</a></nav>
        <button className="button button-dark top-post" onClick={openCreate}><Plus size={17} /> Post a job</button>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles size={15} /> YOUR NEXT CHAPTER STARTS HERE</div>
            <h1>Find work that<br /> <span>moves you forward.</span></h1>
            <p>Discover meaningful opportunities from teams building the future. Your next great role is closer than you think.</p>
            <div className="hero-points"><span><CheckCircle2 size={16} /> Curated opportunities</span><span><CheckCircle2 size={16} /> Simple applications</span></div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
            <div className="art-card art-card-main"><div className="art-logo"><Code2 size={24} /></div><div><b>Build something great</b><small>Product & technology roles</small></div><ArrowUpRight size={20} /></div>
            <div className="art-card art-card-small"><span className="art-dot"></span><div><b>New opportunities</b><small>Added every week</small></div></div>
            <div className="art-spark spark-one">✳</div><div className="art-spark spark-two">✦</div>
          </div>
          <div className="hero-stats">
            <div><strong>{jobs.length}+</strong><span>Open opportunities</span></div>
            <div><strong>{featuredCount}</strong><span>Internships listed</span></div>
            <div><strong>100%</strong><span>Made for your next step</span></div>
          </div>
        </section>

        <section className="jobs-section" id="jobs">
          <div className="section-heading">
            <div><div className="eyebrow">OPPORTUNITIES</div><h2>Find your fit.</h2><p>Explore roles that match your skills and ambitions.</p></div>
            <button className="button button-outline" onClick={openCreate}><Plus size={17} /> Add listing</button>
          </div>

          <div className="search-panel">
            <div className="search-input-wrap"><Search size={20} /><input aria-label="Search jobs" value={search} onChange={e => setSearch(e.target.value)} placeholder="Job title, company, or keyword" /></div>
            <div className="filter-wrap"><BriefcaseBusiness size={18} /><select aria-label="Filter by job type" value={type} onChange={e => setType(e.target.value)}><option>All types</option><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option></select></div>
            <button className="button button-primary search-button" onClick={loadJobs}><Search size={17} /> Search jobs</button>
          </div>

          {notice && <div className="notice"><CheckCircle2 size={17} /> {notice}<button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16} /></button></div>}
          {error && <div className="error-banner"><AlertCircle size={18} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={16} /></button></div>}

          <div className="results-bar"><span>{loading ? "Loading opportunities…" : `${jobs.length} ${jobs.length === 1 ? "opportunity" : "opportunities"} found`}</span><span className="results-sort">Recently added <Clock3 size={14} /></span></div>

          {loading ? <div className="empty-state"><div className="loader"></div><p>Finding opportunities for you…</p></div> :
            jobs.length === 0 ? <div className="empty-state"><div className="empty-icon"><Search size={24} /></div><h3>No jobs found</h3><p>Try a different keyword or job type.</p><button className="button button-outline" onClick={() => { setSearch(""); setType("All types"); }}>Clear filters</button></div> :
            <div className="job-grid">{jobs.map(job => <article className="job-card" key={job._id}>
              <div className="job-card-top"><div className="company-avatar">{(job.company || "C").slice(0, 1).toUpperCase()}</div><div className="job-top-actions"><span className={`job-type type-${job.type.toLowerCase().replace("-", "")}`}>{job.type}</span><button className="icon-button" title="Edit job" onClick={() => openEdit(job)}><Pencil size={15} /></button><button className="icon-button danger-hover" title="Delete job" onClick={() => deleteJob(job)}><Trash2 size={15} /></button></div></div>
              <h3>{job.title}</h3><div className="company-name"><Building2 size={15} /> {job.company}</div>
              <div className="job-meta"><span><MapPin size={15} /> {job.location}</span><span><BriefcaseBusiness size={15} /> {job.salary || "Salary not specified"}</span></div>
              <p className="job-description">{job.description}</p>
              <div className="skills">{(job.skills || []).slice(0, 4).map(skill => <span key={skill}>{skill}</span>)}</div>
              <div className="job-card-footer"><span className="posted-date"><Clock3 size={14} /> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Recently posted"}</span><button className="apply-link" onClick={() => openApply(job)}>Apply now <ArrowUpRight size={16} /></button></div>
            </article>)}</div>
          }
        </section>

        <section className="how-section" id="how-it-works">
          <div className="eyebrow">A BETTER WAY TO BEGIN</div><h2>Three steps to your next role.</h2>
          <div className="steps-grid"><div className="step"><span>01</span><Search size={22} /><h3>Discover</h3><p>Search opportunities by skill, location, and the work you want to do.</p></div><div className="step"><span>02</span><Send size={22} /><h3>Apply</h3><p>Share your details and a short note with the hiring team.</p></div><div className="step"><span>03</span><Sparkles size={22} /><h3>Grow</h3><p>Take the next step toward work that fits your goals.</p></div></div>
        </section>
      </main>

      <footer><a className="brand footer-brand" href="#"><span className="brand-mark"><BriefcaseBusiness size={18} /></span><span>job<span className="brand-accent">nest</span></span></a><span>Built to help good people find great work.</span><span>© {new Date().getFullYear()} JobNest · MERN internship project</span></footer>

      {modal && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setModal(null); }}>
        <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div className="modal-header"><div><div className="eyebrow">{modal.kind === "job" ? "EMPLOYER WORKSPACE" : "TAKE THE NEXT STEP"}</div><h2 id="modal-title">{modal.kind === "job" ? (modal.job ? "Edit job listing" : "Post a new job") : "Apply for this role"}</h2></div><button className="icon-button modal-close" onClick={() => setModal(null)} aria-label="Close"><X size={20} /></button></div>
          {modal.kind === "job" ? <form onSubmit={saveJob} className="modal-form">
            <label>Job title *<input required maxLength="100" value={jobForm.title} onChange={e => setJobForm({ ...jobForm, title: e.target.value })} placeholder="e.g. Frontend Developer" /></label>
            <div className="form-row"><label>Company *<input required maxLength="100" value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} placeholder="Company name" /></label><label>Location *<input required maxLength="100" value={jobForm.location} onChange={e => setJobForm({ ...jobForm, location: e.target.value })} placeholder="e.g. Remote" /></label></div>
            <div className="form-row"><label>Job type<select value={jobForm.type} onChange={e => setJobForm({ ...jobForm, type: e.target.value })}><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option></select></label><label>Salary / stipend<input maxLength="80" value={jobForm.salary} onChange={e => setJobForm({ ...jobForm, salary: e.target.value })} placeholder="e.g. ₹4–6 LPA" /></label></div>
            <label>Description *<textarea required maxLength="5000" rows="4" value={jobForm.description} onChange={e => setJobForm({ ...jobForm, description: e.target.value })} placeholder="Describe the role, responsibilities, and requirements…" /></label>
            <label>Skills <input value={jobForm.skills} onChange={e => setJobForm({ ...jobForm, skills: e.target.value })} placeholder="React, JavaScript, CSS (comma separated)" /></label>
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Saving…" : modal.job ? "Save changes" : "Publish job"}</button></div>
          </form> : <form onSubmit={submitApplication} className="modal-form">
            <div className="apply-role"><div className="company-avatar">{modal.job.company.slice(0, 1).toUpperCase()}</div><div><b>{modal.job.title}</b><span>{modal.job.company} · {modal.job.location}</span></div></div>
            <label>Full name *<input required maxLength="100" value={appForm.applicantName} onChange={e => setAppForm({ ...appForm, applicantName: e.target.value })} placeholder="Your full name" /></label>
            <label>Email address *<input required type="email" value={appForm.email} onChange={e => setAppForm({ ...appForm, email: e.target.value })} placeholder="you@example.com" /></label>
            <label>Portfolio / LinkedIn URL<input type="url" value={appForm.profileUrl} onChange={e => setAppForm({ ...appForm, profileUrl: e.target.value })} placeholder="https://…" /></label>
            <label>Short cover note<textarea rows="4" maxLength="3000" value={appForm.coverLetter} onChange={e => setAppForm({ ...appForm, coverLetter: e.target.value })} placeholder="Tell the team why you are interested…" /></label>
            <div className="modal-actions"><button type="button" className="button button-outline" onClick={() => setModal(null)}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? "Submitting…" : "Submit application"} <ArrowUpRight size={16} /></button></div>
          </form>}
        </section>
      </div>}
    </div>
  );
}

export default App;
