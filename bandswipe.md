# PROJECT NAME (WORKING TITLE)

BandSwipe  
Alternative names:
- BandMatch
- Jamr
- Riffly
- FindMyBand
- LoudLink

---

# PROJECT OVERVIEW

BandSwipe is a mobile application that helps musicians find bands and bands find musicians using a TikTok/Instagram-style vertical swipe interface.

The platform combines:
- TikTok-style discovery
- Tinder-style matching
- LinkedIn-style musician profiles
- AI-assisted compatibility scoring

The main problem this app solves is:

> Musicians struggle to find compatible band members and bands struggle to find suitable musicians.

Current solutions are mostly:
- Facebook groups
- Discord servers
- Instagram DMs
- old forum-style websites

These are slow, unorganized, and have poor user experience.

BandSwipe aims to make discovering musicians and bands:
- fast
- visual
- addictive
- mobile-first
- algorithmically personalized

---

# CORE CONCEPT

Users create either:
1. Musician profiles
2. Band profiles

The app then recommends compatible matches through a vertical swipe feed.

Users can:
- swipe up/down through bands or musicians
- see compatibility percentage
- see matching and missing attributes
- instantly contact or match

---

# TARGET AUDIENCE

Primary audience:
- Rock musicians
- Metal musicians
- Indie musicians
- University music communities
- Amateur/semi-professional bands

Initial launch market:
- Türkiye
- Especially Istanbul, Ankara, İzmir

---

# USER TYPES

## 1. MUSICIAN PROFILE

A musician can enter:

### Basic Info
- Name
- Age
- City
- Instrument
- Years of experience

### Music Preferences
- Genres played
- Favorite artists/bands
- Playing style
- Skill level

### Technical Information
- Equipment
- Recording experience
- Stage experience

### Availability
- Weekly availability
- Practice frequency

### Goals
- Casual jamming
- Serious band
- Live performances
- Studio recording

### Media
- Audio demos
- Video demos
- Instagram/Spotify/Youtube links

---

## 2. BAND PROFILE

A band can enter:

### Basic Info
- Band name
- City
- Active years

### Band Information
- Genres
- Influences
- Current members
- Missing musician roles

### Requirements
- Required instrument
- Minimum experience
- Preferred playing style
- Commitment expectations

### Goals
- Hobby
- Live gigs
- Recording
- Touring

### Media
- Band photos
- Live videos
- Demo recordings

---

# MAIN FEATURE: SWIPE FEED

The core experience is a TikTok-style vertical swipe feed.

Example:
- User opens app
- Instantly sees recommended bands
- Swipes vertically to browse

Each card contains:
- Compatibility %
- Genres
- Location
- Experience level
- Audio/video preview
- Why the match happened

Example:
- 92% compatible
- Same genre interests
- Similar experience level
- Same city
- Different practice expectations

---

# MATCHING SYSTEM

The app calculates compatibility between musicians and bands.

## Initial MVP Matching Logic

### Weighted Score System

Example weights:
- Same city = +25
- Same genres = +30
- Similar experience = +15
- Similar goals = +15
- Availability match = +10
- Technical preference match = +5

Total score generates compatibility percentage.

---

# AI INTEGRATION (FUTURE)

Future AI features may include:
- Semantic profile understanding
- Audio analysis
- Skill estimation
- Genre compatibility prediction
- Natural language profile analysis

Example:
A band writes:
> "Looking for RHCP-style funky bassist"

AI understands compatibility with:
> "Groove/slap focused funk-rock bassist"

even without exact keyword matching.

---

# IMPORTANT UX PHILOSOPHY

The app must have:
- extremely low friction
- fast onboarding
- instant discovery

Users should:
- create a basic profile in under 1 minute
- immediately start swiping

Avoid:
- long forms
- unnecessary setup
- complex menus

The experience should feel:
- modern
- fast
- social
- addictive

---

# MVP FEATURES

## REQUIRED FEATURES

### Authentication
- Email login
- Google login
- Apple login

### Profiles
- Musician profiles
- Band profiles

### Swipe Feed
- Vertical scrolling cards
- Recommendation system

### Matching
- Compatibility percentage
- Like/pass system

### Messaging
- Basic chat
OR
- Instagram redirect

### Media Uploads
- Audio demo
- Video demo
- Photos

---

# OPTIONAL FUTURE FEATURES

- AI-powered matching
- Voice/video introductions
- Practice scheduling
- Verified musicians
- Reputation system
- Studio marketplace
- Event discovery
- Jam session mode
- Local music scene discovery

---

# DESIGN PHILOSOPHY

UI should feel inspired by:
- TikTok
- Instagram Reels
- Spotify
- Tinder

Key principles:
- dark mode first
- minimal design
- large cards
- fast animations
- music-focused aesthetic

---

# RECOMMENDED TECH STACK

## Frontend
Flutter

OR

React Native

---

## Backend
Supabase

OR

Firebase

---

## Database
PostgreSQL

---

## Storage
Supabase Storage
OR
Firebase Storage

---

## AI FEATURES
OpenAI API
Claude API

---

# DATABASE IDEAS

## USERS TABLE
- id
- username
- city
- instrument
- experience_years
- genres
- goals
- availability

---

## BANDS TABLE
- id
- band_name
- city
- genres
- required_roles
- goals

---

## MATCHES TABLE
- musician_id
- band_id
- compatibility_score
- created_at

---

# BUSINESS MODEL IDEAS

Potential monetization:
- Premium filters
- Boosted profiles
- Verified musician accounts
- Sponsored bands
- Studio advertisements
- Premium AI recommendations

---

# BIGGEST CHALLENGE

The biggest challenge is not coding.

The biggest challenge is:
- building initial user base
- creating network effect
- keeping users active

The app must avoid feeling empty.

---

# INITIAL GROWTH STRATEGY

Focus only on:
- Istanbul music scene
- university musicians
- rock/metal communities

Start niche.
Expand later.

---

# SUCCESS METRICS

Important metrics:
- Daily active users
- Matches per user
- Messages started
- Profile completion rate
- Returning users
- Time spent swiping

---

# FINAL PRODUCT VISION

BandSwipe should become:

> The fastest and easiest way for musicians to find bands and collaborators.

The experience should feel like:
- TikTok discovery
- Tinder matching
- LinkedIn networking
- Spotify music culture

combined into one mobile platform.