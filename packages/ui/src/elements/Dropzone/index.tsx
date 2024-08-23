'use client'
import React from 'react'

import { useTranslation } from '../../providers/Translation/index.js'
import { Button } from '../Button/index.js'
import './index.scss'

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
}

const baseClass = 'dropzone'

export type Props = {
  readonly children?: React.ReactNode
  readonly className?: string
  readonly mimeTypes?: string[]
  readonly multipleFiles?: boolean
  readonly onChange: (e: FileList) => void
  readonly onPasteUrlClick?: () => void
}

export const Dropzone: React.FC<Props> = ({
  children,
  className,
  mimeTypes,
  multipleFiles,
  onChange,
  onPasteUrlClick,
}) => {
  const dropRef = React.useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef(null)

  const { t } = useTranslation()

  const addFiles = React.useCallback(
    (files: FileList) => {
      if (!multipleFiles && files.length > 1) {
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(files[0])
        onChange(dataTransfer.files)
      } else {
        onChange(files)
      }
    },
    [multipleFiles, onChange],
  )

  const handlePaste = React.useCallback(
    (e: ClipboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.clipboardData.files && e.clipboardData.files.length > 0) {
        addFiles(e.clipboardData.files)
      }
    },
    [addFiles],
  )

  const handleDragEnter = React.useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(true)
  }, [])

  const handleDragLeave = React.useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragging(false)
  }, [])

  const handleDrop = React.useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragging(false)

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
        setDragging(false)

        e.dataTransfer.clearData()
      }
    },
    [addFiles],
  )

  const handleFileSelection = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
      }
    },
    [addFiles],
  )

  React.useEffect(() => {
    const div = dropRef.current

    if (div) {
      div.addEventListener('dragenter', handleDragEnter)
      div.addEventListener('dragleave', handleDragLeave)
      div.addEventListener('dragover', handleDragOver)
      div.addEventListener('drop', handleDrop)
      div.addEventListener('paste', handlePaste)

      return () => {
        div.removeEventListener('dragenter', handleDragEnter)
        div.removeEventListener('dragleave', handleDragLeave)
        div.removeEventListener('dragover', handleDragOver)
        div.removeEventListener('drop', handleDrop)
        div.removeEventListener('paste', handlePaste)
      }
    }

    return () => null
  }, [handleDragEnter, handleDragLeave, handleDrop, handlePaste])

  const classes = [baseClass, className, dragging ? 'dragging' : ''].filter(Boolean).join(' ')

  return (
    <div className={classes} ref={dropRef}>
      <Button
        buttonStyle="secondary"
        className={`${baseClass}__file-button`}
        onClick={() => {
          inputRef.current.click()
        }}
        size="medium"
      >
        {t('upload:selectFile')}
      </Button>
      {typeof onPasteUrlClick === 'function' && (
        <Button
          buttonStyle="secondary"
          className={`${baseClass}__file-button`}
          onClick={onPasteUrlClick}
          size="medium"
        >
          {t('upload:pasteURL')}
        </Button>
      )}
      <input
        accept={mimeTypes?.join(',')}
        aria-hidden="true"
        className={`${baseClass}__hidden-input`}
        multiple={multipleFiles}
        onChange={handleFileSelection}
        ref={inputRef}
        type="file"
      />

      {children}

      <p className={`${baseClass}__label`}>
        {t('general:or')} {t('upload:dragAndDrop')}
      </p>
    </div>
  )
}
