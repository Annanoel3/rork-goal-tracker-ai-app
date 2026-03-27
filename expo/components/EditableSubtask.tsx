import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import { Check, Trash2, Plus } from 'lucide-react-native';

interface EditableSubtaskProps {
  subtask?: {
    subtaskId: string;
    title: string;
    status: 'not_started' | 'completed';
  };
  isNew?: boolean;
  onToggle?: () => void;
  onUpdate?: (title: string) => void;
  onDelete?: () => void;
  onCreate?: (title: string) => void;
  colors: any;
}

export const EditableSubtask: React.FC<EditableSubtaskProps> = ({
  subtask,
  isNew = false,
  onToggle,
  onUpdate,
  onDelete,
  onCreate,
  colors,
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [editValue, setEditValue] = useState(subtask?.title || '');
  const [showDelete, setShowDelete] = useState(false);

  const handleSave = () => {
    if (editValue.trim()) {
      if (isNew && onCreate) {
        onCreate(editValue.trim());
        setEditValue('');
      } else if (onUpdate && editValue !== subtask?.title) {
        onUpdate(editValue.trim());
        setIsEditing(false);
      } else {
        setIsEditing(false);
      }
    } else {
      setEditValue(subtask?.title || '');
      setIsEditing(false);
    }
  };

  const handleLongPress = () => {
    if (!isNew) {
      setShowDelete(true);
    }
  };

  if (isNew && !isEditing) {
    return (
      <Pressable
        style={[styles.addButton, { borderColor: colors.border }]}
        onPress={() => setIsEditing(true)}
      >
        <Plus color={colors.primary} size={16} />
        <Text style={[styles.addText, { color: colors.primary }]}>Add subtask</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={styles.subtaskRow}
      onPress={onToggle}
      onLongPress={handleLongPress}
      delayLongPress={500}
    >
      {!isNew && (
        <Pressable
          style={[
            styles.checkbox,
            {
              backgroundColor:
                subtask?.status === 'completed' ? colors.primary : 'transparent',
              borderColor: colors.border,
            },
          ]}
          onPress={onToggle}
        >
          {subtask?.status === 'completed' && <Check color="#FFF" size={12} />}
        </Pressable>
      )}

      {isEditing ? (
        <View style={styles.editRow}>
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            autoFocus
            onBlur={handleSave}
            onSubmitEditing={handleSave}
            placeholder="Subtask title"
            placeholderTextColor={colors.textSecondary}
          />
        </View>
      ) : (
        <Pressable onPress={() => setIsEditing(true)} style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              {
                color: subtask?.status === 'completed' ? colors.textSecondary : colors.text,
                textDecorationLine: subtask?.status === 'completed' ? 'line-through' : 'none',
              },
            ]}
          >
            {subtask?.title}
          </Text>
        </Pressable>
      )}

      {showDelete && onDelete && (
        <Pressable
          style={[styles.deleteButton, { backgroundColor: colors.error }]}
          onPress={() => {
            onDelete();
            setShowDelete(false);
          }}
        >
          <Trash2 color="#FFF" size={14} />
        </Pressable>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  subtaskRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
  },
  editRow: {
    flex: 1,
    flexDirection: 'row' as const,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  addButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed' as const,
  },
  addText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
});
