import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { View, Text, Dimensions } from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface SimpleMapViewProps {
  userLocation: LocationCoords;
  workLocation: LocationCoords;
  showsUserLocation?: boolean;
}

export interface SimpleMapViewRef {
  zoomIn: () => void;
  zoomOut: () => void;
  centerToUser: () => void;
}

const SimpleMapView = forwardRef<SimpleMapViewRef, SimpleMapViewProps>(
  ({ userLocation, workLocation, showsUserLocation = true }, ref) => {
    // Tạo HTML cho OpenStreetMap với Leaflet
    const createMapHTML = () => {
      return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>OpenStreetMap</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body { margin: 0; padding: 0; }
            #map { height: 100vh; width: 100vw; }
            
            /* Ẩn hoàn toàn tất cả attribution và watermark */
            .leaflet-control-attribution {
                display: none !important;
            }
            
            .leaflet-bottom {
                display: none !important;
            }
            
            .leaflet-left {
                display: none !important;
            }
            
            .leaflet-right .leaflet-control {
                display: none !important;
            }
            
            .leaflet-control {
                display: none !important;
            }
            
            /* Ẩn tất cả link và text credit */
            a[href*="leaflet"] {
                display: none !important;
            }
            
            a[href*="openstreetmap"] {
                display: none !important;
            }
            
            .leaflet-control-attribution * {
                display: none !important;
            }
            
            /* Ẩn bất kỳ text attribution nào */
            .leaflet-container .leaflet-control-attribution {
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // Khởi tạo bản đồ với tất cả control bị tắt
            var map = L.map('map', {
                attributionControl: false,
                zoomControl: false,  // Tắt zoom control mặc định
                minZoom: 10,
                maxZoom: 19
            }).setView([${userLocation.latitude}, ${userLocation.longitude}], 16);
            
            // Lưu reference toàn cục để có thể điều khiển từ React Native
            window.mapInstance = map;
            
            // Thêm tile layer từ OpenStreetMap không có attribution
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: ''
            }).addTo(map);
            
            // Icon cho vị trí người dùng
            var userIcon = L.divIcon({
                html: '<div style="background: #3B82F6; width: 12px; height: 12px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59, 130, 246, 0.6);"></div>',
                iconSize: [18, 18],
                className: 'user-location-icon'
            });
            
            // Icon cho khu vực làm việc
            var workIcon = L.divIcon({
                html: '<div style="background: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><span style="color: white; font-size: 10px;">🏢</span></div>',
                iconSize: [26, 26],
                className: 'work-location-icon'
            });
            
            // Thêm marker vị trí người dùng
            ${
              showsUserLocation
                ? `
            window.userMarker = L.marker([${userLocation.latitude}, ${userLocation.longitude}], {icon: userIcon})
                .addTo(map)
                .bindPopup('Vị trí của bạn');
            `
                : ""
            }
            
            // Thêm marker khu vực làm việc
            L.marker([${workLocation.latitude}, ${workLocation.longitude}], {icon: workIcon})
                .addTo(map)
                .bindPopup('Khu vực làm việc');
            
            // Thêm vòng tròn khu vực làm việc (100m)
            L.circle([${workLocation.latitude}, ${workLocation.longitude}], {
                color: '#22C55E',
                fillColor: '#22C55E',
                fillOpacity: 0.2,
                radius: 100
            }).addTo(map).bindPopup('Khu vực check-in (100m)');
            
            // Vô hiệu hóa scroll zoom để không xung đột với scroll của app
            map.scrollWheelZoom.disable();
            
            // Thêm các functions để điều khiển bản đồ từ React Native
            window.zoomIn = function() {
                map.zoomIn();
            };
            
            window.zoomOut = function() {
                map.zoomOut();
            };
            
            window.centerToUser = function() {
                map.setView([${userLocation.latitude}, ${userLocation.longitude}], 16);
            };
            
            window.updateUserLocation = function(lat, lng) {
                map.setView([lat, lng], 16);
                // Update user marker if exists
                if (window.userMarker) {
                    window.userMarker.setLatLng([lat, lng]);
                }
            };
            
            window.setMapView = function(lat, lng, zoom) {
                map.setView([lat, lng], zoom || 16);
            };
            
            // Xóa hoàn toàn mọi attribution có thể xuất hiện
            setTimeout(() => {
                var attributions = document.querySelectorAll('.leaflet-control-attribution, .leaflet-bottom, .leaflet-left, .leaflet-right, a[href*="leaflet"], a[href*="openstreetmap"]');
                attributions.forEach(function(el) {
                    el.style.display = 'none';
                    el.remove();
                });
            }, 100);
        </script>
    </body>
    </html>
    `;
    };

    const webViewRef = useRef<WebView>(null);

    // Expose zoom functions to parent component
    useImperativeHandle(ref, () => ({
      zoomIn: () => {
        webViewRef.current?.injectJavaScript("window.zoomIn();");
      },
      zoomOut: () => {
        webViewRef.current?.injectJavaScript("window.zoomOut();");
      },
      centerToUser: () => {
        webViewRef.current?.injectJavaScript("window.centerToUser();");
      },
    }));

    return (
      <View style={{ flex: 1 }}>
        <WebView
          ref={webViewRef}
          source={{ html: createMapHTML() }}
          style={{ flex: 1 }}
          scrollEnabled={false}
          bounces={false}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={(event) => {
            const message = event.nativeEvent.data;
            switch (message) {
              case "zoomIn":
                webViewRef.current?.injectJavaScript("window.zoomIn();");
                break;
              case "zoomOut":
                webViewRef.current?.injectJavaScript("window.zoomOut();");
                break;
              case "centerToUser":
                webViewRef.current?.injectJavaScript("window.centerToUser();");
                break;
            }
          }}
          onError={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            console.warn("WebView error: ", nativeEvent);
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View className="flex-1 bg-gray-200 items-center justify-center">
              <Ionicons name="map-outline" size={48} color="#6B7280" />
              <Text className="text-gray-600 mt-2">Đang tải bản đồ...</Text>
            </View>
          )}
        />
      </View>
    );
  }
);

export default SimpleMapView;
