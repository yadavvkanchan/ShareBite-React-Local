import React, { useEffect, useMemo, useState } from 'react'
import {
  HeartHandshake, LayoutDashboard, Package, Users, Truck, Leaf, LogOut,
  Plus, Search, MapPin, Clock3, CheckCircle2, CircleAlert, Sprout,
  TrendingUp, Utensils, HandHeart, Building2, UserRound, ArrowRight,
  RotateCcw, X, Menu, ClipboardList, Bike, ChevronDown
} from 'lucide-react'

const roles = [
  { id: 'donor', label: 'Donor', desc: 'Share surplus food', icon: Utensils },
  { id: 'charity', label: 'Charity / NGO', desc: 'Coordinate community needs', icon: Building2 },
  { id: 'volunteer', label: 'Volunteer', desc: 'Help deliver donations', icon: Bike },
  { id: 'needy', label: 'Needy', desc: 'Find available food support', icon: HandHeart },
]
const seedDonations = [
  { id: 101, title: 'Fresh vegetable meal boxes', category: 'Cooked meals', quantity: 25, unit: 'meal boxes', location: 'Bhandup West, Mumbai', expiry: 'Today, 7:00 PM', donor: 'Green Plate Cafe', status: 'Available', description: 'Freshly prepared vegetarian meal boxes. Please collect in insulated bags.', created: Date.now() - 100000 },
  { id: 102, title: 'Bakery bread & buns', category: 'Bakery', quantity: 40, unit: 'pieces', location: 'Powai, Mumbai', expiry: 'Today, 8:30 PM', donor: 'Daily Crust Bakery', status: 'Available', description: 'Packed bread and buns from today’s batch.', created: Date.now() - 200000 },
  { id: 103, title: 'Seasonal fruits', category: 'Produce', quantity: 18, unit: 'kg', location: 'Kanjurmarg, Mumbai', expiry: 'Tomorrow, 11:00 AM', donor: 'Fresh Basket Store', status: 'Claimed', description: 'Bananas, apples and oranges. Good condition.', created: Date.now() - 300000 },
  { id: 104, title: 'Packed lunch portions', category: 'Cooked meals', quantity: 15, unit: 'portions', location: 'Vikhroli, Mumbai', expiry: 'Today, 6:30 PM', donor: 'Community Kitchen', status: 'Available', description: 'Vegetarian packed lunch portions.', created: Date.now() - 400000 },
]
const seedRequests = [
  { id: 501, donationId: 103, donationTitle: 'Seasonal fruits', requester: 'Sunrise Community Centre', requesterRole: 'charity', quantity: 10, status: 'Approved', volunteer: 'Aarav S.', location: 'Kanjurmarg, Mumbai', created: Date.now() - 150000 },
]
const seedVolunteers = [
  { id: 601, donationId: 103, title: 'Seasonal fruits', pickup: 'Fresh Basket Store', dropoff: 'Sunrise Community Centre', location: 'Kanjurmarg, Mumbai', status: 'In progress', volunteer: 'Aarav S.' },
]

function readLocal(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback } catch { return fallback }
}
function App() {
  const [role, setRole] = useState(() => localStorage.getItem('sb_role') || '')
  const [userName, setUserName] = useState(() => localStorage.getItem('sb_name') || '')
  const [donations, setDonations] = useState(() => readLocal('sb_donations', seedDonations))
  const [requests, setRequests] = useState(() => readLocal('sb_requests', seedRequests))
  const [deliveries, setDeliveries] = useState(() => readLocal('sb_deliveries', seedVolunteers))
  const [page, setPage] = useState('overview')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')
  const [newDonation, setNewDonation] = useState({ title:'', category:'Cooked meals', quantity:'', unit:'meal boxes', location:'', expiry:'Today, 7:00 PM', description:'' })

  useEffect(() => localStorage.setItem('sb_donations', JSON.stringify(donations)), [donations])
  useEffect(() => localStorage.setItem('sb_requests', JSON.stringify(requests)), [requests])
  useEffect(() => localStorage.setItem('sb_deliveries', JSON.stringify(deliveries)), [deliveries])
  useEffect(() => { if (role) localStorage.setItem('sb_role', role) }, [role])
  useEffect(() => { if (userName) localStorage.setItem('sb_name', userName) }, [userName])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2600); return () => clearTimeout(t) } }, [toast])

  const roleInfo = roles.find(r => r.id === role) || roles[0]
  const available = donations.filter(d => d.status === 'Available')
  const totalMeals = donations.reduce((sum, d) => sum + Number(d.quantity || 0), 0)
  const myRequests = requests.filter(r => role === 'needy' ? r.requester === userName : role === 'charity' ? r.requesterRole === 'charity' : true)
  const filteredDonations = useMemo(() => donations.filter(d => {
    const matchesSearch = `${d.title} ${d.category} ${d.location} ${d.donor}`.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || d.status === filter
    return matchesSearch && matchesFilter
  }), [donations, search, filter])

  function signIn(selectedRole, name) {
    setRole(selectedRole); setUserName(name.trim() || (roles.find(r=>r.id===selectedRole)?.label || 'Member'))
    setPage('overview')
  }
  function signOut() {
    setRole(''); setPage('overview'); localStorage.removeItem('sb_role'); localStorage.removeItem('sb_name')
  }
  function addDonation(e) {
    e.preventDefault()
    if (!newDonation.title.trim() || !newDonation.quantity || !newDonation.location.trim()) return
    const item = { ...newDonation, id: Date.now(), quantity: Number(newDonation.quantity), donor: userName, status: 'Available', created: Date.now() }
    setDonations(prev => [item, ...prev]); setNewDonation({ title:'', category:'Cooked meals', quantity:'', unit:'meal boxes', location:'', expiry:'Today, 7:00 PM', description:'' })
    setShowForm(false); setToast('Donation published successfully')
  }
  function claimDonation(d) {
    if (requests.some(r => r.donationId === d.id && r.requester === userName && r.status !== 'Rejected')) { setToast('You already requested this donation'); return }
    setRequests(prev => [{ id: Date.now(), donationId:d.id, donationTitle:d.title, requester:userName, requesterRole:role, quantity:d.quantity, status:'Pending', volunteer:'Not assigned', location:d.location, created:Date.now() }, ...prev])
    setDonations(prev => prev.map(x => x.id === d.id ? {...x, status:'Claimed'} : x))
    setToast('Request sent. Check My Requests for updates.')
  }
  function approveRequest(req) {
    setRequests(prev => prev.map(r => r.id === req.id ? {...r, status:'Approved'} : r))
    setToast('Request approved')
  }
  function assignDelivery(req) {
    setDeliveries(prev => [{ id:Date.now(), donationId:req.donationId, title:req.donationTitle, pickup:'Donor location', dropoff:req.requester, location:req.location, status:'Available', volunteer:'Unassigned' }, ...prev])
    setToast('Delivery task added for volunteers')
  }
  function updateDelivery(id, status) {
    setDeliveries(prev => prev.map(d => d.id === id ? {...d, status, volunteer:userName} : d))
    setToast(`Delivery marked ${status.toLowerCase()}`)
  }
  function resetDemo() {
    if (!confirm('Reset all local ShareBite data to demo data?')) return
    setDonations(seedDonations); setRequests(seedRequests); setDeliveries(seedVolunteers)
    setToast('Demo data restored')
  }

  if (!role) return <Welcome onSignIn={signIn} />
  const navItems = [
    { id:'overview', label:'Overview', icon:LayoutDashboard },
    { id:'donations', label:role==='donor'?'My donations':'Browse donations', icon:Package },
    ...(role==='needy' ? [{id:'requests',label:'My requests',icon:ClipboardList}] : []),
    ...(role==='charity' ? [{id:'requests',label:'Manage requests',icon:ClipboardList}] : []),
    ...(role==='volunteer' ? [{id:'deliveries',label:'Delivery tasks',icon:Truck}] : []),
    { id:'impact', label:'Impact & analytics', icon:TrendingUp },
  ]
  const titleMap = { overview:'Overview', donations:role==='donor'?'My donations':'Food donations', requests:role==='charity'?'Manage requests':'My requests', deliveries:'Delivery tasks', impact:'Impact & analytics' }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav?'open':''}`}>
      <div className="brand"><div className="brand-mark"><HeartHandshake size={22}/></div><div><strong>ShareBite</strong><span>Giving made simple</span></div><button className="mobile-close" onClick={()=>setMobileNav(false)}><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{navItems.map(item => <button key={item.id} className={`nav-item ${page===item.id?'active':''}`} onClick={()=>{setPage(item.id);setMobileNav(false)}}><item.icon size={18}/><span>{item.label}</span>{item.id==='requests' && role==='charity' && requests.filter(r=>r.status==='Pending').length>0 && <i className="nav-count">{requests.filter(r=>r.status==='Pending').length}</i>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="eco-card"><div className="eco-icon"><Sprout size={20}/></div><strong>Small actions, big impact</strong><p>Every shared meal helps build a kinder community.</p></div>
        <button className="nav-item" onClick={resetDemo}><RotateCcw size={17}/><span>Reset demo data</span></button>
        <button className="nav-item signout" onClick={signOut}><LogOut size={17}/><span>Sign out</span></button>
      </div>
    </aside>
    {mobileNav && <div className="mobile-scrim" onClick={()=>setMobileNav(false)} />}
    <main className="main-area">
      <header className="topbar"><div className="top-left"><button className="menu-btn" onClick={()=>setMobileNav(true)}><Menu size={20}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{titleMap[page]}</strong></div></div><div className="top-right"><div className="status-pill"><span className="live-dot"/> Local demo</div><div className="user-chip"><div className="avatar">{userName.slice(0,1).toUpperCase()}</div><div className="user-chip-text"><strong>{userName}</strong><span>{roleInfo.label}</span></div><ChevronDown size={15}/></div></div></header>
      <section className="page-content">
        <div className="page-heading"><div><div className="eyebrow">{roleInfo.label.toUpperCase()} PORTAL</div><h1>{page==='overview'?`Welcome back, ${userName.split(' ')[0]}!`:titleMap[page]}</h1><p>{page==='overview'?'Here’s what’s happening in your food-sharing community today.':page==='donations'?'Find, share, and manage food donations near your community.':page==='requests'?'Keep track of requests and coordinate food support.':page==='deliveries'?'Help move food from donors to the people who need it.':'See the community impact made possible through ShareBite.'}</p></div>{role==='donor' && page==='donations' && <button className="primary-btn" onClick={()=>setShowForm(true)}><Plus size={17}/> Add donation</button>}</div>
        {page==='overview' && <Overview role={role} userName={userName} donations={donations} requests={requests} deliveries={deliveries} available={available} totalMeals={totalMeals} setPage={setPage} onClaim={claimDonation} />}
        {page==='donations' && <Donations role={role} userName={userName} donations={role==='donor'?donations.filter(d=>d.donor===userName):filteredDonations} allDonations={donations} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} onClaim={claimDonation} onAdd={()=>setShowForm(true)} />}
        {page==='requests' && <Requests role={role} requests={requests} userName={userName} onApprove={approveRequest} onAssign={assignDelivery} />}
        {page==='deliveries' && <Deliveries deliveries={deliveries} onUpdate={updateDelivery} />}
        {page==='impact' && <Impact donations={donations} requests={requests} deliveries={deliveries} totalMeals={totalMeals} />}
        <footer className="footer"><span>© 2026 ShareBite</span><span><span className="footer-dot"/> Your data stays in this browser</span></footer>
      </section>
    </main>
    {showForm && <div className="modal-backdrop" onClick={()=>setShowForm(false)}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><div className="eyebrow">DONATE FOOD</div><h2>Share a donation</h2><p>List surplus food for your community.</p></div><button className="icon-btn" onClick={()=>setShowForm(false)}><X size={20}/></button></div><form onSubmit={addDonation} className="donation-form"><label>Donation title<input required value={newDonation.title} onChange={e=>setNewDonation({...newDonation,title:e.target.value})} placeholder="e.g. Fresh lunch boxes"/></label><div className="form-row"><label>Category<select value={newDonation.category} onChange={e=>setNewDonation({...newDonation,category:e.target.value})}><option>Cooked meals</option><option>Bakery</option><option>Produce</option><option>Packaged food</option><option>Dairy</option></select></label><label>Quantity<input required type="number" min="1" value={newDonation.quantity} onChange={e=>setNewDonation({...newDonation,quantity:e.target.value})} placeholder="e.g. 20"/></label></div><div className="form-row"><label>Unit<select value={newDonation.unit} onChange={e=>setNewDonation({...newDonation,unit:e.target.value})}><option>meal boxes</option><option>portions</option><option>kg</option><option>pieces</option><option>packets</option></select></label><label>Best before<select value={newDonation.expiry} onChange={e=>setNewDonation({...newDonation,expiry:e.target.value})}><option>Today, 6:00 PM</option><option>Today, 7:00 PM</option><option>Today, 8:30 PM</option><option>Tomorrow, 11:00 AM</option></select></label></div><label>Pickup location<input required value={newDonation.location} onChange={e=>setNewDonation({...newDonation,location:e.target.value})} placeholder="Area, city"/></label><label>Notes (optional)<textarea value={newDonation.description} onChange={e=>setNewDonation({...newDonation,description:e.target.value})} placeholder="Food details, pickup instructions..." rows="3"/></label><div className="modal-actions"><button type="button" className="secondary-btn" onClick={()=>setShowForm(false)}>Cancel</button><button className="primary-btn" type="submit"><Plus size={17}/> Publish donation</button></div></form></div></div>}
    {toast && <div className="toast"><CheckCircle2 size={18}/>{toast}</div>}
  </div>
}

function Welcome({onSignIn}) {
  const [selected, setSelected] = useState('donor')
  const [name, setName] = useState('')
  const chosen = roles.find(r=>r.id===selected)
  return <div className="welcome-page"><div className="welcome-nav"><div className="brand"><div className="brand-mark"><HeartHandshake size={22}/></div><div><strong>ShareBite</strong><span>Giving made simple</span></div></div><div className="welcome-tag"><Leaf size={15}/> Food is meant to be shared</div></div><div className="welcome-layout"><div className="welcome-copy"><div className="hero-kicker"><span/> A COMMUNITY THAT CARES</div><h1>Good food.<br/><em>Good people.</em><br/>Greater impact.</h1><p>Connect surplus food with the people who need it. ShareBite brings donors, charities, volunteers, and communities together to reduce food waste and spread kindness.</p><div className="hero-stats"><div><strong>4</strong><span>community roles</span></div><div><strong>One</strong><span>shared purpose</span></div><div><strong>∞</strong><span>ways to help</span></div></div><div className="hero-note"><div className="note-icon"><HeartHandshake size={19}/></div><span>Every meal shared is a little hope delivered.</span></div></div><div className="login-card"><div className="login-card-head"><div className="mini-logo"><HeartHandshake size={20}/></div><h2>Enter your community</h2><p>Choose a role to explore your dashboard.</p></div><div className="role-grid">{roles.map(r=><button key={r.id} onClick={()=>setSelected(r.id)} className={`role-option ${selected===r.id?'selected':''}`}><div className="role-icon"><r.icon size={20}/></div><div><strong>{r.label}</strong><span>{r.desc}</span></div><span className="radio-dot"/></button>)}</div><label className="name-label">Your display name<input value={name} onChange={e=>setName(e.target.value)} placeholder={selected==='donor'?'e.g. Green Plate Cafe':selected==='charity'?'e.g. Sunrise NGO':selected==='volunteer'?'e.g. Aarav Sharma':'e.g. Riya'} onKeyDown={e=>e.key==='Enter'&&onSignIn(selected,name)}/></label><button className="primary-btn continue-btn" onClick={()=>onSignIn(selected,name)}>Continue to dashboard <ArrowRight size={17}/></button><div className="demo-disclaimer"><CircleAlert size={14}/> Demo mode · No password or API key needed</div></div></div><div className="welcome-bottom"><span>© 2026 ShareBite</span><span>Built for a more thoughtful food system <HeartHandshake size={14}/></span></div></div>
}

function StatCard({icon:Icon,label,value,detail,tone='green'}) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={20}/></div><div className="stat-info"><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div>
}
function Overview({role,userName,donations,requests,deliveries,available,totalMeals,setPage,onClaim}) {
  const roleRequests = requests.filter(r => role==='needy'?r.requester===userName:role==='charity'?r.requesterRole==='charity':true)
  const recent = donations.slice(0,4)
  return <>
    <div className="stats-grid">
      <StatCard icon={Package} label={role==='donor'?'My donations':'Available donations'} value={role==='donor'?donations.filter(d=>d.donor===userName).length:available.length} detail={role==='donor'?'Food listings created':'Ready to be claimed'} />
      <StatCard icon={Utensils} label="Food portions listed" value={totalMeals.toLocaleString()} detail="Across all local listings" tone="orange"/>
      <StatCard icon={HandHeart} label={role==='charity'?'Community requests':'My requests'} value={roleRequests.length} detail="Requests tracked locally" tone="purple"/>
      <StatCard icon={Truck} label="Deliveries" value={deliveries.length} detail="Tasks in the delivery board" tone="blue"/>
    </div>
    <div className="overview-grid"><section className="panel donations-panel"><div className="panel-heading"><div><h3>{role==='donor'?'Your recent donations':'Available food nearby'}</h3><p>{role==='donor'?'A quick look at your food listings':'Discover food that can be shared today'}</p></div><button className="text-btn" onClick={()=>setPage('donations')}>View all <ArrowRight size={15}/></button></div><div className="donation-list">{(role==='donor'?donations.filter(d=>d.donor===userName).slice(0,4):recent.filter(d=>d.status==='Available').slice(0,4)).map(d=><DonationRow key={d.id} d={d} role={role} onClaim={onClaim}/>)}{(role==='donor'?donations.filter(d=>d.donor===userName):recent.filter(d=>d.status==='Available')).length===0&&<EmptyState title="Nothing here yet" text="Food listings will appear here when available."/>}</div></section><section className="panel impact-panel"><div className="panel-heading"><div><h3>Your community impact</h3><p>Small steps make a real difference</p></div><div className="impact-badge"><Sprout size={16}/></div></div><div className="impact-number"><strong>{Math.round(totalMeals*0.7)}</strong><span>estimated meals shared</span></div><div className="progress-label"><span>Community food recovery</span><strong>{Math.min(100,Math.round((donations.filter(d=>d.status!=='Available').length/Math.max(1,donations.length))*100))}%</strong></div><div className="progress-track"><div style={{width:`${Math.min(100,Math.round((donations.filter(d=>d.status!=='Available').length/Math.max(1,donations.length))*100))}%`}}/></div><div className="impact-tip"><Leaf size={17}/><p><strong>Track My Tree</strong><br/>Your helpful actions grow your impact score. Keep sharing and supporting local food recovery.</p></div><button className="secondary-btn full-btn" onClick={()=>setPage('impact')}>Explore impact <ArrowRight size={15}/></button></section></div>
    {role==='volunteer' && <div className="callout-row"><div className="callout-icon"><Truck size={21}/></div><div><strong>Ready to lend a hand?</strong><p>Check delivery tasks and help food reach the right people.</p></div><button className="secondary-btn" onClick={()=>setPage('deliveries')}>View tasks <ArrowRight size={15}/></button></div>}
    {role==='needy' && <div className="callout-row"><div className="callout-icon"><HandHeart size={21}/></div><div><strong>Find food support near you</strong><p>Browse available donations and send a request for what you need.</p></div><button className="secondary-btn" onClick={()=>setPage('donations')}>Browse food <ArrowRight size={15}/></button></div>}
  </>
}
function DonationRow({d,role,onClaim}) {
  return <div className="donation-row"><div className="food-thumb"><Utensils size={20}/></div><div className="donation-main"><strong>{d.title}</strong><span><MapPin size={12}/>{d.location}</span><small>{d.quantity} {d.unit} · {d.category}</small></div><div className="donation-end"><span className={`status ${d.status.toLowerCase()}`}>{d.status}</span>{(role==='needy'||role==='charity')&&d.status==='Available'&&<button className="small-action" onClick={()=>onClaim(d)}>Request</button>}</div></div>
}
function Donations({role,userName,donations,allDonations,search,setSearch,filter,setFilter,onClaim,onAdd}) {
  const isDonor = role==='donor'
  return <><div className="filter-bar"><div className="search-wrap"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search food, category, or location..."/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option>All</option><option>Available</option><option>Claimed</option><option>Completed</option></select>{isDonor&&<button className="primary-btn" onClick={onAdd}><Plus size={17}/> Add donation</button>}</div><div className="results-caption">{isDonor?'Your food listings':`${donations.length} food listing${donations.length===1?'':'s'} found`} <span>• Stored on this device</span></div><div className="donation-cards">{donations.map(d=><div className="food-card" key={d.id}><div className="food-card-art"><div className="food-card-symbol"><Utensils size={26}/></div><span className={`status ${d.status.toLowerCase()}`}>{d.status}</span></div><div className="food-card-body"><div className="food-category">{d.category}</div><h3>{d.title}</h3><p className="food-description">{d.description||'Food donation available for local community collection.'}</p><div className="food-meta"><span><Package size={15}/>{d.quantity} {d.unit}</span><span><Clock3 size={15}/>{d.expiry}</span><span><MapPin size={15}/>{d.location}</span></div><div className="food-card-footer"><div className="donor-mini"><div className="avatar small">{(d.donor||'D').slice(0,1)}</div><span>{d.donor}</span></div>{!isDonor&&(role==='needy'||role==='charity')&&d.status==='Available'&&<button className="small-action" onClick={()=>onClaim(d)}>Request food <ArrowRight size={14}/></button>}</div></div></div>)}{donations.length===0&&<div className="panel empty-panel"><EmptyState title="No matching donations" text="Try another search or change the status filter."/></div>}</div></>
}
function Requests({role,requests,userName,onApprove,onAssign}) {
  const visible = role==='charity' ? requests : role==='needy' ? requests.filter(r=>r.requester===userName) : requests
  return <div className="panel table-panel"><div className="panel-heading"><div><h3>{role==='charity'?'Incoming food requests':'Request history'}</h3><p>{role==='charity'?'Review community requests and coordinate deliveries':'Updates for your food requests'}</p></div><span className="count-badge">{visible.length} total</span></div>{visible.length===0?<EmptyState title="No requests yet" text="New food requests will show up here."/>:<div className="request-list">{visible.map(r=><div className="request-row" key={r.id}><div className="request-icon"><ClipboardList size={19}/></div><div className="request-details"><strong>{r.donationTitle}</strong><span>Requested by {r.requester} · {r.quantity} portions</span><small><MapPin size={12}/>{r.location}</small></div><div className="request-actions"><span className={`status ${r.status.toLowerCase()}`}>{r.status}</span>{role==='charity'&&r.status==='Pending'&&<button className="small-action" onClick={()=>onApprove(r)}>Approve</button>}{role==='charity'&&r.status==='Approved'&&<button className="small-action" onClick={()=>onAssign(r)}>Arrange delivery</button>}</div></div>)}</div>}</div>
}
function Deliveries({deliveries,onUpdate}) {
  return <div className="delivery-grid">{deliveries.map(d=><div className="delivery-card" key={d.id}><div className="delivery-top"><div className="delivery-icon"><Truck size={22}/></div><span className={`status ${d.status.toLowerCase().replace(' ','-')}`}>{d.status}</span></div><h3>{d.title}</h3><div className="route-line"><div className="route-dot"/><div><small>PICKUP</small><strong>{d.pickup}</strong></div></div><div className="route-line"><div className="route-dot end"/><div><small>DROP-OFF</small><strong>{d.dropoff}</strong></div></div><div className="delivery-location"><MapPin size={14}/>{d.location}</div>{d.status==='Available'?<button className="primary-btn full-btn" onClick={()=>onUpdate(d.id,'In progress')}>Accept delivery <ArrowRight size={15}/></button>:d.status==='In progress'?<button className="secondary-btn full-btn" onClick={()=>onUpdate(d.id,'Completed')}><CheckCircle2 size={15}/> Mark delivered</button>:<div className="completed-note"><CheckCircle2 size={16}/> Completed by {d.volunteer}</div>}</div>)}{deliveries.length===0&&<div className="panel empty-panel"><EmptyState title="No delivery tasks" text="Approved requests can be turned into delivery tasks by a charity."/></div>}</div>
}
function Impact({donations,requests,deliveries,totalMeals}) {
  const complete = deliveries.filter(d=>d.status==='Completed').length
  const claimed = donations.filter(d=>d.status!=='Available').length
  const categories = ['Cooked meals','Bakery','Produce','Packaged food','Dairy']
  const max = Math.max(1,...categories.map(c=>donations.filter(d=>d.category===c).length))
  return <><div className="stats-grid"><StatCard icon={Sprout} label="Food units listed" value={totalMeals} detail="Quantity across all donations"/><StatCard icon={HeartHandshake} label="Requests tracked" value={requests.length} detail="Community food requests" tone="purple"/><StatCard icon={CheckCircle2} label="Completed deliveries" value={complete} detail="Delivery tasks completed" tone="blue"/><StatCard icon={TrendingUp} label="Listings claimed" value={claimed} detail="No longer available" tone="orange"/></div><div className="overview-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h3>Donation categories</h3><p>Breakdown of food shared in your community</p></div></div><div className="bar-chart">{categories.map((c,i)=>{const count=donations.filter(d=>d.category===c).length;return <div className="bar-row" key={c}><span>{c}</span><div className="bar-track"><div className={`bar-fill fill-${i}`} style={{width:`${count/max*100}%`}}/></div><strong>{count}</strong></div>})}</div><div className="chart-footnote">Based on local demo data. Add real donations to update this view.</div></section><section className="panel tree-panel"><div className="tree-art"><div className="tree-circle"><Sprout size={42}/></div><span className="tree-leaf leaf-one"/><span className="tree-leaf leaf-two"/></div><div className="eyebrow centered">TRACK MY TREE</div><h3>Your kindness is growing</h3><p>Earn impact points by sharing food, requesting support responsibly, and completing deliveries.</p><div className="points-line"><span><Leaf size={16}/> Community points</span><strong>{donations.filter(d=>d.status!=='Available').length*20+complete*30+requests.length*10}</strong></div><div className="tree-level"><span>Seedling</span><span>Growing tree</span></div><div className="progress-track"><div style={{width:`${Math.min(100,claimed*12+complete*15)}%`}}/></div></section></div></>
}
function EmptyState({title,text}) { return <div className="empty-state"><div><Package size={23}/></div><strong>{title}</strong><p>{text}</p></div> }

export default App
