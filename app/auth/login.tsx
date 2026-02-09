import PhoneInput from "@/components/PhoneInput";
import { app, auth, db } from "@/configs/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  PhoneAuthProvider,
  fetchSignInMethodsForEmail,
  linkWithCredential,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPhoneNumber,
  updatePassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

// TypeScript declarations for web-specific window properties
declare global {
  interface Window {
    recaptchaVerifier?: any;
    phoneConfirmationResult?: any;
  }
}

type AuthStep =
  | "phone"
  | "otp"
  | "login_password"
  | "signup_password"
  | "profile_setup"
  | "forgot_password";

export default function Login() {
  const [step, setStep] = useState<AuthStep>("phone");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("avatar_1");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [loading, setLoading] = useState(false);
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [isValidPhone, setIsValidPhone] = useState(false);

  // Native Recaptcha Ref
  // Native Recaptcha Ref
  const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal>(null);
  // Web Recaptcha Container Ref
  const webRecaptchaRef = useRef<HTMLDivElement>(null);
  // Track if web reCAPTCHA has been initialized
  const recaptchaInitialized = useRef(false);

  const router = useRouter();
  const { continueAsGuest } = useAuth();

  // Initialize Web Recaptcha
  useEffect(() => {
    let isMounted = true;
    let recaptchaContainer: HTMLElement | null = null;

    if (Platform.OS === "web") {
      const initRecaptcha = async () => {
        // Prevent multiple initializations
        if (recaptchaInitialized.current || window.recaptchaVerifier) {
          return;
        }

        try {
          // Manual DOM injection to ensure it persists outside React render cycle
          if (!document.getElementById("recaptcha-container")) {
            recaptchaContainer = document.createElement("div");
            recaptchaContainer.id = "recaptcha-container";
            //recaptchaContainer.style.visibility = "hidden"; // Don't hide it, in case it needs to show a challenge
            document.body.appendChild(recaptchaContainer);
          } else {
            recaptchaContainer = document.getElementById("recaptcha-container");
          }

          if (!isMounted && !window.recaptchaVerifier) return; // Allow if global exists

          const { RecaptchaVerifier } = require("firebase/auth");

          // Double check global instance
          if (window.recaptchaVerifier) {
            // If already initialized, just ensure it's rendered
            // await window.recaptchaVerifier.render(); // Usually not needed if already rendered
            return;
          }

          // Create new RecaptchaVerifier
          const verifier = new RecaptchaVerifier(
            auth,
            "recaptcha-container", // ID is now safe because we manually appended it
            {
              size: "invisible",
              callback: (response: any) => {
                console.log("reCAPTCHA solved successfully:", response);
              },
              "expired-callback": () => {
                console.log("reCAPTCHA expired, resetting...");
                // window.recaptchaVerifier?.reset?.(); // Reset might be needed
              },
            },
          );

          window.recaptchaVerifier = verifier;

          // Explicitly render the reCAPTCHA widget
          await window.recaptchaVerifier.render();

          if (isMounted) {
            recaptchaInitialized.current = true;
            console.log("reCAPTCHA widget rendered successfully");
          }
        } catch (e: any) {
          console.error("Recaptcha init error:", e);
          if (e.message?.includes("reCAPTCHA has already been rendered")) {
            recaptchaInitialized.current = true;
          }
        }
      };

      initRecaptcha();

      // Cleanup function
      return () => {
        isMounted = false;
        // logic below commented out to persist the verifier session
        /*
        if (window.recaptchaVerifier) {
          try {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = undefined;
            recaptchaInitialized.current = false;
          } catch (e) {
            console.log("Could not clear recaptcha on unmount", e);
          }
        }
        */
        // We do NOT remove the container here.
        // reCAPTCHA might still be using it or referencing it.
        // Leaving a hidden empty div in document.body is safer than crashing.
        /*
        if (recaptchaContainer && document.body.contains(recaptchaContainer)) {
          document.body.removeChild(recaptchaContainer);
        }
        */
      };
    }
  }, []);

  const getFullPhone = () => {
    // formattedPhoneNumber already includes country code in E.164 format
    return formattedPhoneNumber;
  };

  const getFakeEmail = () => {
    return `${getFullPhone()}@pleura.app`;
  };

  const createUserDocument = async (uid: string, phoneNumber: string) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create new user document
        await setDoc(userRef, {
          phoneNumber: phoneNumber,
          name: "",
          surname: "",
          avatar: "avatar_1", // Default avatar
          myList: [],
          createdAt: new Date().toISOString(),
          isGuest: false,
        });
        console.log("User document created for:", uid);
      } else {
        console.log("User document already exists for:", uid);
      }
    } catch (error) {
      console.error("Error creating user document:", error);
      // We don't block the login flow for this, but log it
    }
  };

  const sendOTP = async () => {
    if (!formattedPhoneNumber) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your phone number",
      });
      return;
    }

    // Validate E.164 format
    const phoneToSend = getFullPhone();
    if (!phoneToSend.startsWith("+") || phoneToSend.length < 10) {
      Toast.show({
        type: "error",
        text1: "Invalid Phone Format",
        text2: "Please enter a valid phone number with country code",
      });
      console.error("Invalid phone format:", phoneToSend);
      return;
    }

    setLoading(true);
    try {
      console.log("=== PHONE AUTH DEBUG ===");
      console.log("Phone number (E.164):", phoneToSend);
      console.log("Platform:", Platform.OS);

      if (Platform.OS === "web") {
        // WEB: Use signInWithPhoneNumber (correct method for web)
        const verifier = window.recaptchaVerifier;
        if (!verifier) {
          console.error("Web RecaptchaVerifier not initialized!");
          Toast.show({
            type: "error",
            text1: "reCAPTCHA Error",
            text2: "Please refresh the page and try again",
          });
          setLoading(false);
          return;
        }
        console.log("Using web signInWithPhoneNumber method");

        // This is the CRITICAL FIX: Use signInWithPhoneNumber for web
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          phoneToSend,
          verifier,
        );

        console.log("=== SUCCESS ===");
        console.log("ConfirmationResult received");
        console.log("SMS should be sent to:", phoneToSend);

        // Store confirmationResult for later verification
        window.phoneConfirmationResult = confirmationResult;
        setStep("otp");
        Toast.show({
          type: "success",
          text1: "Code Sent",
          text2: `Check your messages at ${phoneToSend}`,
        });
      } else {
        // NATIVE: Use PhoneAuthProvider (correct for iOS/Android)
        const verifier = recaptchaVerifier.current!;
        if (!verifier) {
          console.error("Native RecaptchaVerifier ref is null");
          setLoading(false);
          return;
        }
        console.log("Using native PhoneAuthProvider");

        const phoneProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneProvider.verifyPhoneNumber(
          phoneToSend,
          verifier,
        );

        console.log("=== SUCCESS ===");
        console.log(
          "Verification ID received:",
          verificationId.substring(0, 20) + "...",
        );

        setVerificationId(verificationId);
        setStep("otp");
        Toast.show({
          type: "success",
          text1: "Code Sent",
          text2: `Check your messages at ${phoneToSend}`,
        });
      }
    } catch (error: any) {
      console.error("=== PHONE AUTH ERROR ===");
      console.error("Error Code:", error.code);
      console.error("Error Message:", error.message);
      console.error("Full Error:", JSON.stringify(error, null, 2));

      let userMessage = error.message;
      if (error.code === "auth/too-many-requests") {
        userMessage = "Too many attempts. Please try again later.";
      } else if (error.code === "auth/invalid-phone-number") {
        userMessage = "Invalid phone number format.";
      } else if (error.code === "auth/quota-exceeded") {
        userMessage = "SMS quota exceeded. Contact support.";
      }

      Toast.show({
        type: "error",
        text1: "Error Sending Code",
        text2: userMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckUser = async () => {
    if (!formattedPhoneNumber) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your phone number",
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Check Firestore for existing user with this phone number
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("phoneNumber", "==", getFullPhone()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("User found in Firestore, checking for password...");
        // User exists, check if they have a password set (by checking methods for the fake email)
        const email = getFakeEmail();
        const methods = await fetchSignInMethodsForEmail(auth, email);

        if (methods && methods.length > 0) {
          // User exists AND has password -> Login with password (NO OTP)
          console.log("User has password, asking for input...");
          setStep("login_password");
        } else {
          // User exists but NO password (legacy or phone-only) -> Send OTP to login
          console.log("User has no password set, fallback to OTP...");
          setIsForgotPass(false);
          await sendOTP();
        }
      } else {
        // User does NOT exist in Firestore -> Send OTP to Register
        console.log("User not found in Firestore, starting registration...");
        setIsForgotPass(false);
        await sendOTP();
      }
    } catch (error: any) {
      console.error("Check user error:", error);
      // Fallback: exist checking failed (e.g. permission/network), try sending OTP
      await sendOTP();
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      Toast.show({ type: "error", text1: "Error", text2: "Enter OTP" });
      return;
    }
    setLoading(true);
    try {
      let uid = "";
      if (Platform.OS === "web") {
        // WEB: Use confirmationResult.confirm()
        if (!window.phoneConfirmationResult) {
          Toast.show({
            type: "error",
            text1: "Error",
            text2: "Please request a new code",
          });
          setLoading(false);
          return;
        }

        const result = await window.phoneConfirmationResult.confirm(otp);
        console.log("OTP verified successfully:", result.user.uid);
        uid = result.user.uid;
      } else {
        // NATIVE: Use PhoneAuthProvider.credential
        const credential = PhoneAuthProvider.credential(verificationId, otp);
        let userCredential;
        if (isForgotPass) {
          // If resetting password, we need to sign in to update it
          userCredential = await signInWithCredential(auth, credential);
        } else {
          userCredential = await signInWithCredential(auth, credential);
        }
        uid = userCredential.user.uid;
      }

      // Check if user document exists and has a name (profile completed)
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (
        userSnap.exists() &&
        userSnap.data().name &&
        !isForgotPass // If forgot pass, we ALWAYS go to signup_password to reset code
      ) {
        // User exists and has profile -> Login Complete
        console.log("User profile exists, skipping registration.");
        // AuthContext will handle the rest
      } else {
        // New User OR Forgot Password -> Go to Password Setup
        console.log("New user/Forgot password -> Going to Password Setup");
        // We do NOT create the user doc here yet. We do it AFTER password setup.
        setStep("signup_password");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Verification Failed",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Enter Password",
      });
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, getFakeEmail(), password);
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (password.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must be at least 6 characters",
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user signed in");

      if (isForgotPass) {
        // Reset password flow
        await updatePassword(currentUser, password);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: "Password updated",
        });
        // After reset, just go to home? Or stay here?
        // Usually, we can just let AuthContext redirect or auto-login.
      } else {
        // New user or "Upgrade to Password" flow
        const email = getFakeEmail();
        const credential = EmailAuthProvider.credential(email, password);

        // Link the "Email/Password" credential to the existing "Phone" user
        // This is what enables "Login with Password" later
        try {
          await linkWithCredential(currentUser, credential);
          console.log("Credential linked successfully");
        } catch (linkError: any) {
          if (linkError.code === "auth/credential-already-in-use") {
            // If already linked (maybe they verified OTP again?), just update password
            console.log("Credential already exists, updating password instead");
            await updatePassword(currentUser, password);
          } else if (linkError.code === "auth/email-already-in-use") {
            // Should not happen with unique phone-based emails, but safe to handle
            console.error("Email collision", linkError);
          } else {
            throw linkError;
          }
        }

        // Create/Update user document
        // We do this NOW, after password is set
        // ACTUALLY: User wants to set Profile AFTER password.
        // so we don't finish here. We go to 'profile_setup'.
        // But we need to make sure the user doc exists or at least the UID is ready.
        // UID is ready in 'currentUser.uid'.
        setStep("profile_setup");
      }
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsForgotPass(true);
    await sendOTP();
  };

  const handleProfileSetup = async () => {
    if (!name.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter your name",
      });
      return;
    }

    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("No user signed in");

      // Save Profile Data
      await setDoc(doc(db, "users", currentUser.uid), {
        phoneNumber: getFullPhone(),
        name: name.trim(),
        avatar: selectedAvatar,
        myList: [],
        createdAt: new Date().toISOString(),
        isGuest: false,
      });

      console.log("Profile setup complete for:", currentUser.uid);
      // AuthContext should pick up the change or we can force reload?
      // Usually AuthContext listens to 'user', but 'userData' is fetched from Firestore.
      // We might need to trigger a refresh or just rely on the fact that we are logged in.
      // If we are already logged in, AuthContext has loaded 'null' userData initially maybe?
      // We can reload the app or strict navigation.
      // But let's just let the AuthContext/RootLayout handle the redirect if it detects userData.

      // Temporary: Force navigation if AuthContext is slow
      // router.replace("/(tabs)");
      // Actually, since we just wrote the doc, the listener in AuthContext (if any) should fire.
      // If AuthContext uses onSnapshot, it will auto-update.
      // If it uses getDoc once, we might need to manually update it.
      // Let's assume standard behavior for now.

      // To be safe, we can trigger a hard reload of userData if we had access to a function,
      // but we don't.
    } catch (error: any) {
      console.error("Profile setup error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to save profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetStep = () => {
    setStep("phone");
    setPassword("");
    setConfirmPassword("");
    setOtp("");
    setName("");
    setIsForgotPass(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Native Recaptcha Modal */}
      {Platform.OS !== "web" && (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={app.options}
        />
      )}

      {/* Web Recaptcha Element - must be visible in DOM for reCAPTCHA to work */}
      {/* Web Recaptcha Element - must be visible in DOM for reCAPTCHA to work */}

      <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {step !== "phone" && (
            <TouchableOpacity onPress={resetStep} style={styles.topBackButton}>
              <Image
                source={require("@/assets/icons/arrow.png")}
                style={styles.backIcon}
                resizeMode="contain"
                tintColor="#ab8bff"
              />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/favicon/ms-icon-310x310.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>PLEURA</Text>
          </View>
        </View>

        {/* Steps */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.formContainer}
        >
          {step === "phone" && (
            <View>
              <Text style={styles.label}>Enter your phone number</Text>
              <View style={styles.phoneInputWrapper}>
                <PhoneInput
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onChangeFormattedText={setFormattedPhoneNumber}
                  defaultCountry="US"
                  autoFocus
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  !formattedPhoneNumber && styles.buttonDisabled,
                ]}
                onPress={handleCheckUser}
                disabled={loading || !formattedPhoneNumber}
              >
                {loading ? (
                  <ActivityIndicator color="#030014" />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={styles.guestButton}
                onPress={continueAsGuest}
                disabled={loading}
              >
                <Text style={styles.guestButtonText}>Continue as Guest</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "otp" && (
            <View>
              <Text style={styles.label}>Enter Verification Code</Text>
              <Text style={styles.subLabel}>Sent to {getFullPhone()}</Text>
              <TextInput
                style={styles.input}
                value={otp}
                onChangeText={setOtp}
                placeholder="123456"
                placeholderTextColor="#666"
                keyboardType="number-pad"
                autoFocus
              />
              <TouchableOpacity
                style={styles.button}
                onPress={verifyOTP}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#030014" />
                ) : (
                  <Text style={styles.buttonText}>Verify Code</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === "login_password" && (
            <View>
              <Text style={styles.label}>Enter Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#666"
                secureTextEntry
                autoFocus
              />
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassButton}
              >
                <Text style={styles.forgotPassText}>Forgot Password?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#030014" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {step === "signup_password" && (
            <View>
              <Text style={styles.label}>
                {isForgotPass ? "Reset Password" : "Set Password"}
              </Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="New Password"
                placeholderTextColor="#666"
                secureTextEntry
              />
              <TextInput
                style={[styles.input, { marginTop: 12 }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm Password"
                placeholderTextColor="#666"
                secureTextEntry
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleSetPassword}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#030014" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isForgotPass ? "Update Password" : "Create Account"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030014",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 48,
    marginTop: 20,
    position: "relative",
    flexDirection: "row",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 2,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  subLabel: {
    color: "#888",
    fontSize: 14,
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#1A1A2E",
    color: "#fff",
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
  },
  phoneInputWrapper: {
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  button: {
    backgroundColor: "#ab8bff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#030014",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 32,
    gap: 16,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#1A1A2E",
  },
  orText: {
    color: "#666",
    fontSize: 14,
  },
  guestButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#1A1A2E",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  guestButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  topBackButton: {
    position: "absolute",
    left: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
    height: "100%",
  },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    transform: [{ rotate: "180deg" }],
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 4,
  },
  forgotPassButton: {
    alignSelf: "flex-end",
    marginTop: 12,
  },
  forgotPassText: {
    color: "#ab8bff",
    fontSize: 14,
  },
});
