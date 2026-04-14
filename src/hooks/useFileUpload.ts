import { useCallback, useRef, useState } from 'react';
import { ACCEPTED_EXTENSIONS, ACCEPTED_MIME_TYPES } from '../types';

export interface FileValidationError {
  type: 'invalid_type' | 'multiple_files' | 'empty';
  message: string;
}

export function useFileUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<FileValidationError | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((files: FileList | File[]): File | FileValidationError => {
    const fileArray = Array.from(files);

    if (fileArray.length === 0) {
      return { type: 'empty', message: 'No file selected.' };
    }

    if (fileArray.length > 1) {
      return {
        type: 'multiple_files',
        message: 'Only one file can be uploaded at a time. Please select a single file.',
      };
    }

    const file = fileArray[0];
    const isAccepted =
      Object.keys(ACCEPTED_MIME_TYPES).includes(file.type) ||
      ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!isAccepted) {
      return {
        type: 'invalid_type',
        message: `"${file.name}" is not a supported format. Please upload a PDF, Word document (.doc/.docx), plain text (.txt), or image (.png, .jpg, .jpeg).`,
      };
    }

    return file;
  }, []);

  const processFiles = useCallback(
    (files: FileList | File[]) => {
      const result = validateFile(files);

      if (result instanceof File) {
        setSelectedFile(result);
        setValidationError(null);
      } else {
        setValidationError(result);
        setSelectedFile(null);
      }
    },
    [validateFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        processFiles(e.target.files);
      }
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    if (inputRef.current) inputRef.current.value = '';
  }, []);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    selectedFile,
    validationError,
    isDragging,
    inputRef,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearFile,
    openFilePicker,
  };
}
