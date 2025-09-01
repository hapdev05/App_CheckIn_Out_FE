import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));

  const switchTab = (tab: string) => {
    // Hiệu ứng fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      // Đổi tab
      setActiveTab(tab);
      // Reset form
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setShowPassword(false);
      setShowConfirmPassword(false);

      // Hiệu ứng fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  const renderLoginForm = () => (
    <>
      {/* Email Input */}
      <View className="mb-5">
        <Text className="text-base font-semibold text-black mb-2">
          Your Email
        </Text>
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-4 text-base text-black"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View className="mb-5">
        <Text className="text-base font-semibold text-black mb-2">
          Password
        </Text>
        <View className="relative">
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-4 pr-12 text-base text-black"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4 p-1"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
        {password === "" && (
          <Text className="text-red-400 text-sm mt-1">Wrong password</Text>
        )}
      </View>

      {/* Forgot Password */}
      <TouchableOpacity className="self-end mb-8">
        <Text className="text-blue-500 text-sm">Forgot password?</Text>
      </TouchableOpacity>

      {/* Continue Button */}
      <TouchableOpacity className="bg-blue-500 rounded-lg py-4 items-center mb-8">
        <Text className="text-white text-base font-semibold">Continue</Text>
      </TouchableOpacity>

      {/* Or Divider */}
      <View className="flex-row items-center mb-8">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="text-gray-400 text-sm mx-4">Or</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* Social Login Button */}
      <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-lg py-4 mb-8 gap-3">
        <Ionicons name="logo-google" size={20} color="#4285F4" />
        <Text className="text-base text-black">Login with Google</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <View className="flex-row justify-center mt-auto mb-8">
        <Text className="text-gray-400 text-sm">Don't have an account? </Text>
        <TouchableOpacity onPress={() => switchTab("signup")}>
          <Text className="text-blue-500 text-sm font-semibold">Sign up</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderSignupForm = () => (
    <>
      {/* Email Input */}
      <View className="mb-5">
        <Text className="text-base font-semibold text-black mb-2">
          Your Email
        </Text>
        <TextInput
          className="border border-gray-200 rounded-lg px-4 py-4 text-base text-black"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password Input */}
      <View className="mb-5">
        <Text className="text-base font-semibold text-black mb-2">
          Password
        </Text>
        <View className="relative">
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-4 pr-12 text-base text-black"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4 p-1"
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Confirm Password Input */}
      <View className="mb-8">
        <Text className="text-base font-semibold text-black mb-2">
          Confirm Password
        </Text>
        <View className="relative">
          <TextInput
            className="border border-gray-200 rounded-lg px-4 py-4 pr-12 text-base text-black"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            className="absolute right-4 top-4 p-1"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye" : "eye-off"}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity className="bg-blue-500 rounded-lg py-4 items-center mb-8">
        <Text className="text-white text-base font-semibold">Sign Up</Text>
      </TouchableOpacity>

      {/* Or Divider */}
      <View className="flex-row items-center mb-8">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="text-gray-400 text-sm mx-4">Or</Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      {/* Social Sign Up Button */}
      <TouchableOpacity className="flex-row items-center justify-center border border-gray-200 rounded-lg py-4 mb-8 gap-3">
        <Ionicons name="logo-google" size={20} color="#4285F4" />
        <Text className="text-base text-black">Sign up with Google</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <View className="flex-row justify-center mt-auto mb-8">
        <Text className="text-gray-400 text-sm">Already have an account? </Text>
        <TouchableOpacity onPress={() => switchTab("login")}>
          <Text className="text-blue-500 text-sm font-semibold">Log in</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Main Content */}
      <View className="flex-1 px-6 pt-20">
        {/* Tab Navigation */}
        <View className="flex-row mb-10">
          <TouchableOpacity
            className={`flex-1 py-3 items-center ${
              activeTab === "login" ? "border-b-2 border-blue-500" : ""
            }`}
            onPress={() => switchTab("login")}
          >
            <Text
              className={`text-base ${
                activeTab === "login"
                  ? "text-blue-500 font-semibold"
                  : "text-gray-400"
              }`}
            >
              Log in
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 items-center ${
              activeTab === "signup" ? "border-b-2 border-blue-500" : ""
            }`}
            onPress={() => switchTab("signup")}
          >
            <Text
              className={`text-base ${
                activeTab === "signup"
                  ? "text-blue-500 font-semibold"
                  : "text-gray-400"
              }`}
            >
              Sign up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Animated Form Container */}
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          {activeTab === "login" ? renderLoginForm() : renderSignupForm()}
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default AuthScreen;
