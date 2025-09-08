import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { sendOTP } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await sendOTP(email);
      if (error) {
        setError(error.message);
      } else {
        // Store email for OTP verification page
        localStorage.setItem('reset_email', email);
        setSuccess(true);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  if (success) {
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
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Check Your Email
              </h2>
            </div>

            {/* Success Message */}
            <div className="space-y-6">
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  We've sent a 6-digit verification code to <strong>{email}</strong>. 
                  Please check your email and enter the code to continue.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm text-muted-foreground text-center">
                <p>Didn't receive the code? Check your spam folder or try again.</p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={() => navigate('/verify-otp')} 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium"
                >
                  Enter Verification Code
                </Button>
                <Button 
                  onClick={() => setSuccess(false)} 
                  variant="outline" 
                  className="w-full"
                >
                  Try Different Email
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
              <Mail className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Forgot Password?
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              Enter your email address and we'll send you a verification code to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="border-input focus:border-primary focus:ring-primary"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium" 
              disabled={loading || !email.trim()}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Sending Code..." : "Send Verification Code"}
            </Button>

            <Button 
              type="button" 
              variant="outline" 
              onClick={handleBackToLogin}
              className="w-full"
              disabled={loading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
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

export default ForgotPassword;
