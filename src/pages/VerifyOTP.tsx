import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { OTPInput } from "@/components/ui/otp-input";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [canResend, setCanResend] = useState(true);

  const { verifyOTP, sendOTP, clearOTPData } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem('reset_email');
    if (!storedEmail) {
      navigate('/forgot-password');
      return;
    }
    setEmail(storedEmail);
  }, [navigate]);


  const handleOTPComplete = async (otpValue: string) => {
    if (otpValue.length !== 6) return;
    
    setLoading(true);
    setError(null);

    try {
      const { error } = await verifyOTP(email, otpValue);
      if (error) {
        setError(error.message);
        setOtp(""); // Clear OTP on error
      } else {
        // OTP verified successfully, navigate to reset password
        navigate('/reset-password');
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setOtp("");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError(null);
    setOtp("");

    try {
      const { error } = await sendOTP(email);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForgotPassword = () => {
    clearOTPData();
    localStorage.removeItem('reset_email');
    navigate('/forgot-password');
  };

  const handleBackToLogin = () => {
    clearOTPData();
    localStorage.removeItem('reset_email');
    navigate('/auth');
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Back button - positioned absolutely */}
      <button
        onClick={handleBackToForgotPassword}
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo/Brand */}
          <div className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              Enter Verification Code
            </h2>
            <p className="text-muted-foreground text-sm mt-2">
              We've sent a 6-digit code to <strong>{email}</strong>
            </p>
          </div>

          {/* OTP Input */}
          <div className="space-y-6">
            <div className="space-y-4">
              <OTPInput
                value={otp}
                onChange={setOtp}
                onComplete={handleOTPComplete}
                disabled={loading}
                length={6}
              />
              
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 text-center">
              <button
                onClick={handleResendOTP}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 inline mr-1 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Resend Code</>
                )}
              </button>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleBackToForgotPassword}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  disabled={loading}
                >
                  Use Different Email
                </button>

                <button
                  onClick={handleBackToLogin}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
                  disabled={loading}
                >
                  Back to Login
                </button>
              </div>
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
};

export default VerifyOTP;
