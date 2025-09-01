import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WorkReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (report: string) => void;
  currentReport?: string;
}

const WorkReportModal: React.FC<WorkReportModalProps> = ({
  visible,
  onClose,
  onSave,
  currentReport = "",
}) => {
  const [report, setReport] = useState(currentReport);

  const handleSave = () => {
    onSave(report);
    onClose();
  };

  const handleClose = () => {
    setReport(currentReport);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 bg-gray-900">
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-4 border-b border-gray-700">
            <TouchableOpacity onPress={handleClose} className="p-2">
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-lg font-semibold">
              Báo cáo công việc
            </Text>

            <TouchableOpacity
              onPress={handleSave}
              className="bg-blue-500 px-4 py-2 rounded-lg"
            >
              <Text className="text-white font-medium">Lưu</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4 py-6">
            {/* Current Time */}
            <View className="bg-gray-800 rounded-xl p-4 mb-6">
              <View className="flex-row items-center gap-3 mb-2">
                <Ionicons name="time" size={20} color="#10B981" />
                <Text className="text-white font-medium">
                  Thời gian hiện tại
                </Text>
              </View>
              <Text className="text-gray-300 text-lg">
                {new Date().toLocaleTimeString("vi-VN", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                - {new Date().toLocaleDateString("vi-VN")}
              </Text>
            </View>

            {/* Report Input */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">
                Mô tả công việc đang thực hiện
              </Text>

              <TextInput
                className="bg-gray-800 rounded-xl p-4 text-white text-base min-h-32"
                value={report}
                onChangeText={setReport}
                placeholder="Nhập mô tả chi tiết về công việc bạn đang thực hiện..."
                placeholderTextColor="#6B7280"
                multiline
                textAlignVertical="top"
                style={{ lineHeight: 24 }}
              />

              <Text className="text-gray-400 text-sm mt-2">
                {report.length}/500 ký tự
              </Text>
            </View>

            {/* Quick Templates */}
            <View className="mb-6">
              <Text className="text-white text-lg font-semibold mb-3">
                Mẫu nhanh
              </Text>

              <View className="gap-3">
                {[
                  "Đang họp với team về dự án mới",
                  "Phát triển tính năng cho ứng dụng",
                  "Xử lý email và phản hồi khách hàng",
                  "Nghiên cứu và phân tích dữ liệu",
                  "Chuẩn bị báo cáo tuần",
                ].map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setReport(template)}
                    className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                  >
                    <Text className="text-gray-300">{template}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Note */}
            <View className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
              <View className="flex-row items-center gap-2 mb-2">
                <Ionicons name="information-circle" size={20} color="#3B82F6" />
                <Text className="text-blue-400 font-medium">Lưu ý</Text>
              </View>
              <Text className="text-blue-300 text-sm leading-5">
                Báo cáo công việc sẽ được ghi lại trong hệ thống chấm công. Hãy
                mô tả cụ thể và chính xác các hoạt động bạn đang thực hiện.
              </Text>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WorkReportModal;
