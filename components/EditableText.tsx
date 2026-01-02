import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Check, X } from 'lucide-react-native';

interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  style?: any;
  textStyle?: any;
  color: string;
  multiline?: boolean;
  placeholder?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  style,
  textStyle,
  color,
  multiline = false,
  placeholder,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEditing) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isEditing, fadeAnim]);

  const handleSave = () => {
    if (editValue.trim() && editValue !== value) {
      onSave(editValue.trim());
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Pressable onPress={() => setIsEditing(true)} style={style}>
        <Text style={textStyle}>{value || placeholder}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.editContainer, style]}>
      <TextInput
        value={editValue}
        onChangeText={setEditValue}
        style={[styles.input, textStyle, { borderColor: color }]}
        autoFocus
        multiline={multiline}
        onBlur={handleSave}
        placeholder={placeholder}
        placeholderTextColor={color + '60'}
      />
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <Pressable
          style={[styles.actionButton, { backgroundColor: '#22C55E' }]}
          onPress={handleSave}
        >
          <Check color="#FFF" size={16} />
        </Pressable>
        <Pressable
          style={[styles.actionButton, { backgroundColor: '#EF4444' }]}
          onPress={handleCancel}
        >
          <X color="#FFF" size={16} />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  editContainer: {
    gap: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
});
