import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Check, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    signInWithGoogle()
  }

  return (
    <div 
      className="h-screen w-screen max-h-screen bg-[#F4F5F9] flex items-center justify-center p-4 font-sans antialiased overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      
      {/* Main Container - Compact Static Height */}
      <div className="w-full max-w-[1000px] h-[640px] max-h-[92vh] bg-white rounded-none shadow-[0_20px_50px_-10px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* ================= LEFT SECTION (PROMOTIONAL PANEL - BRANDING & FEATURES) ================= */}
        <div 
          className="lg:col-span-6 relative p-8 flex flex-col justify-between h-full overflow-hidden"
          style={{
            backgroundImage: "url('/mascot.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'left bottom',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#F3EBF9'
          }}
        >
          {/* Top Section: Branding + Text overlay above astronaut */}
          <div className="relative z-10 space-y-6">
            
            {/* Top Left Branding Logo */}
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-2 hover:opacity-80 transition-opacity bg-transparent border-none cursor-pointer p-0"
            >
              <div className="w-8 h-8 rounded-xl bg-[#7C3AED] flex items-center justify-center text-white font-bold text-base shadow-sm shadow-purple-500/20">
                B
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">
                BizScraper <span className="text-[#7C3AED]">Pro</span>
              </span>
            </button>

            {/* Heading & Subtitle */}
            <div className="space-y-2 max-w-sm">
              <h1 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 leading-tight tracking-tight">
                Find businesses <br />
                <span className="text-[#7C3AED]">in few clicks.</span>
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Powerful scraping, AI search, and clean data export — all in one platform.
              </p>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-2 pt-1">
              {[
                "Google Maps Scraper",
                "AI-Powered Discovery",
                "Export to CSV / Excel",
                "One-click Results"
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-slate-700 font-medium text-xs sm:text-sm">
                  <div className="w-4.5 h-4.5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom Testimonial Quote Card */}
          <div className="relative z-10 mt-auto pt-4">
            <div className="bg-white/85 backdrop-blur-md border border-purple-100/80 rounded-2xl p-3.5 shadow-sm max-w-[250px]">
              <div className="text-[#7C3AED] font-serif text-xl leading-none mb-1">“</div>
              <p className="text-slate-600 text-[11px] leading-relaxed font-medium">
                The easiest way to discover and collect business data.
              </p>
            </div>
          </div>

        </div>

        {/* ================= RIGHT SECTION (AUTHENTICATION UI) ================= */}
        <div className="lg:col-span-6 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-center h-full overflow-y-auto">
          <div className="w-full max-w-[340px] mx-auto space-y-4">
            
            {/* Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Welcome back <span className="text-xl">👋</span>
              </h2>
              <p className="text-slate-500 text-xs mt-1 font-normal">
                Sign in to continue to BizScraper Pro.
              </p>
            </div>

            {/* Google OAuth Primary Action */}
            <button
              onClick={signInWithGoogle}
              type="button"
              className="w-full h-11 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2.5 cursor-pointer text-xs active:scale-[0.99]"
            >
              <img src="https://www.google.com/favicon.ico" width="18" height="18" alt="Google" className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="w-full border-t border-slate-200" />
              <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                OR
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-slate-900 text-xs outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-slate-50/50 focus:bg-white"
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-3 pr-9 rounded-xl border border-slate-200 text-slate-900 text-xs outline-none transition-all focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10 bg-slate-50/50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 select-none font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-[#7C3AED] focus:ring-[#7C3AED] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="text-[#7C3AED] hover:text-[#6D28D9] font-semibold transition-colors bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                className="w-full h-11 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-purple-500/20 active:scale-[0.99] cursor-pointer border-none mt-1"
              >
                Sign in
              </button>

            </form>

            {/* Create Account Link */}
            <div className="text-center text-xs text-slate-500 pt-1">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={signInWithGoogle}
                className="text-[#7C3AED] hover:text-[#6D28D9] font-bold transition-colors bg-transparent border-none cursor-pointer ml-0.5 hover:underline"
              >
                Create one
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  )
}
