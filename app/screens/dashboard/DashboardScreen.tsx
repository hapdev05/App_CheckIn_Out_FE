import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
  PanResponder,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import WorkReportModal from "../../../components/WorkReportModal";
import SimpleMapView, {
  SimpleMapViewRef,
} from "../../../components/SimpleMapView";

const { width, height } = Dimensions.get("window");

interface LocationCoords {
  latitude: number;
  longitude: number;
}

const DashboardScreen = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string>("");
  const [workReport, setWorkReport] = useState<string>("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLoadingGPS, setIsLoadingGPS] = useState(false);

  // Animation values
  const [slideAnim] = useState(new Animated.Value(0));
  const [checkButtonScale] = useState(new Animated.Value(1));

  // Map ref
  const mapRef = useRef<SimpleMapViewRef>(null);

  // Work location (example coordinates - bạn có thể thay đổi)
  const workLocation: LocationCoords = {
    latitude: 15.9752733,
    longitude: 108.253225,
  };

  // Pan responder for swipe to check out
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (gestureState.dx > 0 && gestureState.dx < 200) {
        slideAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (gestureState.dx > 150) {
        // Complete check out
        handleCheckOut();
        Animated.spring(slideAnim, {
          toValue: 200,
          useNativeDriver: false,
        }).start();
      } else {
        // Reset position
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Get user location
    getUserLocation();

    return () => clearInterval(timer);
  }, []);

  const getUserLocation = async () => {
    try {
      setIsLoadingGPS(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "❌ Lỗi",
          "Cần cấp quyền truy cập vị trí để sử dụng ứng dụng"
        );
        setIsLoadingGPS(false);
        return;
      }

      // Lấy vị trí với độ chính xác cao
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(newLocation);

      // Center bản đồ về vị trí mới
      setTimeout(() => {
        mapRef.current?.centerToUser();
      }, 500);

      setIsLoadingGPS(false);

      // Hiển thị thông báo thành công
      Alert.alert(
        "✅ Cập nhật vị trí thành công!",
        `📍 Vị trí: ${newLocation.latitude.toFixed(6)}, ${newLocation.longitude.toFixed(6)}\n🎯 Độ chính xác: ${location.coords.accuracy?.toFixed(0)}m`,
        [{ text: "OK" }]
      );

      console.log("Vị trí GPS mới:", newLocation);
    } catch (error) {
      setIsLoadingGPS(false);
      console.error("Error getting location:", error);
      Alert.alert(
        "❌ Lỗi GPS",
        "Không thể lấy vị trí hiện tại. Vui lòng:\n• Bật GPS/Location\n• Cho phép ứng dụng truy cập vị trí\n• Thử lại sau"
      );
    }
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // meters
    return distance;
  };

  const isWithinWorkArea = () => {
    if (!userLocation) return false;
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      workLocation.latitude,
      workLocation.longitude
    );
    return distance <= 100; // 100m radius
  };

  const getDistanceToWork = () => {
    if (!userLocation) return 0;
    return calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      workLocation.latitude,
      workLocation.longitude
    );
  };

  const handleCheckIn = () => {
    if (!isWithinWorkArea()) {
      Alert.alert(
        "Ngoài khu vực làm việc",
        "Bạn cần ở gần khu vực làm việc để check in"
      );
      return;
    }

    // Animation for check in button
    Animated.sequence([
      Animated.timing(checkButtonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(checkButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setIsCheckedIn(true);
    setCheckInTime(formatTimeWithoutSeconds(currentTime));
  };

  const handleCheckOut = () => {
    setIsCheckedIn(false);
    setCheckInTime("");
    setWorkReport("");
    slideAnim.setValue(0);
  };

  const formatTime = (date: Date) => {
    // Lấy thời gian địa phương chính xác
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatTimeWithoutSeconds = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const formatDate = (date: Date) => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const months = [
      "Tháng 1",
      "Tháng 2",
      "Tháng 3",
      "Tháng 4",
      "Tháng 5",
      "Tháng 6",
      "Tháng 7",
      "Tháng 8",
      "Tháng 9",
      "Tháng 10",
      "Tháng 11",
      "Tháng 12",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <StatusBar barStyle="light-content" backgroundColor="#111827" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 mt-12">
        <TouchableOpacity className="p-2">
          <Ionicons name="menu" size={24} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-semibold">Dashboard</Text>

        <View className="flex-row gap-2">
          <TouchableOpacity className="w-10 h-10 bg-gray-600 rounded-full items-center justify-center">
            <Ionicons name="notifications" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 bg-gray-600 rounded-full items-center justify-center">
            <Ionicons name="chatbubble-ellipses" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Section */}
      <View className="h-64 mx-4 mb-4 rounded-2xl overflow-hidden relative">
        {userLocation ? (
          <SimpleMapView
            ref={mapRef}
            userLocation={userLocation}
            workLocation={workLocation}
            showsUserLocation={true}
          />
        ) : (
          <View className="flex-1 bg-gray-800 items-center justify-center">
            <Ionicons name="location-outline" size={48} color="#6B7280" />
            <Text className="text-gray-400 mt-2">Đang tải bản đồ...</Text>
          </View>
        )}

        {/* Map Controls */}
        <View className="absolute bottom-4 right-4 flex-col gap-2">
          {/* My Location Button */}
          <TouchableOpacity
            className={`w-10 h-10 rounded-lg items-center justify-center shadow-lg ${
              isLoadingGPS ? "bg-orange-500" : "bg-blue-500"
            }`}
            onPress={getUserLocation}
            disabled={isLoadingGPS}
          >
            <Ionicons
              name={isLoadingGPS ? "refresh" : "locate"}
              size={20}
              color="white"
              style={{
                transform: isLoadingGPS ? [{ rotate: "45deg" }] : [],
              }}
            />
          </TouchableOpacity>

          {/* Layers/Settings Button */}
          <TouchableOpacity className="w-10 h-10 bg-gray-700 rounded-lg items-center justify-center shadow-lg">
            <Ionicons name="layers" size={20} color="white" />
          </TouchableOpacity>

          {/* Zoom In */}
          <TouchableOpacity
            className="w-10 h-10 bg-white rounded-lg items-center justify-center shadow-lg"
            onPress={() => mapRef.current?.zoomIn()}
          >
            <Ionicons name="add" size={20} color="#374151" />
          </TouchableOpacity>

          {/* Zoom Out */}
          <TouchableOpacity
            className="w-10 h-10 bg-white rounded-lg items-center justify-center shadow-lg"
            onPress={() => mapRef.current?.zoomOut()}
          >
            <Ionicons name="remove" size={20} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* GPS Info Panel */}
        {userLocation && (
          <View className="absolute top-4 left-4 bg-black/80 rounded-lg px-3 py-2 max-w-xs">
            <Text className="text-white text-xs font-mono">
              📍 {userLocation.latitude.toFixed(6)},{" "}
              {userLocation.longitude.toFixed(6)}
            </Text>
            <Text className="text-yellow-300 text-xs mt-1">
              🎯 Cách khu vực làm việc: {Math.round(getDistanceToWork())}m
            </Text>
            {isWithinWorkArea() && (
              <Text className="text-green-400 text-xs mt-1">
                ✅ Trong khu vực check-in
              </Text>
            )}
          </View>
        )}

        {/* Compass/Direction indicator */}
        <View className="absolute top-4 right-4 bg-black/80 rounded-full w-12 h-12 items-center justify-center">
          <Text className="text-white text-lg">🧭</Text>
        </View>
      </View>

      {/* Time Display */}
      <View className="mx-4 mb-6">
        <Text className="text-white text-4xl font-bold text-center mb-1">
          {formatTime(currentTime)}
        </Text>
        <Text className="text-gray-400 text-center">
          {formatDate(currentTime)}
        </Text>
        <Text className="text-gray-400 text-center text-sm mt-1">
          Giờ làm việc: 10:00 - 19:00
        </Text>
      </View>

      {/* Check In/Out Section */}
      <View className="mx-4 mb-6">
        {!isCheckedIn ? (
          /* Check In Button */
          <Animated.View style={{ transform: [{ scale: checkButtonScale }] }}>
            <TouchableOpacity
              onPress={handleCheckIn}
              className="bg-green-500 rounded-2xl py-4 flex-row items-center justify-center gap-3"
            >
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white text-lg font-semibold">Check in</Text>
              <Text className="text-white text-lg">
                {formatTime(currentTime)}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View className="gap-4">
            {/* Check In Status */}
            <View className="bg-green-500 rounded-2xl py-4 flex-row items-center justify-center gap-3">
              <Ionicons name="checkmark-circle" size={24} color="white" />
              <Text className="text-white text-lg font-semibold">Check in</Text>
              <Text className="text-white text-lg">{checkInTime}</Text>
            </View>

            {/* Work Report Input */}
            <View className="bg-gray-800 rounded-2xl p-4">
              <Text className="text-gray-300 mb-3 font-medium">
                Nhập báo cáo công việc hiện tại
              </Text>
              <TouchableOpacity
                className="bg-gray-700 rounded-lg py-3 px-4"
                onPress={() => setShowReportModal(true)}
              >
                <Text className="text-gray-400">
                  {workReport || "Nhập báo cáo công việc..."}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Swipe to Check Out */}
            <View className="bg-gray-800 rounded-2xl p-1 relative overflow-hidden">
              <Animated.View
                {...panResponder.panHandlers}
                style={{
                  transform: [{ translateX: slideAnim }],
                }}
                className="bg-green-500 rounded-xl py-3 px-6 flex-row items-center gap-3 w-32"
              >
                <Ionicons name="chevron-forward" size={20} color="white" />
              </Animated.View>

              <View className="absolute inset-0 flex-row items-center justify-center">
                <Text className="text-gray-400 font-medium">
                  Vuốt để check out →
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Attendance Analysis */}
      <View className="mx-4 mb-6">
        <View className="bg-gray-800 rounded-2xl p-4">
          <Text className="text-white text-lg font-semibold mb-4">
            Phân tích chuyên cần
          </Text>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-400">Hôm nay</Text>
            <Text className="text-green-400 font-semibold">Đúng giờ</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-400">Tuần này</Text>
            <Text className="text-white font-semibold">4/5 ngày</Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-400">Tháng này</Text>
            <Text className="text-white font-semibold">18/22 ngày</Text>
          </View>

          <View className="h-px bg-gray-700 my-3" />

          <View className="flex-row justify-between">
            <Text className="text-gray-400">Tổng giờ làm việc</Text>
            <Text className="text-white font-semibold">168h</Text>
          </View>
        </View>
      </View>

      {/* Work Report Modal */}
      <WorkReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSave={(report) => setWorkReport(report)}
        currentReport={workReport}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;
