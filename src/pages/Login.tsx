import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, BookOpen, Check, X } from 'lucide-react'
import { firebaseAuthService } from '../services/firebaseAuth'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  // Validação de senha
  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasLetter: /[a-zA-Z]/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  }

  const isPasswordValid = Object.values(passwordRequirements).every(Boolean)
  const passwordsMatch = formData.password === formData.confirmPassword || !formData.confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        // Login
        if (!formData.email || !formData.password) {
          throw new Error('Preencha todos os campos')
        }
        
        const user = await firebaseAuthService.login(formData.email, formData.password, rememberMe)
        console.log('Login successful:', user)
      } else {
        // Registro
        if (!formData.email || !formData.password || !formData.name) {
          throw new Error('Preencha todos os campos')
        }
        
        if (!isPasswordValid) {
          throw new Error('A senha não atende aos requisitos de segurança')
        }
        
        if (!passwordsMatch) {
          throw new Error('As senhas não coincidem')
        }
        
        const user = await firebaseAuthService.register(formData.email, formData.password, formData.name)
        console.log('Register successful:', user)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const user = await firebaseAuthService.loginWithGoogle(rememberMe)
      console.log('Google login successful:', user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-neutral-50 to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-neutral-600 hover:text-neutral-800 transition-colors mb-6">
            <ArrowLeft size={16} />
            <span>Voltar</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="relative">
              <BookOpen className="w-8 h-8 text-primary-600 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-serif font-bold text-neutral-800 animate-fade-in">
              <span className="inline-block animate-slide-up">S</span>
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.1s' }}>a</span>
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.2s' }}>p</span>
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.3s' }}>i</span>
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.4s' }}>e</span>
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.5s' }}>n</span>
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.6s' }}>t</span>
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.7s' }}>i</span>
              <span className="inline-block animate-slide-up" style={{ animationDelay: '0.8s' }}>a</span>
            </h1>
          </div>
          <p className="text-neutral-600">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Name Field (only for register) */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                  Nome
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {/* Password Requirements (only for register) */}
              {!isLogin && formData.password && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-medium text-neutral-600">Requisitos de segurança:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center space-x-2 text-xs ${passwordRequirements.minLength ? 'text-green-600' : 'text-neutral-500'}`}>
                      {passwordRequirements.minLength ? <Check size={12} /> : <X size={12} />}
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${passwordRequirements.hasNumber ? 'text-green-600' : 'text-neutral-500'}`}>
                      {passwordRequirements.hasNumber ? <Check size={12} /> : <X size={12} />}
                      <span>Pelo menos 1 número</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${passwordRequirements.hasLetter ? 'text-green-600' : 'text-neutral-500'}`}>
                      {passwordRequirements.hasLetter ? <Check size={12} /> : <X size={12} />}
                      <span>Pelo menos 1 letra</span>
                    </div>
                    <div className={`flex items-center space-x-2 text-xs ${passwordRequirements.hasSpecial ? 'text-green-600' : 'text-neutral-500'}`}>
                      {passwordRequirements.hasSpecial ? <Check size={12} /> : <X size={12} />}
                      <span>Pelo menos 1 caractere especial</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field (only for register) */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      formData.confirmPassword 
                        ? passwordsMatch 
                          ? 'border-green-300' 
                          : 'border-red-300'
                        : 'border-neutral-300'
                    }`}
                    placeholder="Confirme sua senha"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600">As senhas não coincidem</p>
                )}
              </div>
            )}

            {/* Remember Me Checkbox (only for login) */}
            {isLogin && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-700">
                  Manter logado
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!isLogin && (!isPasswordValid || !passwordsMatch))}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Carregando...</span>
                </div>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-neutral-300"></div>
            <span className="px-4 text-sm text-neutral-500">ou</span>
            <div className="flex-1 border-t border-neutral-300"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full bg-white border border-neutral-300 text-neutral-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 hover:border-neutral-400 flex items-center justify-center space-x-3"
          >
            {googleLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-neutral-600"></div>
                <span>Carregando...</span>
              </div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continuar com Google</span>
              </>
            )}
          </button>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
            </p>
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setFormData({ email: '', password: '', confirmPassword: '', name: '' })
                setRememberMe(false)
              }}
              className="text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              {isLogin ? 'Criar conta' : 'Fazer login'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-neutral-500">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login 