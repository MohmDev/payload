'use client'
import type { FilterOptionsResult, PaginatedDocs } from 'payload'

import React, { Fragment, useCallback, useMemo } from 'react'

import type { useSelection } from '../../../providers/Selection/index.js'
import type { UploadFieldPropsWithContext } from '../HasOne/index.js'

import { AddNewRelation } from '../../../elements/AddNewRelation/index.js'
import { BulkUploadDrawer } from '../../../elements/BulkUpload/index.js'
import { Button } from '../../../elements/Button/index.js'
import { DraggableSortable } from '../../../elements/DraggableSortable/index.js'
import { Dropzone } from '../../../elements/Dropzone/index.js'
import { FileDetails } from '../../../elements/FileDetails/index.js'
import { useListDrawer } from '../../../elements/ListDrawer/index.js'
import { useConfig } from '../../../providers/Config/index.js'
import { useTranslation } from '../../../providers/Translation/index.js'

const baseClass = 'upload upload--has-many'

import { useModal } from '@faceless-ui/modal'

import './index.scss'

export const UploadComponentHasMany: React.FC<
  {
    fileDocs: PaginatedDocs['docs']
    onFileSelection?: (files: FileList) => void
    setValue?: (value: string[]) => void
  } & UploadFieldPropsWithContext<string[]>
> = (props) => {
  const {
    canCreate,
    drawerSlug,
    field: {
      _path,
      admin: { isSortable },
      hasMany,
      relationTo,
    },
    fieldHookResult: { filterOptions: filterOptionsFromProps, setValue, value },
    fileDocs,
    onChange,
    onFileSelection,
    onUploadSuccess,
    readOnly,
    selectedFiles,
  } = props

  const { openModal } = useModal()
  const { t } = useTranslation()

  const {
    config: { collections },
  } = useConfig()

  const filterOptions: FilterOptionsResult = useMemo(() => {
    if (typeof relationTo === 'string') {
      return {
        ...filterOptionsFromProps,
        [relationTo]: {
          ...((filterOptionsFromProps?.[relationTo] as any) || {}),
          id: {
            ...((filterOptionsFromProps?.[relationTo] as any)?.id || {}),
            not_in: (filterOptionsFromProps?.[relationTo] as any)?.id?.not_in || value,
          },
        },
      }
    }
  }, [value, relationTo, filterOptionsFromProps])

  function moveItemInArray<T>(array: T[], moveFromIndex: number, moveToIndex: number): T[] {
    const newArray = [...array]
    const [item] = newArray.splice(moveFromIndex, 1)

    newArray.splice(moveToIndex, 0, item)

    return newArray
  }

  const moveRow = useCallback(
    (moveFromIndex: number, moveToIndex: number) => {
      const updatedArray = moveItemInArray(value, moveFromIndex, moveToIndex)
      setValue(updatedArray)
    },
    [value, setValue],
  )

  const removeItem = useCallback(
    (index: number) => {
      const updatedArray = [...(value || [])]
      updatedArray.splice(index, 1)
      setValue(updatedArray.length === 0 ? [] : updatedArray)
    },
    [value, setValue],
  )

  const [ListDrawer, ListDrawerToggler] = useListDrawer({
    collectionSlugs:
      typeof relationTo === 'string'
        ? [relationTo]
        : collections.map((collection) => collection.slug),
    filterOptions,
  })

  const collection = collections.find((coll) => coll.slug === relationTo)

  // Get the labels of the collections that the relation is to
  const labels = useMemo(() => {
    function joinWithCommaAndOr(items: string[]): string {
      const or = t('general:or')

      if (items.length === 0) return ''
      if (items.length === 1) return items[0]
      if (items.length === 2) return items.join(` ${or} `)

      return items.slice(0, -1).join(', ') + ` ${or} ` + items[items.length - 1]
    }

    const labels = []

    collections.forEach((collection) => {
      if (relationTo.includes(collection.slug)) {
        labels.push(collection.labels?.singular || collection.slug)
      }
    })

    return joinWithCommaAndOr(labels)
  }, [collections, relationTo, t])

  const onListSelect = useCallback(
    (selections: ReturnType<typeof useSelection>['selected']) => {
      const selectedIDs = Object.entries(selections).reduce(
        (acc, [key, value]) => (value ? [...acc, key] : acc),
        [] as string[],
      )
      onChange(selectedIDs)
    },
    [onChange],
  )

  return (
    <Fragment>
      <div className={[baseClass].join(' ')}>
        {/* <Dropzone multipleFiles={true} onChange={onFileSelection}>
        </Dropzone> */}
        <DraggableSortable
          className={`${baseClass}__draggable-rows`}
          ids={value.map((id) => String(id))}
          onDragEnd={({ moveFromIndex, moveToIndex }) => moveRow(moveFromIndex, moveToIndex)}
        >
          {Boolean(value.length) &&
            value.map((id, index) => {
              const doc = fileDocs.find((doc) => doc.id === id)
              const uploadConfig = collection?.upload

              if (!doc) {
                return null
              }

              return (
                <FileDetails
                  collectionSlug={relationTo}
                  doc={doc}
                  hasMany={true}
                  isSortable={isSortable}
                  key={id}
                  removeItem={removeItem}
                  rowIndex={index}
                  uploadConfig={uploadConfig}
                />
              )
            })}
        </DraggableSortable>
      </div>

      <BulkUploadDrawer
        collectionSlug={relationTo}
        drawerSlug={drawerSlug}
        initialFiles={selectedFiles}
        onSuccess={onUploadSuccess}
      />

      <div className={[`${baseClass}__controls`].join(' ')}>
        <div className={[`${baseClass}__buttons`].join(' ')}>
          {canCreate && hasMany && (
            <div className={[`${baseClass}__add-new`].join(' ')}>
              {/* <AddNewRelation
                Button={
                  <Button
                    buttonStyle="icon-label"
                    el="span"
                    icon="plus"
                    iconPosition="left"
                    iconStyle="with-border"
                  >
                    {t('fields:addNew')}
                  </Button>
                }
                hasMany={hasMany}
                path={_path}
                relationTo={relationTo}
                setValue={setValue}
                unstyled
                value={value}
              /> */}
              <Button
                buttonStyle="icon-label"
                el="span"
                icon="plus"
                iconPosition="left"
                iconStyle="with-border"
                onClick={() => openModal(drawerSlug)}
              >
                {t('fields:addNew')}
              </Button>
            </div>
          )}
          <ListDrawerToggler className={`${baseClass}__toggler`} disabled={readOnly}>
            <div>
              <Button
                buttonStyle="icon-label"
                el="span"
                icon="plus"
                iconPosition="left"
                iconStyle="with-border"
              >
                {t('fields:chooseFromExisting')}
              </Button>
            </div>
          </ListDrawerToggler>
        </div>
        {hasMany && (
          <button
            className={`${baseClass}__clear-all`}
            onClick={() => setValue(null)}
            type="button"
          >
            Clear all
          </button>
        )}
      </div>
      <ListDrawer
        enableRowSelections={hasMany}
        onBulkSelect={onListSelect}
        onSelect={({ docID }) => onListSelect({ [docID]: true })}
      />
    </Fragment>
  )
}
