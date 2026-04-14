import type { KeyboardEvent, RefObject } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CloudUpload, UploadCloud } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { ACCEPTED_EXTENSIONS } from '../../types';
import { AlertMessage } from './AlertMessage';
import { FilePreview } from './FilePreview';

interface FileUploadZoneProps {
  onUpload: (file: File) => void;
  sectionRef?: RefObject<HTMLElement>;
}

export function FileUploadZone({ onUpload, sectionRef }: FileUploadZoneProps) {
  const {
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
  } = useFileUpload();

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      clearFile();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !selectedFile) {
      e.preventDefault();
      openFilePicker();
    }
  };

  return (
    <section
      ref={sectionRef as RefObject<HTMLElement>}
      aria-labelledby="upload-heading"
      className="w-full max-w-2xl mx-auto px-4 sm:px-6"
    >
      {/* Section heading (visually present but styled subtly) */}
      <div className="mb-5 text-center">
        <h2
          id="upload-heading"
          className="text-xl sm:text-2xl text-foreground tracking-tight"
          style={{ fontWeight: 600 }}
        >
          Upload your document
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Supports PDF, Word (.doc/.docx), plain text, and images (PNG/JPG)
        </p>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag and drop your file here, or press Enter to browse"
        aria-describedby={validationError ? 'upload-error' : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onClick={!selectedFile ? openFilePicker : undefined}
        className={`
          relative flex flex-col items-center justify-center
          w-full min-h-48 rounded-2xl
          border-2 border-dashed
          transition-all duration-200
          cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          ${
            isDragging
              ? 'border-primary bg-primary/8 scale-[1.01]'
              : 'border-primary/25 hover:border-primary/50 hover:bg-primary/5 bg-white dark:bg-muted/20'
          }
          ${selectedFile ? 'cursor-default' : ''}
        `}
      >
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          id="file-input"
          aria-label="Choose a file to upload"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="sr-only"
          onChange={handleFileSelect}
        />

        <AnimatePresence mode="wait">
          {selectedFile ? (
            /* File selected state */
            <motion.div
              key="file-selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full p-5 flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <FilePreview file={selectedFile} onRemove={clearFile} />
            </motion.div>
          ) : (
            /* Idle / drag state */
            <motion.div
              key="drop-prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center gap-3 py-8 px-6 select-none"
            >
              <motion.div
                animate={{ y: isDragging ? -6 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className={`
                  flex items-center justify-center w-14 h-14 rounded-2xl
                  transition-colors duration-200
                  ${isDragging ? 'bg-primary/15' : 'bg-accent dark:bg-muted'}
                `}
                aria-hidden="true"
              >
                {isDragging ? (
                  <CloudUpload size={26} className="text-primary" />
                ) : (
                  <UploadCloud size={26} className="text-primary dark:text-muted-foreground" />
                )}
              </motion.div>

              <div className="text-center space-y-1">
                <p className="text-sm text-foreground" style={{ fontWeight: 500 }}>
                  {isDragging ? (
                    <span className="text-primary">Drop your file here</span>
                  ) : (
                    <>
                      <span className="text-primary underline underline-offset-2">
                        Click to browse
                      </span>{' '}
                      or drag & drop
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, DOC, TXT, PNG, JPG — max one file
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Validation error */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
          >
            <AlertMessage
              id="upload-error"
              message={validationError.message}
              variant="error"
              onDismiss={clearFile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload button */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="mt-4"
          >
            <button
              onClick={handleUpload}
              aria-label={`Upload ${selectedFile.name} and convert to audiobook`}
              className="
                w-full inline-flex items-center justify-center gap-2
                px-5 py-3 rounded-xl
                bg-primary text-primary-foreground
                transition-all duration-200
                hover:opacity-90 hover:shadow-lg hover:shadow-primary/20
                active:opacity-80
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
                cursor-pointer
              "
              style={{ fontWeight: 600 }}
            >
              <UploadCloud size={16} aria-hidden="true" />
              Convert to Audiobook
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}