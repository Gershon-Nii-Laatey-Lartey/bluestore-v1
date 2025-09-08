import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const { updatePassword, isOTPVerified, clearOTPData } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if user has verified OTP
  useEffect(() => {
    const checkOTPVerification = () => {
      const email = localStorage.getItem('reset_email');
      if (!email) {
        setError("No email found. Please start the password reset process again.");
        setCheckingSession(false);
        return;
      }

      if (isOTPVerified(email)) {
        setIsValidSession(true);
      } else {
        setError("OTP verification required. Please verify your code first.");
      }
      
      setCheckingSession(false);
    };

    checkOTPVerification();
  }, [isOTPVerified]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        // Clear OTP data and redirect to home after 3 seconds
        clearOTPData();
        localStorage.removeItem('reset_email');
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    clearOTPData();
    localStorage.removeItem('reset_email');
    navigate('/auth');
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen flex relative">
        {/* Left side - Loading */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground mt-4">Verifying OTP...</p>
            </div>
          </div>
        </div>

        {/* Right side - Blue gradient background */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 items-center justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
          <div className="relative z-10">
            {/* Abstract geometric shapes */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-6 bg-yellow-400 rounded-full transform rotate-45 mb-4"></div>
              <div className="w-24 h-6 bg-green-400 rounded-full transform -rotate-45 ml-4"></div>
            </div>
          </div>
          
          {/* Additional decorative circles */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex relative">
        {/* Left side - Success */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            {/* Logo/Brand */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Password Updated!
              </h2>
            </div>

            {/* Success Message */}
            <div className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your password has been successfully updated. You can now log in with your new password.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => navigate('/')} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium"
              >
                Continue to BlueStore
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Blue gradient background */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 items-center justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
          <div className="relative z-10">
            {/* Abstract geometric shapes */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-6 bg-yellow-400 rounded-full transform rotate-45 mb-4"></div>
              <div className="w-24 h-6 bg-green-400 rounded-full transform -rotate-45 ml-4"></div>
            </div>
          </div>
          
          {/* Additional decorative circles */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex relative">
        {/* Back button - positioned absolutely */}
        <button
          onClick={handleBackToLogin}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Login</span>
        </button>

        {/* Left side - Error */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
          <div className="w-full max-w-md space-y-8">
            {/* Logo/Brand */}
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Verification Required
              </h2>
            </div>

            {/* Error Message */}
            <div className="space-y-6">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {error || "Please verify your email with the OTP code first."}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={() => navigate('/verify-otp')} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium"
              >
                Verify OTP
              </Button>
              
              <Button 
                onClick={handleBackToLogin} 
                variant="outline"
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Blue gradient background */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 items-center justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
          <div className="relative z-10">
            {/* Abstract geometric shapes */}
            <div className="flex items-center justify-center">
              <div className="w-24 h-6 bg-yellow-400 rounded-full transform rotate-45 mb-4"></div>
              <div className="w-24 h-6 bg-green-400 rounded-full transform -rotate-45 ml-4"></div>
            </div>
          </div>
          
          {/* Additional decorative circles */}
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full"></div>
          <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400/20 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex relative">
      {/* Back button - positioned absolutely */}
      <button
        onClick={handleBackToLogin}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back to Login</span>
      </button>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Reset Your Password
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your new password below.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  className="border-input focus:border-primary focus:ring-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  className="border-input focus:border-primary focus:ring-primary pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium" 
              disabled={loading || !password.trim() || !confirmPassword.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Updating Password..." : "Update Password"}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBackToLogin}
              className="w-full"
              disabled={loading}
            >
              Back to Login
            </Button>
          </form>
        </div>
      </div>

      {/* Right side - Blue gradient background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700 items-center justify-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20"></div>
        <div className="relative z-10">
          {/* Abstract geometric shapes */}
          <div className="flex items-center justify-center">
            <div className="w-24 h-6 bg-yellow-400 rounded-full transform rotate-45 mb-4"></div>
            <div className="w-24 h-6 bg-green-400 rounded-full transform -rotate-45 ml-4"></div>
          </div>
        </div>
        
        {/* Additional decorative circles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-yellow-400/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default ResetPassword;
